"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { Plus, Search, Pencil, Trash2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

export default function ProductsPage() {
   const router = useRouter();
   const [products, setProducts] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);
   const [search, setSearch] = useState("");
   const [page, setPage] = useState(1);
   const [total, setTotal] = useState(0);

   useEffect(() => {
      loadProducts();
   }, [page, search]);

   const loadProducts = async () => {
      try {
         setLoading(true);
         const data = await api.getProducts({
            page,
            per_page: 20,
            search,
         });
         setProducts(data.products);
         setTotal(data.total);
      } catch (error: any) {
         toast.error(error.message || "Failed to load products");
      } finally {
         setLoading(false);
      }
   };

   const handleDelete = async (id: number) => {
      if (!confirm("Are you sure you want to delete this product?")) return;

      try {
         await api.deleteProduct(id);
         toast.success("Product deleted successfully");
         loadProducts();
      } catch (error: any) {
         toast.error(error.message || "Failed to delete product");
      }
   };

   const formatPrice = (price: number) => {
      return new Intl.NumberFormat("en-US", {
         style: "currency",
         currency: "USD",
      }).format(price);
   };

   return (
      <AdminLayout>
         <div className="space-y-4">
            <div className="flex items-center justify-between">
               <div>
                  <h1 className="text-3xl font-bold tracking-tight">
                     Products
                  </h1>
                  <p className="text-muted-foreground">
                     Manage your product inventory
                  </p>
               </div>
               <Link href="/admin/products/new">
                  <Button>
                     <Plus className="mr-2 h-4 w-4" />
                     Add Product
                  </Button>
               </Link>
            </div>

            <Card>
               <CardHeader>
                  <CardTitle>Product List</CardTitle>
                  <CardDescription>
                     A list of all products in your store
                  </CardDescription>
               </CardHeader>
               <CardContent>
                  <div className="mb-4 flex items-center gap-2">
                     <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                           placeholder="Search products..."
                           value={search}
                           onChange={(e) => {
                              setSearch(e.target.value);
                              setPage(1);
                           }}
                           className="pl-8"
                        />
                     </div>
                  </div>

                  <div className="rounded-md border">
                     <Table>
                        <TableHeader>
                           <TableRow>
                              <TableHead className="w-[100px]">Image</TableHead>
                              <TableHead>Name</TableHead>
                              <TableHead>SKU</TableHead>
                              <TableHead>Price</TableHead>
                              <TableHead>Stock</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">
                                 Actions
                              </TableHead>
                           </TableRow>
                        </TableHeader>
                        <TableBody>
                           {loading ? (
                              [...Array(5)].map((_, i) => (
                                 <TableRow key={i}>
                                    <TableCell colSpan={7}>
                                       <div className="h-12 w-full animate-pulse bg-muted rounded"></div>
                                    </TableCell>
                                 </TableRow>
                              ))
                           ) : products.length === 0 ? (
                              <TableRow>
                                 <TableCell
                                    colSpan={7}
                                    className="text-center py-8"
                                 >
                                    <div className="flex flex-col items-center gap-2">
                                       <ImageIcon className="h-12 w-12 text-muted-foreground" />
                                       <p className="text-sm text-muted-foreground">
                                          No products found
                                       </p>
                                       <Link href="/admin/products/new">
                                          <Button size="sm">
                                             Add your first product
                                          </Button>
                                       </Link>
                                    </div>
                                 </TableCell>
                              </TableRow>
                           ) : (
                              products.map((product) => (
                                 <TableRow key={product.id}>
                                    <TableCell>
                                       {product.image_url ? (
                                          <img
                                             src={`${api["baseUrl"]}/${product.image_url}`}
                                             alt={product.name}
                                             className="h-12 w-12 rounded object-cover"
                                          />
                                       ) : (
                                          <div className="flex h-12 w-12 items-center justify-center rounded bg-muted">
                                             <ImageIcon className="h-6 w-6 text-muted-foreground" />
                                          </div>
                                       )}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                       {product.name}
                                    </TableCell>
                                    <TableCell>{product.sku || "-"}</TableCell>
                                    <TableCell>
                                       {formatPrice(product.price)}
                                    </TableCell>
                                    <TableCell>
                                       <span
                                          className={
                                             product.stock_quantity === 0
                                                ? "text-red-600"
                                                : product.is_low_stock
                                                ? "text-yellow-600"
                                                : ""
                                          }
                                       >
                                          {product.stock_quantity}
                                       </span>
                                    </TableCell>
                                    <TableCell>
                                       <span
                                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                             product.is_active
                                                ? "bg-green-50 text-green-700"
                                                : "bg-gray-50 text-gray-700"
                                          }`}
                                       >
                                          {product.is_active
                                             ? "Active"
                                             : "Inactive"}
                                       </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                       <div className="flex justify-end gap-2">
                                          <Link
                                             href={`/admin/products/${product.id}`}
                                          >
                                             <Button
                                                size="sm"
                                                variant="outline"
                                             >
                                                <Pencil className="h-4 w-4" />
                                             </Button>
                                          </Link>
                                          <Button
                                             size="sm"
                                             variant="outline"
                                             onClick={() =>
                                                handleDelete(product.id)
                                             }
                                          >
                                             <Trash2 className="h-4 w-4" />
                                          </Button>
                                       </div>
                                    </TableCell>
                                 </TableRow>
                              ))
                           )}
                        </TableBody>
                     </Table>
                  </div>

                  {total > 20 && (
                     <div className="mt-4 flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                           Showing {(page - 1) * 20 + 1} to{" "}
                           {Math.min(page * 20, total)} of {total} products
                        </p>
                        <div className="flex gap-2">
                           <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setPage(page - 1)}
                              disabled={page === 1}
                           >
                              Previous
                           </Button>
                           <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setPage(page + 1)}
                              disabled={page * 20 >= total}
                           >
                              Next
                           </Button>
                        </div>
                     </div>
                  )}
               </CardContent>
            </Card>
         </div>
      </AdminLayout>
   );
}
