"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
   Dialog,
   DialogTrigger,
   DialogContent,
   DialogTitle,
   DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import Link from "next/link";
import ForgotPasswordDialog from "@/components/ForgotPasswordDialog";
import RegisterDialog from "@/components/RegisterDialog";

export function LoginDialog() {
   const [open, setOpen] = useState(false);
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [isLoading, setIsLoading] = useState(false);
   const { login } = useAuth();
   const router = useRouter();

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email || !password) return toast.error("Please fill in all fields");
      setIsLoading(true);
      try {
         await login(email, password);
         toast.success("Logged in successfully!");
         setOpen(false);
         router.refresh();
      } catch (err) {
         console.error(err);
         toast.error("Failed to login");
      } finally {
         setIsLoading(false);
      }
   };

   useEffect(() => {
      const openHandler = () => setOpen(true);
      window.addEventListener(
         "open-login-dialog",
         openHandler as EventListener
      );
      return () =>
         window.removeEventListener(
            "open-login-dialog",
            openHandler as EventListener
         );
   }, []);

   return (
      <Dialog open={open} onOpenChange={setOpen}>
         <DialogTrigger asChild>
            <Button variant="ghost" className="gap-2">
               Login
            </Button>
         </DialogTrigger>

         <DialogContent className="sm:max-w-[420px] w-full p-0">
            <div className="bg-white dark:bg-slate-900/80 rounded-lg shadow-lg overflow-hidden">
               <div className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                     <div>
                        <DialogTitle className="text-lg font-semibold">
                           Welcome back
                        </DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground">
                           Sign in to continue to ShopEase. If admin,{" "}
                           <Link
                              href="/admin"
                              className="underline text-blue-500"
                           >
                              click here
                           </Link>
                           .
                        </DialogDescription>
                     </div>

                     <div className="shrink-0 h-10 w-10 rounded-full bg-linear-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                        S
                     </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium mb-1">
                           Email
                        </label>
                        <Input
                           type="email"
                           placeholder="you@example.com"
                           value={email}
                           onChange={(e) => setEmail(e.target.value)}
                        />
                     </div>

                     <div>
                        <label className="block text-sm font-medium mb-1">
                           Password
                        </label>
                        <Input
                           type="password"
                           placeholder="••••••••"
                           value={password}
                           onChange={(e) => setPassword(e.target.value)}
                        />

                        <div className="text-right mt-2">
                           <ForgotPasswordDialog
                              trigger={
                                 <span className="text-sm underline text-blue-500 cursor-pointer">
                                    Forgot password?
                                 </span>
                              }
                           />
                        </div>
                     </div>

                     <div>
                        <Button
                           type="submit"
                           className="w-full"
                           disabled={isLoading}
                        >
                           {isLoading ? "Signing in..." : "Sign in"}
                        </Button>
                     </div>

                     <div className="pt-2 text-center">
                        <span className="text-sm text-muted-foreground">
                           New here?{" "}
                           <RegisterDialog
                              trigger={
                                 <span className="underline text-blue-500 cursor-pointer">
                                    Create an account
                                 </span>
                              }
                           />
                        </span>
                     </div>
                  </form>
               </div>
            </div>
         </DialogContent>
      </Dialog>
   );
}

export default LoginDialog;
