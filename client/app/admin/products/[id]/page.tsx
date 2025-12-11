"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { api } from "@/lib/api";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Upload } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function ProductFormPage() {
   const router = useRouter();
   const params = useParams();
   const isEdit = params?.id !== "new";
   const productId = isEdit ? Number(params?.id) : null;

   const [loading, setLoading] = useState(false);
   const [categories, setCategories] = useState<any[]>([]);
   const [formData, setFormData] = useState({
      name: "",
      description: "",
      short_description: "",
      price: "",
      compare_at_price: "",
      sku: "",
      stock_quantity: "",
      category_id: "",
      brand: "",
      is_active: true,
      is_featured: false,
      track_inventory: true,
   });
   const [imageFile, setImageFile] = useState<File | null>(null);
   const [imagePreview, setImagePreview] = useState<string>("");

   useEffect(() => {
      loadCategories();
      if (isEdit && productId) {
         loadProduct();
      }
   }, []);

   const loadCategories = async () => {
      try {
         const data = await api.getCategories({ per_page: 100 });
         setCategories(data.categories);
      } catch (error) {
         console.error("Failed to load categories");
      }
   };

   const loadProduct = async () => {
      if (!productId) return;
      try {
         const data = await api.getProduct(productId);
         const product = data.product;
         setFormData({
            name: product.name || "",
            description: product.description || "",
            short_description: product.short_description || "",
            price: product.price?.toString() || "",
            compare_at_price: product.compare_at_price?.toString() || "",
            sku: product.sku || "",
            stock_quantity: product.stock_quantity?.toString() || "",
            category_id: product.category_id?.toString() || "",
            brand: product.brand || "",
            is_active: product.is_active,
            is_featured: product.is_featured,
            track_inventory: product.track_inventory,
         });
         if (product.image_url) {
            setImagePreview(`${api["baseUrl"]}/${product.image_url}`);
         }
      } catch (error: any) {
         toast.error(error.message || "Failed to load product");
      }
   };

   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
         setImageFile(file);
         const reader = new FileReader();
         reader.onloadend = () => {
            setImagePreview(reader.result as string);
         };
         reader.readAsDataURL(file);
      }
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);

      try {
         const data = new FormData();
         Object.entries(formData).forEach(([key, value]) => {
            data.append(key, value.toString());
         });

         if (imageFile) {
            data.append("image", imageFile);
         }

         if (isEdit && productId) {
            await api.updateProduct(productId, data);
            toast.success("Product updated successfully");
         } else {
            await api.createProduct(data);
            toast.success("Product created successfully");
         }

         router.push("/admin/products");
      } catch (error: any) {
         toast.error(error.message || "Failed to save product");
      } finally {
         setLoading(false);
      }
   };

   return (
      <AdminLayout>
         <div className="space-y-4">
            <div className="flex items-center gap-4">
               <Link href="/admin/products">
                  <Button variant="outline" size="icon">
                     <ArrowLeft className="h-4 w-4" />
                  </Button>
               </Link>
               <div>
                  <h1 className="text-3xl font-bold">
                     {isEdit ? "Edit Product" : "Create Product"}
                  </h1>
                  <p className="text-muted-foreground">
                     {isEdit
                        ? "Update product details"
                        : "Add a new product to your store"}
                  </p>
               </div>
            </div>

            <form onSubmit={handleSubmit}>
               <div className="grid gap-4 md:grid-cols-3">
                  <div className="md:col-span-2 space-y-4">
                     <Card>
                        <CardHeader>
                           <CardTitle>Product Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           <div>
                              <Label htmlFor="name">Product Name *</Label>
                              <Input
                                 id="name"
                                 value={formData.name}
                                 onChange={(e) =>
                                    setFormData({
                                       ...formData,
                                       name: e.target.value,
                                    })
                                 }
                                 required
                              />
                           </div>

                           <div>
                              <Label htmlFor="short_description">
                                 Short Description
                              </Label>
                              <Input
                                 id="short_description"
                                 value={formData.short_description}
                                 onChange={(e) =>
                                    setFormData({
                                       ...formData,
                                       short_description: e.target.value,
                                    })
                                 }
                              />
                           </div>

                           <div>
                              <Label htmlFor="description">Description</Label>
                              <Textarea
                                 id="description"
                                 rows={6}
                                 value={formData.description}
                                 onChange={(e) =>
                                    setFormData({
                                       ...formData,
                                       description: e.target.value,
                                    })
                                 }
                              />
                           </div>

                           <div className="grid gap-4 md:grid-cols-2">
                              <div>
                                 <Label htmlFor="price">Price *</Label>
                                 <Input
                                    id="price"
                                    type="number"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={(e) =>
                                       setFormData({
                                          ...formData,
                                          price: e.target.value,
                                       })
                                    }
                                    required
                                 />
                              </div>

                              <div>
                                 <Label htmlFor="compare_at_price">
                                    Compare at Price
                                 </Label>
                                 <Input
                                    id="compare_at_price"
                                    type="number"
                                    step="0.01"
                                    value={formData.compare_at_price}
                                    onChange={(e) =>
                                       setFormData({
                                          ...formData,
                                          compare_at_price: e.target.value,
                                       })
                                    }
                                 />
                              </div>
                           </div>

                           <div className="grid gap-4 md:grid-cols-2">
                              <div>
                                 <Label htmlFor="sku">SKU</Label>
                                 <Input
                                    id="sku"
                                    value={formData.sku}
                                    onChange={(e) =>
                                       setFormData({
                                          ...formData,
                                          sku: e.target.value,
                                       })
                                    }
                                 />
                              </div>

                              <div>
                                 <Label htmlFor="stock_quantity">
                                    Stock Quantity
                                 </Label>
                                 <Input
                                    id="stock_quantity"
                                    type="number"
                                    value={formData.stock_quantity}
                                    onChange={(e) =>
                                       setFormData({
                                          ...formData,
                                          stock_quantity: e.target.value,
                                       })
                                    }
                                 />
                              </div>
                           </div>

                           <div className="grid gap-4 md:grid-cols-2">
                              <div>
                                 <Label htmlFor="category_id">Category</Label>
                                 <select
                                    id="category_id"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                    value={formData.category_id}
                                    onChange={(e) =>
                                       setFormData({
                                          ...formData,
                                          category_id: e.target.value,
                                       })
                                    }
                                 >
                                    <option value="">Select a category</option>
                                    {categories.map((cat) => (
                                       <option key={cat.id} value={cat.id}>
                                          {cat.name}
                                       </option>
                                    ))}
                                 </select>
                              </div>

                              <div>
                                 <Label htmlFor="brand">Brand</Label>
                                 <Input
                                    id="brand"
                                    value={formData.brand}
                                    onChange={(e) =>
                                       setFormData({
                                          ...formData,
                                          brand: e.target.value,
                                       })
                                    }
                                 />
                              </div>
                           </div>
                        </CardContent>
                     </Card>
                  </div>

                  <div className="space-y-4">
                     <Card>
                        <CardHeader>
                           <CardTitle>Product Image</CardTitle>
                        </CardHeader>
                        <CardContent>
                           <div className="space-y-4">
                              {imagePreview && (
                                 <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-full rounded-lg border"
                                 />
                              )}
                              <Label
                                 htmlFor="image"
                                 className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed p-8 hover:bg-muted"
                              >
                                 <Upload className="h-6 w-6" />
                                 <span>Upload Image</span>
                                 <Input
                                    id="image"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageChange}
                                 />
                              </Label>
                           </div>
                        </CardContent>
                     </Card>

                     <Card>
                        <CardHeader>
                           <CardTitle>Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           <div className="flex items-center justify-between">
                              <Label htmlFor="is_active">Active</Label>
                              <input
                                 id="is_active"
                                 type="checkbox"
                                 className="h-4 w-4 rounded border-gray-300"
                                 checked={formData.is_active}
                                 onChange={(e) =>
                                    setFormData({
                                       ...formData,
                                       is_active: e.target.checked,
                                    })
                                 }
                              />
                           </div>

                           <div className="flex items-center justify-between">
                              <Label htmlFor="is_featured">Featured</Label>
                              <input
                                 id="is_featured"
                                 type="checkbox"
                                 className="h-4 w-4 rounded border-gray-300"
                                 checked={formData.is_featured}
                                 onChange={(e) =>
                                    setFormData({
                                       ...formData,
                                       is_featured: e.target.checked,
                                    })
                                 }
                              />
                           </div>

                           <div className="flex items-center justify-between">
                              <Label htmlFor="track_inventory">
                                 Track Inventory
                              </Label>
                              <input
                                 id="track_inventory"
                                 type="checkbox"
                                 className="h-4 w-4 rounded border-gray-300"
                                 checked={formData.track_inventory}
                                 onChange={(e) =>
                                    setFormData({
                                       ...formData,
                                       track_inventory: e.target.checked,
                                    })
                                 }
                              />
                           </div>
                        </CardContent>
                     </Card>

                     <Button
                        type="submit"
                        className="w-full"
                        disabled={loading}
                     >
                        <Save className="mr-2 h-4 w-4" />
                        {loading
                           ? "Saving..."
                           : isEdit
                           ? "Update Product"
                           : "Create Product"}
                     </Button>
                  </div>
               </div>
            </form>
         </div>
      </AdminLayout>
   );
}
