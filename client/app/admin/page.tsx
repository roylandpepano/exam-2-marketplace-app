"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
   Package,
   ShoppingCart,
   Users,
   DollarSign,
   TrendingUp,
   AlertTriangle,
   PhilippinePeso,
} from "lucide-react";

export default function AdminDashboard() {
   const [stats, setStats] = useState<any>(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      loadStats();
   }, []);

   const loadStats = async () => {
      try {
         const data = await api.getDashboard(30);
         setStats(data);
      } catch (error) {
         console.error("Failed to load stats:", error);
      } finally {
         setLoading(false);
      }
   };

   if (loading) {
      return (
         <AdminLayout>
            <div className="space-y-4">
               <h1 className="text-3xl font-bold">Dashboard</h1>
               <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {[...Array(4)].map((_, i) => (
                     <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                           <div className="h-4 w-24 animate-pulse bg-muted rounded"></div>
                        </CardHeader>
                        <CardContent>
                           <div className="h-8 w-32 animate-pulse bg-muted rounded mb-1"></div>
                           <div className="h-4 w-20 animate-pulse bg-muted rounded"></div>
                        </CardContent>
                     </Card>
                  ))}
               </div>
            </div>
         </AdminLayout>
      );
   }

   const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat("en-US", {
         style: "currency",
         currency: "PHP",
      }).format(amount);
   };

   return (
      <AdminLayout>
         <div className="space-y-4">
            <div>
               <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
               <p className="text-muted-foreground">
                  Overview of your marketplace performance
               </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
               <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                     <CardTitle className="text-sm font-medium">
                        Total Revenue
                     </CardTitle>
                     <PhilippinePeso className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                     <div className="text-2xl font-bold">
                        {formatCurrency(stats?.revenue?.all_time?.total || 0)}
                     </div>
                     <p className="text-xs text-muted-foreground">
                        {formatCurrency(stats?.revenue?.recent?.total || 0)} in
                        last 30 days
                     </p>
                  </CardContent>
               </Card>

               <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                     <CardTitle className="text-sm font-medium">
                        Total Orders
                     </CardTitle>
                     <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                     <div className="text-2xl font-bold">
                        {stats?.orders?.total || 0}
                     </div>
                     <p className="text-xs text-muted-foreground">
                        {stats?.orders?.Pending || 0} Pending
                     </p>
                  </CardContent>
               </Card>

               <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                     <CardTitle className="text-sm font-medium">
                        Total Products
                     </CardTitle>
                     <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                     <div className="text-2xl font-bold">
                        {stats?.products?.total || 0}
                     </div>
                     <p className="text-xs text-muted-foreground">
                        {stats?.products?.active || 0} active
                     </p>
                  </CardContent>
               </Card>

               <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                     <CardTitle className="text-sm font-medium">
                        Total Users
                     </CardTitle>
                     <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                     <div className="text-2xl font-bold">
                        {stats?.users?.total || 0}
                     </div>
                     <p className="text-xs text-muted-foreground">
                        {stats?.users?.new || 0} new this month
                     </p>
                  </CardContent>
               </Card>
            </div>

            {/* Alerts */}
            {(stats?.products?.low_stock > 0 ||
               stats?.products?.out_of_stock > 0) && (
               <Card>
                  <CardHeader>
                     <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        Inventory Alerts
                     </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                     {stats?.products?.low_stock > 0 && (
                        <p className="text-sm">
                           <span className="font-medium">
                              {stats.products.low_stock}
                           </span>{" "}
                           products are low on stock
                        </p>
                     )}
                     {stats?.products?.out_of_stock > 0 && (
                        <p className="text-sm text-red-600">
                           <span className="font-medium">
                              {stats.products.out_of_stock}
                           </span>{" "}
                           products are out of stock
                        </p>
                     )}
                  </CardContent>
               </Card>
            )}

            {/* Top Products */}
            <div className="grid gap-4 md:grid-cols-2">
               <Card>
                  <CardHeader>
                     <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Top Selling Products
                     </CardTitle>
                  </CardHeader>
                  <CardContent>
                     <div className="space-y-4">
                        {stats?.top_products &&
                        stats.top_products.length > 0 ? (
                           stats.top_products.map(
                              (product: any, index: number) => (
                                 <div
                                    key={product.id}
                                    className="flex items-center gap-4"
                                 >
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-medium">
                                       #{index + 1}
                                    </div>
                                    <div className="flex-1">
                                       <p className="font-medium">
                                          {product.name}
                                       </p>
                                       <p className="text-sm text-muted-foreground">
                                          {product.total_sold} sold •{" "}
                                          {formatCurrency(
                                             product.total_revenue
                                          )}
                                       </p>
                                    </div>
                                 </div>
                              )
                           )
                        ) : (
                           <p className="text-sm text-muted-foreground">
                              No sales data yet
                           </p>
                        )}
                     </div>
                  </CardContent>
               </Card>

               <Card>
                  <CardHeader>
                     <CardTitle>Recent Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                     <div className="space-y-4">
                        {stats?.recent_orders &&
                        stats.recent_orders.length > 0 ? (
                           stats.recent_orders.slice(0, 5).map((order: any) => (
                              <div
                                 key={order.id}
                                 className="flex items-center justify-between"
                              >
                                 <div>
                                    <p className="font-medium">
                                       #{order.order_number}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                       {order.user?.email || "Unknown"}
                                    </p>
                                 </div>
                                 <div className="text-right">
                                    <p className="font-medium">
                                       {formatCurrency(order.total)}
                                    </p>
                                    <p className="text-sm text-muted-foreground capitalize">
                                       {order.status}
                                    </p>
                                 </div>
                              </div>
                           ))
                        ) : (
                           <p className="text-sm text-muted-foreground">
                              No orders yet
                           </p>
                        )}
                     </div>
                  </CardContent>
               </Card>
            </div>
         </div>
      </AdminLayout>
   );
}
