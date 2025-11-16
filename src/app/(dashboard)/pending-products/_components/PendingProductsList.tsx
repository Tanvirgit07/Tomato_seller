/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Trash2, ChevronRight, Plus } from "lucide-react";
import { toast } from "sonner";
import Loading from "@/components/share/Loading";
import { DeleteModal } from "@/components/share/DeleteModal";
type FoodItem = {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountPrice: number;
  image: string;
  publicId: string;
  category?: {
    _id: string;
    name: string;
  };
  createdAt: string;
  status?: string;
  user?: {
    _id: string;
    role: string;
  };
};

function PendingProductsList() {
  const queryClient = useQueryClient();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Fetch food items
  const {
    data: response,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["food-items"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/food/getAllFood`
      );
      if (!res.ok) throw new Error("Failed to fetch food items");
      return res.json();
    },
  });

  const foodItems: FoodItem[] = response?.data || [];

  // ✅ Only pending + seller products
  const filteredFoodItems = foodItems.filter(
    (item) => item.status === "pending" && item.user?.role === "seller"
  );

  // Delete mutation
  const deleteProductMutation = useMutation<
    { success: boolean; message: string },
    Error,
    string
  >({
    mutationFn: async (id: string) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/food/deletefood/${id}`,
        { method: "DELETE" }
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to delete food item");
      }

      return res.json();
    },
    onSuccess: (data) => {
      toast.success(data.message || "Food item deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["food-items"] });
      setDeleteModalOpen(false);
      setSelectedId(null);
    },
    onError: (error) => {
      toast.error(error.message || "Error deleting food item");
    },
  });

  // ✅ Update status mutation
  const updateStatusMutation = useMutation<
    { success: boolean; message: string },
    Error,
    { id: string; status: string }
  >({
    mutationFn: async ({ id, status }) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/food/update-status/${id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update status");
      }

      return res.json();
    },
    onSuccess: (data) => {
      toast.success(data.message || "Status updated successfully");
      queryClient.invalidateQueries({ queryKey: ["food-items"] });
    },
    onError: (error) => {
      toast.error(error.message || "Error updating status");
    },
  });

  const handleDeleteClick = (id: string) => {
    setSelectedId(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedId) {
      deleteProductMutation.mutate(selectedId);
    }
  };

  const stripHtml = (html: string) => {
    if (typeof window === "undefined") return html;
    const temp = document.createElement("div");
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || "";
  };

  if (isLoading) return <Loading />;
  if (isError)
    return (
      <div className="bg-gray-50 min-h-screen flex justify-center items-center">
        <div className="text-center">
          <div className="text-red-500 text-xl font-semibold mb-2">
            ⚠️ Error loading food items
          </div>
          <p className="text-gray-600">Please try refreshing the page</p>
        </div>
      </div>
    );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">Food Items</h1>
          <nav className="flex items-center text-sm text-gray-500 mt-2">
            <Link href="/dashboard" className="hover:text-gray-700">
              Dashboard
            </Link>
            <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
            <span className="text-gray-900 font-medium">Food Items</span>
          </nav>
        </div>
        <Link href="/pending-products/add">
          <Button className="bg-red-500 hover:bg-red-600 text-white px-8 h-[50px] rounded-lg font-semibold shadow-lg flex items-center gap-2">
            <Plus className="!w-7 !h-7" />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Main content */}
      {filteredFoodItems.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 text-center py-10 mt-10">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No pending seller products found
          </h3>
          <p className="text-gray-500 mb-6">
            Only pending products from sellers will show here
          </p>
          <Link href="/pending-products/add">
            <Button className="bg-red-500 hover:bg-red-600 text-white px-6 rounded-lg flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Food Item
            </Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mt-10">
          {/* Table Header */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <div className="grid grid-cols-12 gap-4 px-6 py-4 items-center">
              <div className="col-span-3 text-xs font-semibold text-gray-600 uppercase">
                Food
              </div>
              <div className="col-span-2 text-xs font-semibold text-gray-600 uppercase text-center">
                Category
              </div>
              <div className="col-span-2 text-xs font-semibold text-gray-600 uppercase text-center">
                Price
              </div>
              <div className="col-span-1 text-xs font-semibold text-gray-600 uppercase text-center">
                Discount
              </div>
              <div className="col-span-2 text-xs font-semibold text-gray-600 uppercase text-center">
                Status
              </div>
              <div className="col-span-2 text-xs font-semibold text-gray-600 uppercase text-center">
                Actions
              </div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-100">
            {filteredFoodItems.map((item, index) => (
              <div
                key={item._id}
                className={`grid grid-cols-12 gap-4 px-6 py-5 items-center hover:bg-gray-50 ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                }`}
              >
                {/* Food Info */}
                <div className="col-span-3 flex items-center gap-4">
                  <Image
                    width={56}
                    height={56}
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-14 rounded-xl object-cover shadow-md"
                  />
                  <div className="overflow-hidden">
                    <h3 className="font-semibold text-gray-900 text-base truncate">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {stripHtml(item.description)}
                    </p>
                  </div>
                </div>

                {/* Category */}
                <div className="col-span-2 flex items-center justify-center text-center">
                  <span className="text-gray-700 font-medium">
                    {item.category?.name || "N/A"}
                  </span>
                </div>

                {/* Price */}
                <div className="col-span-2 flex items-center justify-center text-center">
                  <span className="text-gray-700 font-medium">
                    ${item.price}
                  </span>
                </div>

                {/* Discount */}
                <div className="col-span-1 flex items-center justify-center text-center">
                  <span className="text-gray-700 font-medium">
                    {item.discountPrice}%
                  </span>
                </div>

                {/* Status (shadcn Select) */}
                <div className="col-span-2 flex items-center justify-center">
                  <span className="text-gray-700 font-medium">
                    {item.status}
                  </span>
                </div>

                {/* Actions */}
                <div className="col-span-2 flex items-center justify-center gap-3">
                  {/* <Link href={`/pending-products/edit/${item._id}`}>
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-blue-200 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </Link> */}
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-red-200 text-red-600 hover:bg-red-50 rounded-lg"
                    onClick={() => handleDeleteClick(item._id)}
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

export default PendingProductsList;
