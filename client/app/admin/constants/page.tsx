"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function ConstantsPage() {
   const [loading, setLoading] = useState(false);
   const [saving, setSaving] = useState(false);
   const [tax, setTax] = useState(0);

   useEffect(() => {
      loadConstants();
   }, []);

   const loadConstants = async () => {
      try {
         setLoading(true);
         const res = await api.getConstants();
         const c = res.constants || {};
         setTax(Number(c.tax || 0));
      } catch (err: any) {
         toast.error(err.message || "Failed to load constants");
      } finally {
         setLoading(false);
      }
   };

   const save = async () => {
      try {
         setSaving(true);
         await api.updateAdminConstants({ tax });
         toast.success("Constants updated");
      } catch (err: any) {
         toast.error(err.message || "Failed to save constants");
      } finally {
         setSaving(false);
      }
   };

   return (
      <AdminLayout>
         <div className="space-y-4">
            <div>
               <h1 className="text-3xl font-bold tracking-tight">
                  Site Constants
               </h1>
               <p className="text-muted-foreground">
                  Update global store constants
               </p>
            </div>

            <Card>
               <CardHeader>
                  <CardTitle>General</CardTitle>
               </CardHeader>
               <CardContent>
                  <div className="grid grid-cols-1 gap-4 max-w-md">
                     <label className="text-sm">Tax (%)</label>
                     <Input
                        value={tax}
                        onChange={(e) => setTax(Number(e.target.value))}
                        type="number"
                        step="0.01"
                        disabled={loading}
                     />

                     <div className="pt-2">
                        <Button onClick={save} disabled={saving}>
                           {saving ? "Saving..." : "Save"}
                        </Button>
                     </div>
                  </div>
               </CardContent>
            </Card>
         </div>
      </AdminLayout>
   );
}
