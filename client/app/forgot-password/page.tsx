/**
 * Forgot Password Page
 */
"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
   const [email, setEmail] = useState("");
   const [isLoading, setIsLoading] = useState(false);
   const [submitted, setSubmitted] = useState(false);

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!email) {
         toast.error("Please enter your email address");
         return;
      }

      setIsLoading(true);
      try {
         // Simulate API call
         await new Promise((resolve) => setTimeout(resolve, 1000));
         setSubmitted(true);
         toast.success("Password reset link sent to your email!");
      } catch (error) {
         toast.error("Failed to send reset link");
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
                     href="/login"
                     className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
                  >
                     <ArrowLeft className="h-4 w-4" />
                     Back to login
                  </Link>

                  <div className="mb-8">
                     <h1 className="text-3xl font-bold mb-2">Reset Password</h1>
                     <p className="text-muted-foreground">
                        Enter your email address and we'll send you a link to
                        reset your password
                     </p>
                  </div>

                  {submitted ? (
                     <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-8"
                     >
                        <div className="mb-4 text-4xl">📧</div>
                        <h2 className="text-xl font-semibold mb-2">
                           Check your email
                        </h2>
                        <p className="text-muted-foreground mb-6">
                           We've sent a password reset link to{" "}
                           <strong>{email}</strong>
                        </p>
                        <p className="text-sm text-muted-foreground mb-6">
                           Click the link in the email to reset your password.
                           If you don't see it, check your spam folder.
                        </p>
                        <Link href="/login">
                           <Button variant="outline" className="w-full">
                              Back to Login
                           </Button>
                        </Link>
                     </motion.div>
                  ) : (
                     <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                           <label className="block text-sm font-medium mb-2">
                              Email Address
                           </label>
                           <Input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="you@example.com"
                              disabled={isLoading}
                           />
                        </div>

                        <Button
                           type="submit"
                           className="w-full"
                           disabled={isLoading}
                           size="lg"
                        >
                           {isLoading ? "Sending..." : "Send Reset Link"}
                        </Button>
                     </form>
                  )}
               </div>
            </Card>
         </motion.div>
      </div>
   );
}
