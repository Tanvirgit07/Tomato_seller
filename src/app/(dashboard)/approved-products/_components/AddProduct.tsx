/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { ArrowLeft, ChevronRight, Send, Upload, X } from "lucide-react";
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

export function AddProduct() {
  const [preview, setPreview] = useState<string | null>(null);
  const [additionalPreviews, setAdditionalPreviews] = useState<string[]>([]);
  const { data: session } = useSession();
  const user = session?.user as any;
  const token = user?.accessToken;

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
            Authorization: `Bearer ${token}`,
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
    onSuccess: (data) => {
      toast.success(data.message || "Product created successfully");
      form.reset();
      setPreview(null);
      setAdditionalPreviews([]);
    },
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
    <div className="min-h-screen">
      <div className="">
        {/* Header Section */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Add New Product
            </h1>
            <nav className="flex items-center text-sm text-gray-600">
              <Link
                href="/dashboard"
                className="hover:text-red-500 transition-colors"
              >
                Dashboard
              </Link>
              <ChevronRight className="w-4 h-4 mx-2" />
              <span className="text-red-500 font-medium">Add Product</span>
            </nav>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Product Information */}
              <div className="space-y-6">
                {/* Basic Information Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
                    Basic Information
                  </h2>

                  <div className="space-y-5">
                    {/* Product Name */}
                    <FormField
                      control={form.control}
                      name="productName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold text-gray-700">
                            Product Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="h-12 border-gray-300 focus:border-red-500 focus:ring-red-500 rounded-lg"
                              placeholder="Enter product name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Price & Discount Row */}
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-semibold text-gray-700">
                              Price (৳)
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                className="h-12 border-gray-300 focus:border-red-500 focus:ring-red-500 rounded-lg"
                                placeholder="0.00"
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

                      <FormField
                        control={form.control}
                        name="discountPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-semibold text-gray-700">
                              Discount (%)
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                className="h-12 border-gray-300 focus:border-red-500 focus:ring-red-500 rounded-lg"
                                placeholder="0"
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
                    </div>

                    {/* Stock */}
                    <FormField
                      control={form.control}
                      name="stock"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold text-gray-700">
                            Stock Quantity
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              className="h-12 border-gray-300 focus:border-red-500 focus:ring-red-500 rounded-lg"
                              placeholder="Enter stock quantity"
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
                  </div>
                </div>

                {/* Category Selection Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
                    Category & Classification
                  </h2>

                  <div className="space-y-5">
                    {/* Parent Category */}
                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold text-gray-700">
                            Parent Category
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="!h-12 w-full border-gray-300 focus:border-red-500 focus:ring-red-500 rounded-lg">
                                <SelectValue placeholder="Select a category" />
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
                          <FormLabel className="text-sm font-semibold text-gray-700">
                            Subcategory
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="!h-12 w-full border-gray-300 focus:border-red-500 focus:ring-red-500 rounded-lg">
                                <SelectValue placeholder="Select a subcategory" />
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
                  </div>
                </div>

                {/* Description Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
                    Product Description
                  </h2>

                  <FormField
                    control={form.control}
                    name="description"
                    render={() => (
                      <FormItem>
                        <FormControl>
                          <Controller
                            name="description"
                            control={form.control}
                            render={({ field }) => (
                              <ReactQuill
                                theme="snow"
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="Write a detailed product description..."
                                className="min-h-[200px] rounded-lg"
                              />
                            )}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Right Column - Images */}
              <div className="space-y-6">
                {/* Primary Image Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
                    Product Images
                  </h2>

                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-700">
                          Primary Image
                        </FormLabel>
                        <FormControl>
                          <div className="mt-2">
                            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-red-400 hover:bg-red-50/30 transition-all duration-200">
                              {preview ? (
                                <div className="relative w-full h-full group">
                                  <Image
                                    src={preview}
                                    alt="preview"
                                    fill
                                    className="rounded-xl object-cover"
                                  />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                                    <Upload className="w-10 h-10 text-white" />
                                  </div>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center justify-center py-6">
                                  <Upload className="w-12 h-12 text-gray-400 mb-3" />
                                  <p className="text-sm text-gray-600 font-medium">
                                    Click to upload primary image
                                  </p>
                                  <p className="text-xs text-gray-400 mt-1">
                                    PNG, JPG up to 10MB
                                  </p>
                                </div>
                              )}
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  field.onChange(file);
                                  if (file)
                                    setPreview(URL.createObjectURL(file));
                                }}
                              />
                            </label>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Additional Images Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <FormField
                    control={form.control}
                    name="subImages"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-700">
                          Additional Images (up to 5)
                        </FormLabel>
                        <FormControl>
                          <div className="mt-2">
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-red-400 hover:bg-red-50/30 transition-all duration-200">
                              <div className="flex flex-col items-center justify-center">
                                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                <p className="text-sm text-gray-600 font-medium">
                                  Upload additional images
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  Up to 5 images
                                </p>
                              </div>
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
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
                            </label>
                          </div>
                        </FormControl>
                        {additionalPreviews.length > 0 && (
                          <div className="grid grid-cols-2 gap-3 mt-4">
                            {additionalPreviews.map((src, index) => (
                              <div
                                key={index}
                                className="relative w-full h-32 group"
                              >
                                <Image
                                  src={src}
                                  alt={`additional-preview-${index}`}
                                  fill
                                  className="rounded-lg border-2 border-gray-200 object-cover"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                  <div className="bg-white rounded-full p-1">
                                    <X className="w-4 h-4 text-red-500" />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

           {/* Action Buttons */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mt-14">
              <div className="flex justify-end gap-4">
                <Link href="/approved-products">
            <Button
              type="submit"
              className="mt-4 cursor-pointer w-[120px] h-[45px] flex items-center gap-2 text-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            </Link>

            <Button
              type="submit"
              className="mt-4 cursor-pointer w-[120px] h-[45px] flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              {createProductMutation.isPending ? (
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
              ) : (
                <Send className="w-4 h-4" />
              )}
              {createProductMutation.isPending ? "Submitting..." : "Submit"}
            </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}