"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from "@/components/ui/table";
import {
   Card,
   CardContent,
   CardDescription,
   CardHeader,
   CardTitle,
} from "@/components/ui/card";
import { Search, Eye } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/currency";
import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function OrdersPage() {
   const [orders, setOrders] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);
   const [search, setSearch] = useState("");
   const [page, setPage] = useState(1);
   const [total, setTotal] = useState(0);
   const [selectedOrder, setSelectedOrder] = useState<any>(null);
   const [dialogOpen, setDialogOpen] = useState(false);

   useEffect(() => {
      loadOrders();
   }, [search, page]);

   const perPage = 10;

   const loadOrders = async () => {
      try {
         setLoading(true);
         const data = await api.getOrders({ search, per_page: perPage, page });
         setOrders(data.orders);
         setTotal(data.total ?? data.total_count ?? 0);
      } catch (error: any) {
         toast.error(error.message || "Failed to load orders");
      } finally {
         setLoading(false);
      }
   };

   const viewOrder = async (id: number) => {
      try {
         const data = await api.getOrder(id);
         setSelectedOrder(data.order);
         setDialogOpen(true);
      } catch (error: any) {
         toast.error(error.message || "Failed to load order");
      }
   };

   const updateStatus = async (id: number, status: string) => {
      try {
         await api.updateOrderStatus(id, status);
         toast.success("Status updated");
         loadOrders();
         if (selectedOrder?.id === id) {
            setDialogOpen(false);
         }
      } catch (error: any) {
         toast.error(error.message || "Failed to update status");
      }
   };

   // use formatCurrency (PHP) for admin order displays

   return (
      <AdminLayout>
         <div className="space-y-4">
            <div>
               <h1 className="text-3xl font-bold">Orders</h1>
               <p className="text-muted-foreground">Manage customer orders</p>
            </div>

            <Card>
               <CardHeader>
                  <CardTitle>Order List</CardTitle>
                  <CardDescription>All customer orders</CardDescription>
               </CardHeader>
               <CardContent>
                  <div className="mb-4">
                     <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                           placeholder="Search orders..."
                           value={search}
                           onChange={(e) => {
                              setSearch(e.target.value);
                              setPage(1);
                           }}
                           className="pl-8"
                        />
                     </div>
                  </div>

                  <Table>
                     <TableHeader>
                        <TableRow>
                           <TableHead>Order #</TableHead>
                           <TableHead>Customer</TableHead>
                           <TableHead>Total</TableHead>
                           <TableHead>Status</TableHead>
                           <TableHead>Payment</TableHead>
                           <TableHead>Date</TableHead>
                           <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                     </TableHeader>
                     <TableBody>
                        {loading ? (
                           <TableRow>
                              <TableCell colSpan={7}>Loading...</TableCell>
                           </TableRow>
                        ) : orders.length === 0 ? (
                           <TableRow>
                              <TableCell colSpan={7} className="text-center">
                                 No orders
                              </TableCell>
                           </TableRow>
                        ) : (
                           orders.map((order) => (
                              <TableRow key={order.id}>
                                 <TableCell className="font-medium">
                                    #{order.order_number}
                                 </TableCell>
                                 <TableCell>
                                    {order.user?.email || "Unknown"}
                                 </TableCell>
                                 <TableCell>
                                    {formatCurrency(order.total)}
                                 </TableCell>
                                 <TableCell>
                                    <span className="inline-flex items-center rounded-full px-2 py-1 text-xs bg-blue-50 text-blue-700 capitalize">
                                       {order.status}
                                    </span>
                                 </TableCell>
                                 <TableCell>
                                    <span
                                       className={`inline-flex items-center rounded-full px-2 py-1 text-xs capitalize ${
                                          order.payment_status === "paid"
                                             ? "bg-green-50 text-green-700"
                                             : "bg-yellow-50 text-yellow-700"
                                       }`}
                                    >
                                       {order.payment_status}
                                    </span>
                                 </TableCell>
                                 <TableCell>
                                    {new Date(
                                       order.created_at
                                    ).toLocaleDateString()}
                                 </TableCell>
                                 <TableCell className="text-right">
                                    <Button
                                       size="sm"
                                       variant="outline"
                                       onClick={() => viewOrder(order.id)}
                                    >
                                       <Eye className="h-4 w-4" />
                                    </Button>
                                 </TableCell>
                              </TableRow>
                           ))
                        )}
                     </TableBody>
                  </Table>

                  {total > perPage && (
                     <div className="mt-4 flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                           Showing {(page - 1) * perPage + 1} to{" "}
                           {Math.min(page * perPage, total)} of {total} orders
                        </p>
                        <div className="flex gap-2">
                           <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setPage(Math.max(1, page - 1))}
                              disabled={page === 1}
                           >
                              Previous
                           </Button>
                           <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setPage(page + 1)}
                              disabled={page * perPage >= total}
                           >
                              Next
                           </Button>
                        </div>
                     </div>
                  )}
               </CardContent>
            </Card>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
               <DialogContent className="max-w-2xl">
                  <DialogHeader>
                     <DialogTitle>
                        Order #{selectedOrder?.order_number}
                     </DialogTitle>
                  </DialogHeader>
                  {selectedOrder && (
                     <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <Label>Customer</Label>
                              <p className="text-sm">
                                 {selectedOrder.user?.email}
                              </p>
                           </div>
                           <div>
                              <Label>Total</Label>
                              <p className="text-sm font-medium">
                                 {formatCurrency(selectedOrder.total)}
                              </p>
                           </div>
                        </div>

                        <div>
                           <Label className="mb-2">Status</Label>
                           <select
                              className="flex h-10 w-full rounded-md border px-3 py-2 text-sm"
                              value={selectedOrder.status}
                              onChange={(e) =>
                                 updateStatus(selectedOrder.id, e.target.value)
                              }
                           >
                              <option value="Pending">Pending</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Processing">Processing</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                           </select>
                        </div>

                        <div>
                           <Label>Items</Label>
                           <div className="mt-2 space-y-2">
                              {selectedOrder.items?.map((item: any) => (
                                 <div
                                    key={item.id}
                                    className="flex justify-between text-sm"
                                 >
                                    <span>
                                       {item.product_name} x {item.quantity}
                                    </span>
                                    <span>
                                       {formatCurrency(item.total_price)}
                                    </span>
                                 </div>
                              ))}
                           </div>
                        </div>

                        <div>
                           <Label>Shipping Address</Label>
                           <p className="text-sm mt-1">
                              {selectedOrder.shipping_address?.name ||
                                 selectedOrder.shipping_name}
                              {selectedOrder.shipping_address?.name ||
                              selectedOrder.shipping_name ? (
                                 <br />
                              ) : null}
                              {selectedOrder.shipping_address?.street ||
                                 selectedOrder.shipping_street}
                              {selectedOrder.shipping_address?.street ||
                              selectedOrder.shipping_street ? (
                                 <br />
                              ) : null}
                              {selectedOrder.shipping_address?.city ||
                                 selectedOrder.shipping_city}
                              {selectedOrder.shipping_address?.city ||
                              selectedOrder.shipping_city
                                 ? ", "
                                 : ""}
                              {selectedOrder.shipping_address?.state ||
                                 selectedOrder.shipping_state}{" "}
                              {selectedOrder.shipping_address?.postal_code ||
                                 selectedOrder.shipping_postal_code}
                              <br />
                              {selectedOrder.shipping_address?.country ||
                                 selectedOrder.shipping_country}
                           </p>
                        </div>
                     </div>
                  )}
               </DialogContent>
            </Dialog>
         </div>
      </AdminLayout>
   );
}
