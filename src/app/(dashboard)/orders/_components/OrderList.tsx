"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Trash2, ChevronRight, Eye, Edit } from "lucide-react";
import Loading from "@/components/share/Loading";
import { DeleteModal } from "@/components/share/DeleteModal";
import { useSession } from "next-auth/react";
import { OrderDialog } from "@/components/share/OrderDiolog";

type OrderProduct = {
  _id: string;
  name: string;
  quantity: number;
  price: number;
  createdBy?: { email?: string; name?: string };
};

type Order = {
  _id: string;
  userId: { name?: string; email?: string } | null;
  products: OrderProduct[];
  amount: number;
  status: string;
  checkoutSessionId: string;
  createdAt: string;
  updatedAt: string;
};

function OrderList() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const email = user?.email;

  const {
    data: response,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/payment/getorders`
      );
      if (!res.ok) throw new Error("Failed to fetch orders");
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
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/payment/deleteorder/${selectedId}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to delete order");
      setDeleteModalOpen(false);
      setSelectedId(null);
      refetch();
    } catch (err) {
      console.error(err);
    }
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
            ⚠️ Error loading orders
          </div>
          <p className="text-gray-600">Please try refreshing the page</p>
        </div>
      </div>
    );

  const allOrders: Order[] = response?.orders || [];

  // filter করে শুধু সেই orders দেখাচ্ছি যেখানে loggedIn user এর product আছে
  const filteredOrders = allOrders.filter((order) =>
    order.products.some((p) => p.createdBy?.email === email)
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <nav className="flex items-center text-sm text-gray-500 mt-2">
            <Link href="/dashboard" className="hover:text-gray-700">
              Dashboard
            </Link>
            <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
            <span className="text-gray-900 font-medium">Orders</span>
          </nav>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 text-center py-10 mt-10">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No orders found
          </h3>
          <p className="text-gray-500 mb-6">
            Orders will appear here once they are created
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mt-10">
          {/* Table Header */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <div className="grid grid-cols-12 gap-6 px-6 py-4">
              <div className="col-span-2 text-xs font-semibold text-gray-600 uppercase">
                Order ID
              </div>
              <div className="col-span-2 text-xs font-semibold text-gray-600 uppercase text-center">
                Customer
              </div>
              <div className="col-span-2 text-xs font-semibold text-gray-600 uppercase text-center">
                Products
              </div>
              <div className="col-span-1 text-xs font-semibold text-gray-600 uppercase text-center">
                Amount
              </div>
              <div className="col-span-1 text-xs font-semibold text-gray-600 uppercase text-center">
                Status
              </div>
              <div className="col-span-2 text-xs font-semibold text-gray-600 uppercase text-center">
                Created At
              </div>
              <div className="col-span-2 text-xs font-semibold text-gray-600 uppercase text-center">
                Actions
              </div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-100">
            {filteredOrders.map((order, index) => (
              <div
                key={order._id}
                className={`grid grid-cols-12 gap-6 px-6 py-5 hover:bg-gray-50 ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                }`}
              >
                {/* Order ID */}
                <div className="col-span-2 flex items-center">
                  <span className="text-gray-900 font-medium truncate">
                    {order._id}
                  </span>
                </div>

                {/* Customer */}
                <div className="col-span-2 flex items-center justify-center">
                  <span className="text-gray-700 font-medium text-sm truncate">
                    {order.userId?.name || "N/A"}
                  </span>
                </div>

                {/* Products (only count) */}
                <div className="col-span-2 flex items-center justify-center">
                  <span className="text-sm text-gray-600">
                    {
                      order.products.filter((p) => p.createdBy?.email === email)
                        .length
                    }{" "}
                    product(s)
                  </span>
                </div>

                {/* Amount */}
                <div className="col-span-1 flex items-center justify-center">
                  <span className="text-gray-900 font-semibold">
                    ${order.amount}
                  </span>
                </div>

                {/* Status */}
                <div className="col-span-1 flex items-center justify-center">
                  <span
                    className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                      order.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : order.status === "paid"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>

                {/* Created At */}
                <div className="col-span-2 flex items-center justify-center">
                  <span className="text-sm text-gray-600">
                    {formatDate(order.createdAt)}
                  </span>
                </div>

                {/* Actions */}
                <div className="col-span-2 flex items-center justify-center gap-3">
                  <OrderDialog orderId={order._id} />
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-red-200 text-red-600 hover:bg-red-50 rounded-lg"
                    onClick={() => handleDeleteClick(order._id)}
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

export default OrderList;
