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
  productName: z
    .string()
    .min(2, { message: "Product name must be at least 2 characters." }),
  price: z.preprocess(
    (val) => Number(val),
    z.number().min(0, "Price cannot be negative")
  ),
  stock: z.preprocess(
    (val) => Number(val),
    z.number().min(0, "Price cannot be negative")
  ),
  discountPrice: z.preprocess(
    (val) => Number(val),
    z.number().min(0, "Discount cannot be negative")
  ),
  categoryId: z
    .string()
    .min(1, { message: "Please select a parent category." }),
  subCategoryId: z
    .string()
    .min(1, { message: "Please select a parent subcategory." }),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must not exceed 500 characters"),
  image: z.any().optional(),
  subImages: z
    .any()
    .optional()
    .refine(
      (files) => !files || files.length <= 5,
      "You can upload up to 5 additional images."
    ),
});

export function RejectedAddProduct() {
  const [preview, setPreview] = useState<string | null>(null);
  const [additionalPreviews, setAdditionalPreviews] = useState<string[]>([]);
  const { data: session } = useSession();
  const user = session?.user as any;
  const token = user?.accessToken;
  console.log(token);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productName: "",
      price: 0,
      discountPrice: 0,
      categoryId: "",
      subCategoryId: "",
      description: "",
      image: null,
      subImages: null,
      stock: 0,
    },
  });

  const { data: category } = useQuery({
    queryKey: ["category"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/category/allcategory`
      );
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
  });

  const { data: subcategory } = useQuery({
    queryKey: ["subcategory"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/subcategory/getallsubcategory`
      );
      if (!res.ok) throw new Error("Failed to fetch subcategories");
      return res.json();
    },
  });

  const createProductMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/food/careatefood`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`, // Content-Type দেওয়া যাবে না
          },
          body: data,
        }
      );
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create product");
      }
      return res.json();
    },
    onSuccess: (data) =>
      toast.success(data.message || "Product created successfully"),
    onError: (error) => toast.error(error.message),
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const formData = new FormData();
    formData.append("name", values.productName);
    formData.append("price", values.price.toString());
    formData.append("discountPrice", values.discountPrice.toString());
    formData.append("categoryId", values.categoryId);
    formData.append("subCategoryId", values.subCategoryId);
    formData.append("description", values.description);
    formData.append("stock", values?.stock.toString());

    if (values.image) formData.append("image", values.image);

    if (values.subImages) {
      const files = Array.from(values.subImages as FileList);
      files.forEach((file) => {
        formData.append("subImages", file);
      });
    }

    createProductMutation.mutate(formData);
  };

  return (
    <div className="">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Add Product
          </h1>
          <nav className="flex items-center text-sm text-gray-500 mt-2">
            <Link
              href="/dashboard"
              className="hover:text-gray-700 transition-colors"
            >
              Dashboard
            </Link>
            <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
            <span className="text-gray-900 font-medium">Add Product</span>
          </nav>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="flex justify-between gap-8">
            <div className="w-[60%] space-y-6">
              {/* Product Name */}
              <FormField
                control={form.control}
                name="productName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">
                      Product Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="h-[50px]"
                        placeholder="Enter product name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Price */}
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Price</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        className="h-[50px]"
                        placeholder="Enter price"
                        value={
                          typeof field.value === "number" ||
                          typeof field.value === "string"
                            ? field.value
                            : ""
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Discount Price */}
              <FormField
                control={form.control}
                name="discountPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">
                      Discount Price (%)
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        className="h-[50px]"
                        placeholder="Enter discount"
                        value={
                          typeof field.value === "number" ||
                          typeof field.value === "string"
                            ? field.value
                            : ""
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* stock */}
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">
                      Stock Products
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        className="h-[50px]"
                        placeholder="Enter stock"
                        value={
                          typeof field.value === "number" ||
                          typeof field.value === "string"
                            ? field.value
                            : ""
                        }
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
                            placeholder="Write product description..."
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="!h-[50px] w-full">
                          <SelectValue
                            placeholder="Select a category"
                            className="text-base"
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

              {/* Subcategory */}
              <FormField
                control={form.control}
                name="subCategoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">
                      Parent Subcategory
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="!h-[50px] w-full">
                          <SelectValue
                            placeholder="Select a subcategory"
                            className="text-base"
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {subcategory?.data?.map((sub: any) => (
                          <SelectItem key={sub._id} value={sub._id}>
                            {sub.name}
                          </SelectItem>
                        )) || <p>No subcategories found</p>}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Primary Image Upload */}
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">
                      Primary Image
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

                    {/* Always show bordered preview box */}
                    <div className="w-full h-[365px] border border-gray-300 rounded mt-4 relative flex items-center justify-center bg-gray-50">
                      {preview ? (
                        <Image
                          src={preview}
                          alt="preview"
                          fill
                          className="rounded object-cover"
                        />
                      ) : (
                        <span className="text-gray-400 text-center">
                          Preview will appear here
                        </span>
                      )}
                    </div>

                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Additional Images Upload */}
              <FormField
                control={form.control}
                name="subImages"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">
                      Additional Images (up to 5)
                    </FormLabel>
                    <FormControl>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="border border-gray-300 rounded px-3 py-3 w-full"
                        onChange={(e) => {
                          const files = e.target.files;
                          if (files) {
                            field.onChange(files);
                            const previews = Array.from(files)
                              .slice(0, 5)
                              .map((file) => URL.createObjectURL(file));
                            setAdditionalPreviews(previews);
                          }
                        }}
                      />
                    </FormControl>

                    {/* Always show bordered preview boxes */}
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <div
                          key={index}
                          className="w-full h-[180px] border border-gray-300 rounded relative flex items-center justify-center bg-gray-50"
                        >
                          {additionalPreviews[index] ? (
                            <Image
                              src={additionalPreviews[index]}
                              alt={`additional-preview-${index}`}
                              fill
                              className="rounded object-cover"
                            />
                          ) : (
                            <span className="text-gray-400 text-center">
                              Preview {index + 1}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

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
              Save Product
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
