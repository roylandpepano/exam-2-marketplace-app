"use client";

import React, { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { formatCurrency } from "../../lib/currency";
import {
   Card,
   CardHeader,
   CardTitle,
   CardContent,
} from "../../components/ui/card";

type OrderItem = {
   product_id: number;
   product_name: string;
   product_image?: string;
   quantity: number;
   unit_price: number;
   total_price: number;
};

type Order = {
   id: number;
   order_number: string;
   total: number;
   created_at: string;
   items: OrderItem[];
};

type User = {
   first_name?: string;
   name?: string;
   username?: string;
   email?: string;
};

export default function ProfilePage() {
   const [user, setUser] = useState<User | null>(null);
   const [orders, setOrders] = useState<Order[]>([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      let mounted = true;
      async function load() {
         try {
            const u = await api.getCurrentUser();
            const me = u?.user || null;
            const res = await api.getMyOrders();
            const myOrders: Order[] = res?.orders || [];
            if (!mounted) return;
            setUser(me);
            setOrders(myOrders);
         } catch (err) {
            console.error("Failed to load profile or orders", err);
         } finally {
            if (mounted) setLoading(false);
         }
      }
      load();
      return () => {
         mounted = false;
      };
   }, []);

   // compute total spending and top items
   const totalSpending = orders.reduce((acc, o) => acc + (o.total || 0), 0);

   const itemsMap: Record<
      string,
      { name: string; quantity: number; total: number; image?: string }
   > = {};
   for (const o of orders) {
      for (const it of o.items || []) {
         const key = String(it.product_id || it.product_name);
         if (!itemsMap[key])
            itemsMap[key] = {
               name: it.product_name,
               quantity: 0,
               total: 0,
               image: it.product_image,
            };
         itemsMap[key].quantity += it.quantity || 0;
         itemsMap[key].total += it.total_price || 0;
      }
   }

   const topItems = Object.entries(itemsMap)
      .map(([k, v]) => ({ id: k, ...v }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

   if (loading)
      return (
         <div className="container mx-auto px-4 py-8">Loading profile…</div>
      );

   return (
      <div className="container mx-auto px-4 py-8">
         <h1 className="text-2xl font-semibold mb-4">Profile</h1>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="col-span-1 md:col-span-2">
               <CardHeader>
                  <CardTitle>Account</CardTitle>
               </CardHeader>
               <CardContent>
                  <div className="space-y-1">
                     <div className="font-medium">
                        {user?.first_name ||
                           user?.name ||
                           user?.username ||
                           "-"}
                     </div>
                     <div className="text-sm text-muted-foreground">
                        {user?.email}
                     </div>
                  </div>
               </CardContent>
            </Card>

            <Card>
               <CardHeader>
                  <CardTitle>Total Spending</CardTitle>
               </CardHeader>
               <CardContent>
                  <div className="text-2xl font-semibold">
                     {formatCurrency(totalSpending)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                     Across {orders.length} orders
                  </div>
               </CardContent>
            </Card>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
               <CardHeader>
                  <CardTitle>Orders</CardTitle>
               </CardHeader>
               <CardContent>
                  {orders.length === 0 && (
                     <div className="text-sm text-muted-foreground">
                        You have no orders yet.
                     </div>
                  )}
                  {orders.map((o) => (
                     <div key={o.id} className="py-3 border-b last:border-b-0">
                        <div className="flex justify-between items-center">
                           <div>
                              <div className="font-medium">
                                 {o.order_number}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                 {new Date(o.created_at).toLocaleString()}
                              </div>
                           </div>
                           <div className="text-right">
                              <div className="font-medium">
                                 {formatCurrency(o.total)}
                              </div>
                           </div>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-2">
                           {(o.items || []).slice(0, 4).map((it) => (
                              <div
                                 key={it.product_id + "-" + it.product_name}
                                 className="flex items-center gap-3"
                              >
                                 {it.product_image && (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                       src={it.product_image}
                                       alt={it.product_name}
                                       className="w-12 h-12 object-cover rounded"
                                    />
                                 )}
                                 <div>
                                    <div className="text-sm">
                                       {it.product_name}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                       {it.quantity} ×{" "}
                                       {formatCurrency(it.unit_price)}
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  ))}
               </CardContent>
            </Card>

            <Card>
               <CardHeader>
                  <CardTitle>Top Items</CardTitle>
               </CardHeader>
               <CardContent>
                  {topItems.length === 0 && (
                     <div className="text-sm text-muted-foreground">
                        No items purchased yet.
                     </div>
                  )}
                  <ul className="space-y-3">
                     {topItems.map((t) => (
                        <li key={t.id} className="flex items-center gap-3">
                           {t.image && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                 src={t.image}
                                 alt={t.name}
                                 className="w-12 h-12 object-cover rounded"
                              />
                           )}
                           <div className="flex-1">
                              <div className="font-medium">{t.name}</div>
                              <div className="text-sm text-muted-foreground">
                                 {t.quantity} purchased •{" "}
                                 {formatCurrency(t.total)}
                              </div>
                           </div>
                        </li>
                     ))}
                  </ul>
               </CardContent>
            </Card>
         </div>
      </div>
   );
}
