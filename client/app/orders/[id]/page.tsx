/**
 * Order Details Page
 */
"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
      try {
         const allOrders = JSON.parse(localStorage.getItem("orders") || "[]");
         const foundOrder = allOrders.find((o: Order) => o.id === orderId);
         setOrder(foundOrder || null);
      } catch (error) {
         console.error("Failed to load order:", error);
      } finally {
         setIsLoading(false);
      }
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
                     <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30">
                           <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                           <p className="font-semibold">Order Confirmed</p>
                           <p className="text-sm text-muted-foreground">
                              Order placed on{" "}
                              {new Date(order.date).toLocaleDateString()}
                           </p>
                        </div>
                     </div>

                     <div className="mt-6 flex items-center gap-4">
                        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30">
                           <Truck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                           <p className="font-semibold">In Transit</p>
                           <p className="text-sm text-muted-foreground">
                              Your order is on its way
                           </p>
                        </div>
                     </div>
                  </Card>

                  {/* Order Items */}
                  <Card className="p-6">
                     <h3 className="font-semibold text-lg mb-4">
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
                                 />
                              </div>
                              <div className="flex-1">
                                 <h4 className="font-semibold">{item.name}</h4>
                                 <p className="text-sm text-muted-foreground">
                                    Qty: {item.quantity}
                                 </p>
                                 <p className="text-lg font-bold text-blue-600">
                                    ${(item.price * item.quantity).toFixed(2)}
                                 </p>
                              </div>
                           </div>
                        ))}
                     </div>
                  </Card>

                  {/* Shipping Address */}
                  <Card className="p-6">
                     <h3 className="font-semibold text-lg mb-4">
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

                  <div className="space-y-2 mb-6 pb-6 border-b">
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

                  <div className="space-y-2 mb-6 pb-6 border-b">
                     <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Items</span>
                        <span>${(order.total * (10 / 11)).toFixed(2)}</span>
                     </div>
                     <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Shipping</span>
                        <span>Free</span>
                     </div>
                     <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tax</span>
                        <span>
                           ${(order.total - order.total * (10 / 11)).toFixed(2)}
                        </span>
                     </div>
                  </div>

                  <div className="flex justify-between items-center">
                     <span className="font-bold">Total:</span>
                     <span className="font-bold text-2xl text-blue-600">
                        ${order.total.toFixed(2)}
                     </span>
                  </div>

                  <Link href="/" className="block mt-6">
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
