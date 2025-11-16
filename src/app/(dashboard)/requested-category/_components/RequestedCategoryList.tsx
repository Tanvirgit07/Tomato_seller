/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, ChevronRight, Plus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Loading from "@/components/share/Loading";
import { DeleteModal } from "@/components/share/DeleteModal";

const RequestedCategoryList: React.FC = () => {
  const {
    data: response,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["category"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/category/allcategory`
      );
      if (!res.ok) {
        throw new Error("Failed to fetch categories");
      }
      return res.json();
    },
  });

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );

  const stripHtml = (html: string) => {
    if (typeof window === "undefined") return html;
    const temp = document.createElement("div");
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || "";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const handleDeleteClick = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedCategoryId) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/category/deletecategory/${selectedCategoryId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) throw new Error("Failed to delete category");

      setDeleteModalOpen(false);
      setSelectedCategoryId(null);
      refetch();
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading) return <Loading />;
  if (isError)
    return (
      <div className="bg-gray-50 min-h-screen flex justify-center items-center">
        <div className="text-center">
          <div className="text-red-500 text-xl font-semibold mb-2">
            ⚠️ Error loading categories
          </div>
          <p className="text-gray-600">Please try refreshing the page</p>
        </div>
      </div>
    );

  const categories = response?.data || [];

  return (
    <div>
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Categories
          </h1>
          <nav className="flex items-center text-sm text-gray-500 mt-2">
            <Link
              href="/dashboard"
              className="hover:text-gray-700 transition-colors"
            >
              Dashboard
            </Link>
            <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
            <span className="text-gray-900 font-medium">Categories</span>
          </nav>
        </div>
        <Link href="/requested-category/add">
          <Button className="bg-red-500 text-base hover:bg-red-600 text-white px-8 h-[50px] rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2">
            <Plus className="!w-7 !h-7" />
            Add Category
          </Button>
        </Link>
      </div>

      {/* Main Content */}
      <div>
        {categories.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 text-center py-10">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No categories found
            </h3>
            <p className="text-gray-500 mb-6">
              Get started by creating your first category
            </p>
            <Link href="/category/add">
              <Button className="bg-red-500 hover:bg-red-600 text-white px-6 rounded-lg">
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mt-10">
            {/* Table Header */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <div className="grid grid-cols-12 gap-6 px-6 py-4">
                <div className="col-span-3 text-xs font-semibold text-gray-600 uppercase">
                  Category
                </div>
                <div className="col-span-2 text-xs font-semibold text-gray-600 uppercase text-center">
                  Sub-Categories
                </div>
                <div className="col-span-2 text-xs font-semibold text-gray-600 uppercase text-center">
                  Status
                </div>
                <div className="col-span-2 text-xs font-semibold text-gray-600 uppercase text-center">
                  Date Added
                </div>
                <div className="col-span-3 text-xs font-semibold text-gray-600 uppercase text-center">
                  Actions
                </div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-100">
              {categories.map((category: any, index: number) => (
                <div
                  key={category._id}
                  className={`grid grid-cols-12 gap-6 px-6 py-5 hover:bg-gray-50 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                  }`}
                >
                  {/* Category Info */}
                  <div className="col-span-3 flex items-center gap-4">
                    <Image
                      width={56}
                      height={56}
                      src={category.image}
                      alt={category.categoryName}
                      className="w-14 h-14 rounded-xl object-cover shadow-md"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900 text-base truncate">
                        {category.categoryName}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {stripHtml(category.categorydescription)}
                      </p>
                    </div>
                  </div>

                  {/* Sub Category Count */}
                  <div className="col-span-2 flex items-center justify-center">
                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                      {category.subCategory?.length || 0}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="col-span-2 flex items-center justify-center">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        category.status === "approved"
                          ? "bg-green-50 text-green-700"
                          : category.status === "pending"
                          ? "bg-yellow-50 text-yellow-700"
                          : "bg-gray-50 text-gray-700"
                      }`}
                    >
                      {category.status}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="col-span-2 flex items-center justify-center">
                    <div className="text-center">
                      <span className="text-sm font-medium text-gray-700 block">
                        {formatDate(category.createdAt)}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(category.createdAt).toLocaleDateString(
                          "en-US",
                          { weekday: "short" }
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="col-span-3 flex items-center justify-center gap-3">
                    <Link href={`/category/edit/${category._id}`}>
                      <Button
                        variant="outline"
                        size="icon"
                        className="border-blue-200 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-red-200 text-red-600 hover:bg-red-50 rounded-lg"
                      onClick={() => handleDeleteClick(category._id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      <DeleteModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default RequestedCategoryList;
