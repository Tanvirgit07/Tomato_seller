"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

interface Category {
  _id: string;
  categoryName: string;
}

interface SubCategory {
  _id: string;
  name: string;
  description: string;
  image?: string;
  category: Category;
}

const formSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Subcategory name must be at least 2 characters." }),
  categoryId: z
    .string()
    .min(1, { message: "Please select a parent category." }),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must not exceed 500 characters"),
  image: z.any().optional(),
});

export function EditRequestedSubCategory() {
  const params = useParams();
  const id = params.id;
  const [preview, setPreview] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      categoryId: "",
      description: "",
      image: null,
    },
  });

  // Fetch subcategory data
  const { data: subCategory, isLoading } = useQuery<SubCategory>({
    queryKey: ["sub-category", id],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/subcategory/getsinglesubcategory/${id}`
      );
      if (!res.ok) throw new Error("Failed to fetch subcategory");
      const data = await res.json();
      return data.data;
    },
  });

  // Fetch categories for select
  const { data: categories, isLoading: categoriesLoading } = useQuery<
    Category[]
  >({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/category/allcategory`
      );
      if (!res.ok) throw new Error("Failed to fetch categories");
      const data = await res.json();
      return data.data;
    },
  });

  // Reset form when both subcategory and categories data are loaded
  useEffect(() => {
    if (
      subCategory &&
      categories &&
      !categoriesLoading &&
      categories.length > 0
    ) {
      const categoryId = subCategory.category?._id || "";

      // Use setTimeout to ensure the Select component is ready
      setTimeout(() => {
        form.setValue("name", subCategory.name);
        form.setValue("categoryId", categoryId);
        form.setValue("description", subCategory.description);
        form.setValue("image", null);
      }, 100);

      setPreview(subCategory.image || null);
    }
  }, [subCategory, categories, categoriesLoading, form]);
  // useEffect(() => {
  //   form.reset({
  //     name: subCategory?.name || "",
  //     categoryId: subCategory?.category?._id || "",
  //     description: subCategory?.description || "",
  //     image: null,
  //   });
  //   setPreview(subCategory?.image || null);
  // }, [subCategory, form]);

  // Mutation to update subcategory
  const updateSubCategoryMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/subcategory/updatesubcategory/${id}`,
        {
          method: "PUT",
          body: formData,
        }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to update subcategory");
      }
      return res.json();
    },
    onSuccess: (data) => {
      toast.success(data.message || "Subcategory updated successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Submit handler
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("category", values.categoryId);
    formData.append("description", values.description);
    if (values.image) formData.append("image", values.image);
    updateSubCategoryMutation.mutate(formData);
  };

  if (isLoading || categoriesLoading) return <p>Loading...</p>;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Edit Subcategory
          </h1>
          <nav className="flex items-center text-sm text-gray-500 mt-2">
            <Link
              href="/dashboard"
              className="hover:text-gray-700 transition-colors"
            >
              Dashboard
            </Link>
            <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
            <span className="text-gray-900 font-medium">Edit Subcategory</span>
          </nav>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="flex justify-between gap-8">
            <div className="w-[60%] space-y-6">
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">
                      Subcategory Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="h-[50px]"
                        placeholder="Enter subcategory name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={() => (
                  <FormItem>
                    <FormLabel className="font-semibold">Description</FormLabel>
                    <FormControl>
                      <Controller
                        name="description"
                        control={form.control}
                        render={({ field }) => (
                          <ReactQuill
                            theme="snow"
                            value={field.value}
                            onChange={field.onChange}
                            className="min-h-[300px]"
                          />
                        )}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex-1 space-y-6">
              {/* Parent Category */}
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">
                      Parent Category
                    </FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={!categories || categories.length === 0}
                      >
                        <SelectTrigger className="!h-[50px] w-full">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories && categories.length > 0 ? (
                            categories.map((cat) => (
                              <SelectItem key={cat._id} value={cat._id}>
                                {cat.categoryName}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="none" disabled>
                              No categories found
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Image Upload */}
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">
                      Upload Image
                    </FormLabel>
                    <FormControl>
                      <input
                        type="file"
                        accept="image/*"
                        className="border border-gray-300 rounded px-3 py-3 w-full"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          field.onChange(file);
                          if (file) setPreview(URL.createObjectURL(file));
                        }}
                      />
                    </FormControl>
                    {preview && (
                      <div className="w-full h-[268px] relative mt-4">
                        <Image
                          src={preview}
                          alt="preview"
                          fill
                          className="rounded border object-cover"
                        />
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <Button
              type="submit"
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg shadow-md"
              disabled={updateSubCategoryMutation.isPending}
            >
              {updateSubCategoryMutation.isPending
                ? "Updating..."
                : "Update Subcategory"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
