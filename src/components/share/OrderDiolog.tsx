"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { Eye } from "lucide-react";
import Image from "next/image";

type OrderDialogProps = {
  orderId: string;
};

type ProductType = {
  _id: string;
  name: string;
  quantity: number;
  price: number;
  productId: {
    _id: string;
    name: string;
    discountPrice: number;
    image: string;
  };
  createdBy: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
};

type OrderType = {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  products: ProductType[];
  amount: number;
  status: string;
  checkoutSessionId: string;
  createdAt: string;
  updatedAt: string;
  paymentIntentId: string;
};

export function OrderDialog({ orderId }: OrderDialogProps) {
  const {
    data: singleOrderData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["single-order", orderId],
    queryFn: async () => {
      if (!orderId) throw new Error("Order ID is required");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/payment/singeorder/${orderId}`
      );
      if (!res.ok) throw new Error("Failed to fetch the single order");
      return res.json();
    },
    enabled: !!orderId,
  });

  const order: OrderType | null = singleOrderData?.order || null;

  // শুধু seller products
  const sellerProducts = order?.products.filter(
    (p) => p.createdBy.role === "seller"
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="border-blue-200 text-blue-600 hover:bg-blue-50 rounded-lg"
        >
          <Eye className="w-4 h-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Seller Products</DialogTitle>
          <DialogDescription>
            {isLoading
              ? "Loading order..."
              : isError
              ? "Failed to load order"
              : `Order ID: ${order?._id}`}
          </DialogDescription>
        </DialogHeader>

        {isLoading && <p className="text-gray-500 py-4">Loading...</p>}

        {isError && (
          <p className="text-red-500 py-4">
            Something went wrong while fetching order.
          </p>
        )}

        {sellerProducts && sellerProducts.length > 0 ? (
          <div className="mt-4 space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-700 mb-2">Products</h3>
              <div className="space-y-3">
                {sellerProducts.map((p) => (
                  <div
                    key={p._id}
                    className="grid grid-cols-12 items-center gap-4 border-b last:border-b-0 pb-2"
                  >
                    <div className="col-span-2">
                      <Image
                        src={p.productId.image}
                        alt={p.productId.name}
                        width={50}
                        height={50}
                        className="rounded-lg object-cover"
                      />
                    </div>
                    <div className="col-span-4">
                      <p className="font-medium">{p.productId.name}</p>
                      <p className="text-gray-500 text-sm">
                        Seller: {p.createdBy.name} ({p.createdBy.role})
                      </p>
                    </div>
                    <div className="col-span-2 text-center">
                      <p>{p.quantity} pcs</p>
                    </div>
                    <div className="col-span-2 text-center font-medium">
                      ${p.price}
                    </div>
                    <div className="col-span-2 text-center text-gray-500 text-sm">
                      ID: {p.productId._id.slice(-6)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p>
                <span className="font-medium">Total Amount:</span>{" "}
                ${sellerProducts.reduce((sum, p) => sum + p.price, 0)}
              </p>
              <p>
                <span className="font-medium">Status:</span>{" "}
                <span
                  className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                    order?.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : order?.status === "paid"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {order?.status}
                </span>
              </p>
              <p>
                <span className="font-medium">Created At:</span>{" "}
                {new Date(order!.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 py-4">No seller products found.</p>
        )}

        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
