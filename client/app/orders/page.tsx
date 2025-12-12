/**
 * Order History Page
 */
"use client";

import { useState, useEffect, useMemo } from "react";
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
   order_number?: string;
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
   const [sort, setSort] = useState<string>("newest");
   const [isLoading, setIsLoading] = useState(true);

   const sortedOrders = useMemo(() => {
      const list = [...orders];
      switch (sort) {
         case "oldest":
            list.sort(
               (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
            );
            break;
         case "total_desc":
            list.sort((a, b) => b.total - a.total);
            break;
         case "total_asc":
            list.sort((a, b) => a.total - b.total);
            break;
         case "newest":
         default:
            list.sort(
               (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            break;
      }
      return list;
   }, [orders, sort]);

   useEffect(() => {
      setIsLoading(true);
      const fetchOrders = async () => {
         try {
            const res = await api.getMyOrders();
            const srvOrders = res?.orders || [];

            const mapped = srvOrders.map((srv: any) => ({
               id: String(srv.id),
               order_number: String(
                  srv.order_number || srv.order_number || srv.id
               ),
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
            className="mb-6"
         >
            <div className="flex items-center justify-between gap-4">
               <div>
                  <h1 className="text-2xl font-semibold">Order History</h1>
                  <p className="text-sm text-muted-foreground">
                     You have {orders.length} order
                     {orders.length !== 1 ? "s" : ""}
                  </p>
               </div>

               <div className="flex items-center gap-2">
                  <label className="text-sm text-muted-foreground">Sort:</label>
                  <select
                     value={sort}
                     onChange={(e) => setSort(e.target.value)}
                     className="text-sm rounded-md border px-2 py-1 bg-white dark:bg-slate-800"
                  >
                     <option value="newest">Newest</option>
                     <option value="oldest">Oldest</option>
                     <option value="total_desc">Total: High → Low</option>
                     <option value="total_asc">Total: Low → High</option>
                  </select>
               </div>
            </div>
         </motion.div>

         <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.06 }}
            className="space-y-3"
         >
            {sortedOrders.map((order) => (
               <motion.div
                  key={order.order_number || order.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
               >
                  <Card className="p-3 hover:shadow transition-shadow">
                     <div className="flex items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                           <div>
                              <h3 className="text-sm font-medium">
                                 {order.order_number || order.id}
                              </h3>
                              <p className="text-xs text-muted-foreground">
                                 {new Date(order.date).toLocaleDateString(
                                    "en-US",
                                    {
                                       year: "numeric",
                                       month: "short",
                                       day: "numeric",
                                    }
                                 )}
                              </p>
                           </div>

                           <div className="hidden sm:block text-xs text-muted-foreground">
                              {order.items.slice(0, 2).map((item) => (
                                 <div
                                    key={item.id}
                                    className="truncate max-w-xs"
                                 >
                                    {item.name} x{item.quantity}
                                 </div>
                              ))}
                              {order.items.length > 2 && (
                                 <div className="text-xs text-muted-foreground">
                                    +{order.items.length - 2} more
                                 </div>
                              )}
                           </div>
                        </div>

                        <div className="flex items-center gap-4">
                           <div className="text-right">
                              <div className="text-xs text-muted-foreground">
                                 Total
                              </div>
                              <div className="text-base font-semibold text-blue-600">
                                 {formatCurrency(order.total)}
                              </div>
                           </div>

                           <div className="flex flex-col items-end">
                              <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-semibold">
                                 {order.status}
                              </span>
                              <Link
                                 href={`/orders/${
                                    order.order_number || order.id
                                 }`}
                                 className="mt-2"
                              >
                                 <Button size="sm" className="gap-1">
                                    View
                                    <ArrowRight className="h-3 w-3" />
                                 </Button>
                              </Link>
                           </div>
                        </div>
                     </div>
                  </Card>
               </motion.div>
            ))}
         </motion.div>
      </div>
   );
}
