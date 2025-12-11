/**
 * Register Page
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

export default function RegisterPage() {
   const [name, setName] = useState("");
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [confirmPassword, setConfirmPassword] = useState("");
   const [isLoading, setIsLoading] = useState(false);
   const { register } = useAuth();
   const router = useRouter();

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!name || !email || !password || !confirmPassword) {
         toast.error("Please fill in all fields");
         return;
      }

      if (password !== confirmPassword) {
         toast.error("Passwords do not match");
         return;
      }

      if (password.length < 6) {
         toast.error("Password must be at least 6 characters");
         return;
      }

      setIsLoading(true);
      try {
         await register(name, email, password);
         toast.success("Account created successfully!");
         router.push("/");
      } catch (error) {
         toast.error("Failed to create account");
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
                     <h1 className="text-3xl font-bold mb-2">Create Account</h1>
                     <p className="text-muted-foreground">
                        Join ShopEase and start shopping
                     </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium mb-2">
                           Full Name
                        </label>
                        <Input
                           type="text"
                           value={name}
                           onChange={(e) => setName(e.target.value)}
                           placeholder="John Doe"
                           disabled={isLoading}
                        />
                     </div>

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
                           placeholder="At least 6 characters"
                           disabled={isLoading}
                        />
                     </div>

                     <div>
                        <label className="block text-sm font-medium mb-2">
                           Confirm Password
                        </label>
                        <Input
                           type="password"
                           value={confirmPassword}
                           onChange={(e) => setConfirmPassword(e.target.value)}
                           placeholder="Confirm your password"
                           disabled={isLoading}
                        />
                     </div>

                     <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                        size="lg"
                     >
                        {isLoading ? "Creating account..." : "Create Account"}
                     </Button>
                  </form>

                  <div className="mt-6 text-center text-sm text-muted-foreground">
                     Already have an account?{" "}
                     <Link
                        href="/login"
                        className="text-blue-600 hover:underline font-semibold"
                     >
                        Sign in
                     </Link>
                  </div>
               </div>
            </Card>
         </motion.div>
      </div>
   );
}
