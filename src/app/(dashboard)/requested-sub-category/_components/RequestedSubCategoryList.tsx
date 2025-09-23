"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, ChevronRight, Plus } from "lucide-react";
import Loading from "@/components/share/Loading";
import { DeleteModal } from "@/components/share/DeleteModal";

type SubCategory = {
  _id: string;
  name: string;
  description: string;
  image: string;
  category?: {
    categoryName: string;
    createdAt: string;
    updatedAt: string;
  };
  createdAt: string;
  updatedAt: string;
};

function RequestedSubCategoryList() {
  const {
    data: response,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["sub-category"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/subcategory/getallsubcategory`
      );
      if (!res.ok) throw new Error("Failed to fetch subcategories");
      return res.json();
    },
  });

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setSelectedId(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedId) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/subcategory/deletesubcategory/${selectedId}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to delete subcategory");
      setDeleteModalOpen(false);
      setSelectedId(null);
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const stripHtml = (html: string) => {
    if (typeof window === "undefined") return html;
    const temp = document.createElement("div");
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || "";
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

  if (isLoading) return <Loading />;
  if (isError)
    return (
      <div className="bg-gray-50 min-h-screen flex justify-center items-center">
        <div className="text-center">
          <div className="text-red-500 text-xl font-semibold mb-2">
            ⚠️ Error loading subcategories
          </div>
          <p className="text-gray-600">Please try refreshing the page</p>
        </div>
      </div>
    );

  const subCategories: SubCategory[] = response?.data || [];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">Subcategories</h1>
          <nav className="flex items-center text-sm text-gray-500 mt-2">
            <Link href="/dashboard" className="hover:text-gray-700">
              Dashboard
            </Link>
            <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
            <span className="text-gray-900 font-medium">Subcategories</span>
          </nav>
        </div>
        <Link href="/requested-sub-category/add">
          <Button className="bg-red-500 hover:bg-red-600 text-white px-8 h-[50px] rounded-lg font-semibold shadow-lg flex items-center gap-2">
            <Plus className="!w-7 !h-7" />
            Add Subcategory
          </Button>
        </Link>
      </div>

      {/* Main content */}
      {subCategories.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 text-center py-10 mt-10">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No subcategories found
          </h3>
          <p className="text-gray-500 mb-6">
            Get started by creating your first subcategory
          </p>
          <Link href="/subcategory/add">
            <Button className="bg-red-500 hover:bg-red-600 text-white px-6 rounded-lg">
              <Plus className="w-4 h-4 mr-2" />
              Add Subcategory
            </Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mt-10">
          {/* Table Header */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <div className="grid grid-cols-12 gap-6 px-6 py-4">
              <div className="col-span-3 text-xs font-semibold text-gray-600 uppercase">
                Subcategory
              </div>
              <div className="col-span-2 text-xs font-semibold text-gray-600 uppercase text-center">
                Parent Category
              </div>
              <div className="col-span-2 text-xs font-semibold text-gray-600 uppercase text-center">
                Created At
              </div>
              <div className="col-span-2 text-xs font-semibold text-gray-600 uppercase text-center">
                Updated At
              </div>
              <div className="col-span-3 text-xs font-semibold text-gray-600 uppercase text-center">
                Actions
              </div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-100">
            {subCategories.map((sub, index) => (
              <div
                key={sub._id}
                className={`grid grid-cols-12 gap-6 px-6 py-5 hover:bg-gray-50 ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                }`}
              >
                {/* Subcategory Info */}
                <div className="col-span-3 flex items-center gap-4">
                  <Image
                    width={56}
                    height={56}
                    src={sub.image}
                    alt={sub.name}
                    className="w-14 h-14 rounded-xl object-cover shadow-md"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900 text-base truncate">
                      {sub.name}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {stripHtml(sub.description)}
                    </p>
                  </div>
                </div>

                {/* Parent Category */}
                <div className="col-span-2 flex items-center justify-center">
                  <span className="text-gray-700 font-medium">
                    {sub.category?.categoryName || "N/A"}
                  </span>
                </div>

                {/* Created At */}
                <div className="col-span-2 flex items-center justify-center">
                  <span className="text-sm text-gray-600">
                    {formatDate(sub.createdAt)}
                  </span>
                </div>

                {/* Updated At */}
                <div className="col-span-2 flex items-center justify-center">
                  <span className="text-sm text-gray-600">
                    {formatDate(sub.updatedAt)}
                  </span>
                </div>

                {/* Actions */}
                <div className="col-span-3 flex items-center justify-center gap-3">
                  <Link href={`/sub-category/edit/${sub._id}`}>
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
                    onClick={() => handleDeleteClick(sub._id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <DeleteModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

export default RequestedSubCategoryList;
