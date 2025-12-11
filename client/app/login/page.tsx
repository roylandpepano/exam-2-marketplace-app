"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
   Card,
   CardContent,
   CardDescription,
   CardHeader,
   CardTitle,
} from "@/components/ui/card";
import { Package } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
   const router = useRouter();
   const searchParams = useSearchParams();
   const { login } = useAuth();
   const [loading, setLoading] = useState(false);
   const [formData, setFormData] = useState({
      email: "",
      password: "",
   });

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);

      try {
         const data = await login(formData.email, formData.password);

         if (data.user.is_admin) {
            const redirect = searchParams?.get("redirect") || "/admin";
            router.push(redirect);
            toast.success("Welcome back!");
         } else {
            toast.error("Access denied. Admin privileges required.");
         }
      } catch (error) {
         const err = error as Error;
         toast.error(
            err.message || "Login failed. Please check your credentials."
         );
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
         <Card className="w-full max-w-md">
            <CardHeader className="space-y-1 text-center">
               <div className="flex justify-center mb-2">
                  <div className="rounded-full bg-primary p-3">
                     <Package className="h-6 w-6 text-primary-foreground" />
                  </div>
               </div>
               <CardTitle className="text-2xl">Admin Login</CardTitle>
               <CardDescription>
                  Enter your credentials to access the admin panel
               </CardDescription>
            </CardHeader>
            <CardContent>
               <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                     <Label htmlFor="email">Email</Label>
                     <Input
                        id="email"
                        type="email"
                        placeholder="admin@example.com"
                        value={formData.email}
                        onChange={(e) =>
                           setFormData({ ...formData, email: e.target.value })
                        }
                        required
                        autoFocus
                     />
                  </div>
                  <div className="space-y-2">
                     <Label htmlFor="password">Password</Label>
                     <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) =>
                           setFormData({
                              ...formData,
                              password: e.target.value,
                           })
                        }
                        required
                     />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                     {loading ? "Signing in..." : "Sign In"}
                  </Button>
               </form>
               <div className="mt-4 text-center text-sm text-muted-foreground">
                  <p>Default credentials:</p>
                  <p className="font-mono text-xs">
                     admin@example.com / admin123
                  </p>
               </div>
            </CardContent>
         </Card>
      </div>
   );
}
