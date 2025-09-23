"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import dynamic from "next/dynamic";
import { useState } from "react";

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

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

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

export function AddRequestedSubCategory() {
  const [preview, setPreview] = useState<string | null>(null);
  const { data: session } = useSession();
  const user = session?.user as any;
  const token = user?.accessToken;
  console.log(token);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      categoryId: "",
      description: "",
      image: null,
    },
  });

  const { data: category } = useQuery({
    queryKey: ["category"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/category/allcategory`
      );
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json(); // ✅ Return the data
    },
  });

  const createsubCategoryMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/subcategory/addsubcategory`,
        {
          method: "POST",
          headers: {
            // "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // 🔑 এখানে token পাঠানো হচ্ছে
          },
          body: data,
        }
      );

      if (!res.ok) {
        // Backend থেকে error এলে throw করব
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create subcategory");
      }

      // সফল হলে data return করব
      return res.json();
    },
    onSuccess: (data) => {
      toast.success(data.message || "Subcategory created successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // ✅ Submit Handler
  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Submitted Data:", values);
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("category", values.categoryId);
    formData.append("description", values.description);
    if (values.image) {
      formData.append("image", values.image);
    }
    createsubCategoryMutation.mutate(formData);
  }

  return (
    <div className="">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Sub Categories
          </h1>
          <nav className="flex items-center text-sm text-gray-500 mt-2">
            <Link
              href="/dashboard"
              className="hover:text-gray-700 transition-colors"
            >
              Dashboard
            </Link>
            <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
            <span className="text-gray-900 font-medium">ADD Categories</span>
          </nav>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="flex jbetween gap-8">
            <div className="w-[60%] space-y-6">
              {/* Subcategory Name */}
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
                        className="h-[50px]"
                        placeholder="Enter subcategory name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description with ReactQuill */}
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
                            placeholder="Write subcategory description..."
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
              {/* Parent Category Select */}
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">
                      Parent Category
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="!h-[50px] w-full">
                          <SelectValue
                            className="text-base"
                            placeholder="Select a category"
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {category?.data?.map((cat: any) => (
                          <SelectItem key={cat._id} value={cat._id}>
                            {cat.categoryName}
                          </SelectItem>
                        )) || <p>No categories found</p>}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Image Upload with Preview */}
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
                      <div className="w-full h-[268px] relative">
                        <Image
                          src={preview}
                          alt="preview"
                          fill
                          className="mt-4 rounded border border-gray-200 object-cover"
                        />
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg shadow-md"
            >
              Save Subcategory
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
