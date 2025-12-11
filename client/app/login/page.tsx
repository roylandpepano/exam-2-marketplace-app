/**
 * Login Page
 */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

export default function LoginPage() {
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [isLoading, setIsLoading] = useState(false);
   const { login } = useAuth();
   const router = useRouter();

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!email || !password) {
         toast.error("Please fill in all fields");
         return;
      }

      setIsLoading(true);
      try {
         await login(email, password);
         toast.success("Logged in successfully!");
         router.push("/");
      } catch (error) {
         toast.error("Failed to login");
         console.error(error);
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4 py-12">
         <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md"
         >
            <Card className="border-0 shadow-xl">
               <div className="p-8">
                  <Link
                     href="/"
                     className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
                  >
                     <ArrowLeft className="h-4 w-4" />
                     Back to home
                  </Link>

                  <div className="mb-8">
                     <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
                     <p className="text-muted-foreground">
                        Sign in to your ShopEase account
                     </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium mb-2">
                           Email
                        </label>
                        <Input
                           type="email"
                           value={email}
                           onChange={(e) => setEmail(e.target.value)}
                           placeholder="you@example.com"
                           disabled={isLoading}
                        />
                     </div>

                     <div>
                        <label className="block text-sm font-medium mb-2">
                           Password
                        </label>
                        <Input
                           type="password"
                           value={password}
                           onChange={(e) => setPassword(e.target.value)}
                           placeholder="Enter your password"
                           disabled={isLoading}
                        />
                     </div>

                     <Link
                        href="/forgot-password"
                        className="text-sm text-blue-600 hover:underline inline-block"
                     >
                        Forgot password?
                     </Link>

                     <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                        size="lg"
                     >
                        {isLoading ? "Signing in..." : "Sign In"}
                     </Button>
                  </form>

                  <div className="mt-6 text-center text-sm text-muted-foreground">
                     Don't have an account?{" "}
                     <Link
                        href="/register"
                        className="text-blue-600 hover:underline font-semibold"
                     >
                        Sign up
                     </Link>
                  </div>
               </div>
            </Card>
         </motion.div>
      </div>
   );
}
