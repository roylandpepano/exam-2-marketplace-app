/**
 * Order Details Page
 */
"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/currency";
import { ArrowLeft, Truck, Check } from "lucide-react";

interface OrderItem {
   id: string;
   name: string;
   price: number;
   quantity: number;
   image: string;
}

interface Order {
   id: string;
   userId: string;
   items: OrderItem[];
   total: number;
   status: string;
   shippingAddress: {
      fullName: string;
      address: string;
      city: string;
      state: string;
      zipCode: string;
   };
   date: string;
}

export default function OrderDetailsPage() {
   const params = useParams();
   const orderId = params.id as string;
   const [order, setOrder] = useState<Order | null>(null);
   const [isLoading, setIsLoading] = useState(true);

   useEffect(() => {
      setIsLoading(true);
      const fetchOrder = async () => {
         try {
            const res = await api.getMyOrders();
            const allOrders = res?.orders || [];
            const srv = allOrders.find(
               (o: any) => String(o.id) === String(orderId)
            );

            if (!srv) {
               setOrder(null);
               return;
            }

            const mapped: Order = {
               id: String(srv.id),
               userId: String(srv.user_id),
               items: (srv.items || []).map((it: any) => ({
                  id: String(it.id),
                  name: it.product_name || it.product_name || it.name,
                  price: it.unit_price || it.total_price || 0,
                  quantity: it.quantity || 1,
                  image: it.product_image || it.product_image || "",
               })),
               total: srv.total || 0,
               status: srv.status || "",
               shippingAddress: {
                  fullName: srv.shipping_address?.name || "",
                  address: srv.shipping_address?.street || "",
                  city: srv.shipping_address?.city || "",
                  state: srv.shipping_address?.state || "",
                  zipCode: srv.shipping_address?.postal_code || "",
               },
               date:
                  srv.created_at || srv.updated_at || new Date().toISOString(),
            };

            setOrder(mapped);
         } catch (error) {
            console.error("Failed to load order:", error);
            setOrder(null);
         } finally {
            setIsLoading(false);
         }
      };

      fetchOrder();
   }, [orderId]);

   if (isLoading) {
      return (
         <div className="container mx-auto px-4 py-12">
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
         </div>
      );
   }

   if (!order) {
      return (
         <div className="container mx-auto px-4 py-12 text-center">
            <h1 className="text-3xl font-bold mb-4">Order Not Found</h1>
            <p className="text-muted-foreground mb-6">
               The order you&apos;re looking for doesn&apos;t exist
            </p>
            <Link href="/orders">
               <Button size="lg">Back to Orders</Button>
            </Link>
         </div>
      );
   }

   return (
      <div className="container mx-auto px-4 py-8">
         <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
         >
            <Link
               href="/orders"
               className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline mb-4"
            >
               <ArrowLeft className="h-4 w-4" />
               Back to orders
            </Link>
            <h1 className="text-3xl font-bold">Order Details</h1>
         </motion.div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Items */}
            <div className="lg:col-span-2">
               <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
               >
                  {/* Status Timeline */}
                  <Card className="p-6">
                     <h3 className="font-semibold text-lg mb-4">
                        Order Status
                     </h3>

                     {/* Status steps: confirmed -> processing -> shipped -> delivered */}
                     {(() => {
                        const steps = [
                           { key: "confirmed", label: "Confirmed" },
                           { key: "processing", label: "Processing" },
                           { key: "shipped", label: "In Transit" },
                           { key: "delivered", label: "Delivered" },
                        ];

                        const orderKey =
                           order.status?.toLowerCase() || "pending";
                        const idx = steps.findIndex((s) => s.key === orderKey);
                        const activeIndex =
                           idx >= 0
                              ? idx
                              : orderKey === "cancelled" ||
                                orderKey === "refunded"
                              ? -1
                              : 0;

                        return (
                           <div className="space-y-4">
                              {steps.map((s, i) => {
                                 const completed = i <= activeIndex;
                                 return (
                                    <div
                                       key={s.key}
                                       className="flex items-center gap-4"
                                    >
                                       <div
                                          className={`flex items-center justify-center h-12 w-12 rounded-full ${
                                             completed
                                                ? "bg-green-100 dark:bg-green-900/30"
                                                : "bg-gray-100 dark:bg-gray-800"
                                          }`}
                                       >
                                          {completed ? (
                                             <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
                                          ) : (
                                             <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground" />
                                          )}
                                       </div>
                                       <div>
                                          <p className="font-semibold">
                                             {s.label}
                                          </p>
                                          <p className="text-sm text-muted-foreground">
                                             {s.key === "confirmed"
                                                ? `Order placed on ${new Date(
                                                     order.date
                                                  ).toLocaleDateString()}`
                                                : s.key === "shipped"
                                                ? "Your order is on its way"
                                                : s.key === "delivered"
                                                ? "Order delivered"
                                                : ""}
                                          </p>
                                       </div>
                                    </div>
                                 );
                              })}

                              {order.status === "cancelled" && (
                                 <div className="mt-2 text-sm text-red-600">
                                    This order was cancelled.
                                 </div>
                              )}
                              {order.status === "refunded" && (
                                 <div className="mt-2 text-sm text-red-600">
                                    This order was refunded.
                                 </div>
                              )}
                           </div>
                        );
                     })()}
                  </Card>

                  {/* Order Items */}
                  <Card className="p-6">
                     <h3 className="font-semibold text-lg mb-1">
                        Items Ordered
                     </h3>
                     <div className="space-y-4">
                        {order.items.map((item) => (
                           <div
                              key={item.id}
                              className="flex gap-4 pb-4 border-b last:border-0"
                           >
                              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                 <Image
                                    src={item.image}
                                    alt={item.name}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                 />
                              </div>
                              <div className="flex-1">
                                 <h4 className="font-semibold">{item.name}</h4>
                                 <p className="text-sm text-muted-foreground">
                                    Qty: {item.quantity}
                                 </p>
                                 <p className="text-lg font-bold text-blue-600">
                                    {formatCurrency(item.price * item.quantity)}
                                 </p>
                              </div>
                           </div>
                        ))}
                     </div>
                  </Card>

                  {/* Shipping Address */}
                  <Card className="p-6">
                     <h3 className="font-semibold text-lg mb-1">
                        Shipping Address
                     </h3>
                     <div className="text-sm space-y-1">
                        <p className="font-semibold">
                           {order.shippingAddress.fullName}
                        </p>
                        <p>{order.shippingAddress.address}</p>
                        <p>
                           {order.shippingAddress.city},{" "}
                           {order.shippingAddress.state}{" "}
                           {order.shippingAddress.zipCode}
                        </p>
                     </div>
                  </Card>
               </motion.div>
            </div>

            {/* Order Summary */}
            <motion.div
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.3 }}
            >
               <Card className="p-6 sticky top-24">
                  <h3 className="text-lg font-semibold mb-4">Order Summary</h3>

                  <div className="space-y-2 mb-1 pb-6 border-b">
                     <div className="flex justify-between">
                        <span className="text-muted-foreground">Order ID</span>
                        <span className="font-mono text-sm">{order.id}</span>
                     </div>
                     <div className="flex justify-between">
                        <span className="text-muted-foreground">Date</span>
                        <span>
                           {new Date(order.date).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                           })}
                        </span>
                     </div>
                     <div className="flex justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <span className="font-semibold text-green-600">
                           {order.status}
                        </span>
                     </div>
                  </div>

                  <div className="space-y-2 mb-1 pb-6 border-b">
                     <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Items</span>
                        <span>{formatCurrency(order.total * (10 / 11))}</span>
                     </div>
                     <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Shipping</span>
                        <span>Free</span>
                     </div>
                     <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tax</span>
                        <span>
                           {formatCurrency(
                              order.total - order.total * (10 / 11)
                           )}
                        </span>
                     </div>
                  </div>

                  <div className="flex justify-between items-center">
                     <span className="font-bold">Total:</span>
                     <span className="font-bold text-2xl text-blue-600">
                        {formatCurrency(order.total)}
                     </span>
                  </div>

                  <Link href="/" className="block mt-1">
                     <Button variant="outline" className="w-full">
                        Continue Shopping
                     </Button>
                  </Link>
               </Card>
            </motion.div>
         </div>
      </div>
   );
}
