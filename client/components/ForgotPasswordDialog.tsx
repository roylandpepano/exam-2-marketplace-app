"use client";

import React, { useState } from "react";
import {
   Dialog,
   DialogTrigger,
   DialogContent,
   DialogTitle,
   DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Props = {
   trigger?: React.ReactNode;
};

export default function ForgotPasswordDialog({ trigger }: Props) {
   const [open, setOpen] = useState(false);
   const [email, setEmail] = useState("");
   const [isLoading, setIsLoading] = useState(false);
   const [submitted, setSubmitted] = useState(false);

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email) return toast.error("Please enter your email address");
      setIsLoading(true);
      try {
         // Replace with real API call when available
         await new Promise((res) => setTimeout(res, 900));
         setSubmitted(true);
         toast.success("Password reset link sent to your email!");
      } catch (err) {
         console.error(err);
         toast.error("Failed to send reset link");
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <Dialog open={open} onOpenChange={setOpen}>
         <DialogTrigger asChild>
            {trigger ?? (
               <span className="text-sm underline text-blue-500 cursor-pointer">
                  Forgot password?
               </span>
            )}
         </DialogTrigger>

         <DialogContent className="sm:max-w-[420px] w-full p-0">
            <div className="bg-white dark:bg-slate-900/80 rounded-lg shadow-lg overflow-hidden">
               <div className="p-6">
                  <div className="mb-4">
                     <DialogTitle className="text-lg font-semibold">
                        Reset Password
                     </DialogTitle>
                     <DialogDescription className="text-sm text-muted-foreground">
                        Enter your email and we'll send a reset link.
                     </DialogDescription>
                  </div>

                  {submitted ? (
                     <div className="text-center py-6">
                        <div className="mb-4 text-4xl">📧</div>
                        <h2 className="text-lg font-semibold mb-2">
                           Check your email
                        </h2>
                        <p className="text-sm text-muted-foreground">
                           We've sent a password reset link to{" "}
                           <strong>{email}</strong>
                        </p>
                        <div className="mt-4">
                           <Button
                              onClick={() => setOpen(false)}
                              className="w-full"
                           >
                              Close
                           </Button>
                        </div>
                     </div>
                  ) : (
                     <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                           <label className="block text-sm font-medium mb-1">
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
                        >
                           {isLoading ? "Sending..." : "Send Reset Link"}
                        </Button>
                     </form>
                  )}
               </div>
            </div>
         </DialogContent>
      </Dialog>
   );
}
