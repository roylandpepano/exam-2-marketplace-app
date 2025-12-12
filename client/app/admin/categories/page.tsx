"use client";

import { useEffect, useState, useRef } from "react";
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
import { Plus, Search, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
} from "@/components/ui/dialog";
import {
   AlertDialog,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function CategoriesPage() {
   const [categories, setCategories] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);
   const [dialogOpen, setDialogOpen] = useState(false);
   const [editingCategory, setEditingCategory] = useState<any>(null);
   const [deleteId, setDeleteId] = useState<number | null>(null);
   const [alertOpen, setAlertOpen] = useState(false);
   const [formData, setFormData] = useState({ name: "", description: "" });
   const [imageFile, setImageFile] = useState<File | null>(null);
   const [imagePreview, setImagePreview] = useState<string | null>(null);
   const previewUrlRef = useRef<string | null>(null);
   const [saving, setSaving] = useState(false);
   const [deleting, setDeleting] = useState(false);

   useEffect(() => {
      loadCategories();
   }, []);

   // Cleanup created object URLs on unmount
   useEffect(() => {
      return () => {
         if (previewUrlRef.current) {
            try {
               URL.revokeObjectURL(previewUrlRef.current);
            } catch {}
            previewUrlRef.current = null;
         }
      };
   }, []);

   const loadCategories = async () => {
      try {
         const data = await api.getCategories({ per_page: 100 });
         setCategories(data.categories);
      } catch (error: any) {
         toast.error(error.message || "Failed to load categories");
      } finally {
         setLoading(false);
      }
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setSaving(true);
      try {
         const data = new FormData();
         data.append("name", formData.name);
         data.append("description", formData.description);
         if (imageFile) data.append("image", imageFile);

         if (editingCategory) {
            await api.updateCategory(editingCategory.id, data);
            toast.success("Category updated");
         } else {
            await api.createCategory(data);
            toast.success("Category created");
         }
         setDialogOpen(false);
         setEditingCategory(null);
         setFormData({ name: "", description: "" });
         setImageFile(null);
         setImagePreview(null);
         loadCategories();
      } catch (error: any) {
         toast.error(error.message || "Failed to save category");
      } finally {
         setSaving(false);
      }
   };

   const handleEdit = (category: any) => {
      setEditingCategory(category);
      setFormData({
         name: category.name,
         description: category.description || "",
      });
      // Clear any previously selected local file, but show existing remote image
      setImageFile(null);
      if (category.image_url) {
         setImagePreview(`${api["baseUrl"]}/${category.image_url}`);
      } else {
         setImagePreview(null);
      }
      setDialogOpen(true);
   };

   const handleDelete = (id: number) => {
      setDeleteId(id);
      setAlertOpen(true);
   };

   const confirmDelete = async () => {
      if (!deleteId) return;
      setDeleting(true);
      try {
         await api.deleteCategory(deleteId);
         toast.success("Category deleted");
         loadCategories();
      } catch (error: any) {
         toast.error(error.message || "Failed to delete category");
      } finally {
         setDeleting(false);
         setAlertOpen(false);
         setDeleteId(null);
      }
   };

   return (
      <AdminLayout>
         <div className="space-y-4">
            <div className="flex items-center justify-between">
               <div>
                  <h1 className="text-3xl font-bold">Categories</h1>
                  <p className="text-muted-foreground">
                     Manage product categories
                  </p>
               </div>
               <Button
                  onClick={() => {
                     setDialogOpen(true);
                     setEditingCategory(null);
                     setFormData({ name: "", description: "" });
                     // clear any previous selected file/preview
                     setImageFile(null);
                     if (previewUrlRef.current) {
                        try {
                           URL.revokeObjectURL(previewUrlRef.current);
                        } catch {}
                        previewUrlRef.current = null;
                     }
                     setImagePreview(null);
                  }}
               >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Category
               </Button>
            </div>

            <Card>
               <CardHeader>
                  <CardTitle>Category List</CardTitle>
                  <CardDescription>All product categories</CardDescription>
               </CardHeader>
               <CardContent>
                  <Table>
                     <TableHeader>
                        <TableRow>
                           <TableHead>Name</TableHead>
                           <TableHead>Products</TableHead>
                           <TableHead>Status</TableHead>
                           <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                     </TableHeader>
                     <TableBody>
                        {loading ? (
                           <TableRow>
                              <TableCell colSpan={4}>Loading...</TableCell>
                           </TableRow>
                        ) : categories.length === 0 ? (
                           <TableRow>
                              <TableCell colSpan={4} className="text-center">
                                 No categories
                              </TableCell>
                           </TableRow>
                        ) : (
                           categories.map((cat) => (
                              <TableRow key={cat.id}>
                                 <TableCell className="font-medium">
                                    {cat.name}
                                 </TableCell>
                                 <TableCell>{cat.product_count || 0}</TableCell>
                                 <TableCell>
                                    <span
                                       className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${
                                          cat.is_active
                                             ? "bg-green-50 text-green-700"
                                             : "bg-gray-50 text-gray-700"
                                       }`}
                                    >
                                       {cat.is_active ? "Active" : "Inactive"}
                                    </span>
                                 </TableCell>
                                 <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                       <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleEdit(cat)}
                                       >
                                          <Pencil className="h-4 w-4" />
                                       </Button>
                                       <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleDelete(cat.id)}
                                          disabled={
                                             deleting && deleteId === cat.id
                                          }
                                       >
                                          {deleting && deleteId === cat.id ? (
                                             <Loader2 className="h-4 w-4 animate-spin" />
                                          ) : (
                                             <Trash2 className="h-4 w-4" />
                                          )}
                                       </Button>
                                    </div>
                                 </TableCell>
                              </TableRow>
                           ))
                        )}
                     </TableBody>
                  </Table>
               </CardContent>
            </Card>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
               <DialogContent>
                  <DialogHeader>
                     <DialogTitle>
                        {editingCategory ? "Edit Category" : "Create Category"}
                     </DialogTitle>
                     <DialogDescription>
                        Fill in the category details
                     </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit}>
                     <div className="space-y-4 py-4">
                        <div>
                           <Label htmlFor="name" className="mb-2">
                              Name *
                           </Label>
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
                           <Label htmlFor="description" className="mb-2">
                              Description
                           </Label>
                           <Textarea
                              id="description"
                              value={formData.description}
                              onChange={(e) =>
                                 setFormData({
                                    ...formData,
                                    description: e.target.value,
                                 })
                              }
                           />
                        </div>
                        <div>
                           <Label htmlFor="image" className="mb-2">
                              Image
                           </Label>
                           <Input
                              id="image"
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                 const file = e.target.files?.[0] || null;
                                 // revoke previous blob URL if we created one
                                 if (file) {
                                    if (previewUrlRef.current) {
                                       try {
                                          URL.revokeObjectURL(
                                             previewUrlRef.current
                                          );
                                       } catch {}
                                    }
                                    const url = URL.createObjectURL(file);
                                    previewUrlRef.current = url;
                                    setImagePreview(url);
                                 } else {
                                    if (previewUrlRef.current) {
                                       try {
                                          URL.revokeObjectURL(
                                             previewUrlRef.current
                                          );
                                       } catch {}
                                       previewUrlRef.current = null;
                                    }
                                    setImagePreview(null);
                                 }
                                 setImageFile(file);
                              }}
                           />
                           {imagePreview ? (
                              <div className="mt-2 flex items-center gap-2">
                                 <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="h-24 w-24 rounded object-cover border"
                                 />
                                 <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                       setImageFile(null);
                                       if (previewUrlRef.current) {
                                          try {
                                             URL.revokeObjectURL(
                                                previewUrlRef.current
                                             );
                                          } catch {}
                                          previewUrlRef.current = null;
                                       }
                                       setImagePreview(null);
                                    }}
                                 >
                                    Remove
                                 </Button>
                              </div>
                           ) : null}
                        </div>
                     </div>
                     <DialogFooter>
                        <Button
                           type="button"
                           variant="outline"
                           onClick={() => setDialogOpen(false)}
                           disabled={saving}
                        >
                           Cancel
                        </Button>
                        <Button type="submit" disabled={saving}>
                           {saving
                              ? editingCategory
                                 ? "Updating..."
                                 : "Creating..."
                              : editingCategory
                              ? "Update"
                              : "Create"}
                        </Button>
                     </DialogFooter>
                  </form>
               </DialogContent>
            </Dialog>

            <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
               <AlertDialogContent>
                  <AlertDialogHeader>
                     <AlertDialogTitle>Delete category</AlertDialogTitle>
                     <AlertDialogDescription>
                        Are you sure you want to delete category {'"'}
                        {categories.find((c) => c.id === deleteId)?.name}
                        {'"'}? This action cannot be undone.
                     </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                     <AlertDialogCancel disabled={deleting}>
                        Cancel
                     </AlertDialogCancel>
                     <div>
                        <Button onClick={confirmDelete} disabled={deleting}>
                           {deleting ? (
                              <div className="flex items-center gap-2">
                                 <Loader2 className="h-4 w-4 animate-spin" />
                                 Deleting...
                              </div>
                           ) : (
                              "Delete"
                           )}
                        </Button>
                     </div>
                  </AlertDialogFooter>
               </AlertDialogContent>
            </AlertDialog>
         </div>
      </AdminLayout>
   );
}
