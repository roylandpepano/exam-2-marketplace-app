/**
 * Order History Page
 */
"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/currency";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Package, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";

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

export default function OrdersPage() {
   const { isLoggedIn, user } = useAuth();
   const [orders, setOrders] = useState<Order[]>([]);
   const [isLoading, setIsLoading] = useState(true);

   useEffect(() => {
      setIsLoading(true);
      const fetchOrders = async () => {
         try {
            const res = await api.getMyOrders();
            const srvOrders = res?.orders || [];

            const mapped = srvOrders.map((srv: any) => ({
               id: String(srv.id),
               userId: String(srv.user_id),
               items: (srv.items || []).map((it: any) => ({
                  id: String(it.id),
                  name: it.product_name || it.name,
                  price: it.unit_price || it.total_price || 0,
                  quantity: it.quantity || 1,
                  image: it.product_image || "",
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
            }));

            // sort newest first
            mapped.sort(
               (a: Order, b: Order) =>
                  new Date(b.date).getTime() - new Date(a.date).getTime()
            );

            setOrders(mapped);
         } catch (error) {
            console.error("Failed to load orders:", error);
            setOrders([]);
         } finally {
            setIsLoading(false);
         }
      };

      if (user?.id) fetchOrders();
   }, [user?.id]);

   if (!isLoggedIn) {
      return (
         <div className="container mx-auto px-4 py-12 text-center">
            <h1 className="text-3xl font-bold mb-4">Order History</h1>
            <p className="text-muted-foreground mb-6">
               Please login to view your orders
            </p>
            <Link href="/login">
               <Button size="lg">Go to Login</Button>
            </Link>
         </div>
      );
   }

   if (isLoading) {
      return (
         <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold mb-8">Order History</h1>
            <div className="space-y-4">
               {[...Array(3)].map((_, i) => (
                  <div
                     key={i}
                     className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
                  />
               ))}
            </div>
         </div>
      );
   }

   if (orders.length === 0) {
      return (
         <div className="container mx-auto px-4 py-12 text-center">
            <motion.div
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
            >
               <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
               <h1 className="text-3xl font-bold mb-2">No Orders Yet</h1>
               <p className="text-muted-foreground mb-8">
                  You haven&apos;t placed any orders yet. Start shopping now!
               </p>
               <Link href="/">
                  <Button size="lg">Start Shopping</Button>
               </Link>
            </motion.div>
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
            <h1 className="text-3xl font-bold">Order History</h1>
            <p className="text-muted-foreground">
               You have {orders.length} order{orders.length !== 1 ? "s" : ""}
            </p>
         </motion.div>

         <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
            className="space-y-4"
         >
            {orders.map((order) => (
               <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
               >
                  <Card className="p-6 hover:shadow-lg transition-shadow">
                     <div className="flex items-start justify-between mb-4">
                        <div>
                           <h3 className="text-lg font-semibold">{order.id}</h3>
                           <p className="text-sm text-muted-foreground">
                              {new Date(order.date).toLocaleDateString(
                                 "en-US",
                                 {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                 }
                              )}
                           </p>
                        </div>
                        <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-semibold">
                           {order.status}
                        </span>
                     </div>

                     <div className="mb-4 pb-4 border-b">
                        <p className="text-sm text-muted-foreground mb-2">
                           {order.items.length} item
                           {order.items.length !== 1 ? "s" : ""}
                        </p>
                        <div className="text-sm space-y-1">
                           {order.items.slice(0, 2).map((item) => (
                              <p key={item.id}>
                                 {item.name} x{item.quantity}
                              </p>
                           ))}
                           {order.items.length > 2 && (
                              <p className="text-muted-foreground">
                                 +{order.items.length - 2} more
                              </p>
                           )}
                        </div>
                     </div>

                     <div className="flex items-center justify-between">
                        <div>
                           <p className="text-sm text-muted-foreground mb-1">
                              Total
                           </p>
                           <p className="text-2xl font-bold text-blue-600">
                              {formatCurrency(order.total)}
                           </p>
                        </div>
                        <Link href={`/orders/${order.id}`}>
                           <Button className="gap-2">
                              View Details
                              <ArrowRight className="h-4 w-4" />
                           </Button>
                        </Link>
                     </div>
                  </Card>
               </motion.div>
            ))}
         </motion.div>
      </div>
   );
}
