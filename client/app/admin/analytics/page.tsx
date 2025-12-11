"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
   BarChart3,
   TrendingUp,
   Package,
   Users as UsersIcon,
} from "lucide-react";

export default function AnalyticsPage() {
   const [stats, setStats] = useState<any>(null);
   const [productPerf, setProductPerf] = useState<any>(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      loadAnalytics();
   }, []);

   const loadAnalytics = async () => {
      try {
         const [dashData, prodData] = await Promise.all([
            api.getDashboard(30),
            api.getProductPerformance(),
         ]);
         setStats(dashData);
         setProductPerf(prodData);
      } catch (error) {
         console.error("Failed to load analytics");
      } finally {
         setLoading(false);
      }
   };

   const formatPrice = (price: number) =>
      new Intl.NumberFormat("en-US", {
         style: "currency",
         currency: "USD",
      }).format(price);

   if (loading) {
      return (
         <AdminLayout>
            <div className="p-8 text-center">Loading analytics...</div>
         </AdminLayout>
      );
   }

   return (
      <AdminLayout>
         <div className="space-y-4">
            <div>
               <h1 className="text-3xl font-bold">Analytics</h1>
               <p className="text-muted-foreground">
                  Detailed performance metrics
               </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
               <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                     <CardTitle className="text-sm font-medium">
                        30-Day Revenue
                     </CardTitle>
                     <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                     <div className="text-2xl font-bold">
                        {formatPrice(stats?.revenue?.recent?.total || 0)}
                     </div>
                     <p className="text-xs text-muted-foreground">
                        {stats?.revenue?.recent?.order_count || 0} orders
                     </p>
                  </CardContent>
               </Card>

               <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                     <CardTitle className="text-sm font-medium">
                        Avg Order Value
                     </CardTitle>
                     <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                     <div className="text-2xl font-bold">
                        {formatPrice(
                           (stats?.revenue?.recent?.total || 0) /
                              (stats?.revenue?.recent?.order_count || 1)
                        )}
                     </div>
                     <p className="text-xs text-muted-foreground">
                        Last 30 days
                     </p>
                  </CardContent>
               </Card>

               <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                     <CardTitle className="text-sm font-medium">
                        Active Products
                     </CardTitle>
                     <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                     <div className="text-2xl font-bold">
                        {stats?.products?.active || 0}
                     </div>
                     <p className="text-xs text-muted-foreground">
                        of {stats?.products?.total || 0} total
                     </p>
                  </CardContent>
               </Card>

               <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                     <CardTitle className="text-sm font-medium">
                        New Users
                     </CardTitle>
                     <UsersIcon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                     <div className="text-2xl font-bold">
                        {stats?.users?.new || 0}
                     </div>
                     <p className="text-xs text-muted-foreground">
                        Last 30 days
                     </p>
                  </CardContent>
               </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
               <Card>
                  <CardHeader>
                     <CardTitle>Top Selling Products</CardTitle>
                  </CardHeader>
                  <CardContent>
                     <div className="space-y-4">
                        {productPerf?.top_sellers &&
                        productPerf.top_sellers.length > 0 ? (
                           productPerf.top_sellers.map(
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
                                          {formatPrice(product.revenue)}
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
                     <CardTitle>Low Stock Products</CardTitle>
                  </CardHeader>
                  <CardContent>
                     <div className="space-y-4">
                        {productPerf?.low_stock &&
                        productPerf.low_stock.length > 0 ? (
                           productPerf.low_stock.map((product: any) => (
                              <div
                                 key={product.id}
                                 className="flex items-center justify-between"
                              >
                                 <div>
                                    <p className="font-medium">
                                       {product.name}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                       {product.sku}
                                    </p>
                                 </div>
                                 <span className="text-sm font-medium text-yellow-600">
                                    {product.stock_quantity} left
                                 </span>
                              </div>
                           ))
                        ) : (
                           <p className="text-sm text-muted-foreground">
                              All products well stocked
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
