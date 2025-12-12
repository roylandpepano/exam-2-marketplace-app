"use client";

import { useState, ReactNode } from "react";
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

interface RegisterDialogProps {
   trigger?: ReactNode;
   open?: boolean;
   onOpenChange?: (open: boolean) => void;
}

export function RegisterDialog({
   trigger,
   open: openProp,
   onOpenChange,
}: RegisterDialogProps) {
   const [internalOpen, setInternalOpen] = useState(false);
   const isControlled = typeof openProp !== "undefined";
   const open = isControlled ? openProp : internalOpen;
   const setOpen = (v: boolean) => {
      if (isControlled) onOpenChange?.(v);
      else setInternalOpen(v);
   };
   const [name, setName] = useState("");
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [confirmPassword, setConfirmPassword] = useState("");
   const [isLoading, setIsLoading] = useState(false);
   const { register } = useAuth();
   const router = useRouter();

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!name || !email || !password || !confirmPassword)
         return toast.error("Please fill in all fields");
      if (password !== confirmPassword)
         return toast.error("Passwords do not match");
      if (password.length < 6)
         return toast.error("Password must be at least 6 characters");

      setIsLoading(true);
      try {
         await register(name, email, password);
         toast.success("Account created successfully!");
         setOpen(false);
         router.refresh();
      } catch (err) {
         console.error(err);
         toast.error("Failed to create account");
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <Dialog open={open} onOpenChange={setOpen}>
         {trigger ? (
            <DialogTrigger asChild>{trigger}</DialogTrigger>
         ) : (
            <DialogTrigger asChild>
               <Button size="sm">Sign Up</Button>
            </DialogTrigger>
         )}

         <DialogContent className="sm:max-w-[520px] w-full p-0">
            <div className="bg-white dark:bg-slate-900/80 rounded-lg shadow-lg overflow-hidden">
               <div className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                     <div>
                        <DialogTitle className="text-lg font-semibold">
                           Create your account
                        </DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground">
                           Join ShopEase and start shopping.
                        </DialogDescription>
                     </div>

                     <div className="shrink-0 h-10 w-10 rounded-full bg-linear-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                        S
                     </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium mb-1">
                           Full name
                        </label>
                        <Input
                           type="text"
                           placeholder="Full name"
                           value={name}
                           onChange={(e) => setName(e.target.value)}
                        />
                     </div>

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
                     </div>

                     <div>
                        <label className="block text-sm font-medium mb-1">
                           Confirm password
                        </label>
                        <Input
                           type="password"
                           placeholder="••••••••"
                           value={confirmPassword}
                           onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                     </div>

                     <div>
                        <Button
                           type="submit"
                           className="w-full"
                           disabled={isLoading}
                        >
                           {isLoading
                              ? "Creating account..."
                              : "Create account"}
                        </Button>
                     </div>

                     <div className="pt-2 text-center">
                        <span className="text-sm text-muted-foreground">
                           Already have an account?{" "}
                           <button
                              type="button"
                              onClick={() => {
                                 setOpen(false);
                                 if (typeof window !== "undefined") {
                                    window.dispatchEvent(
                                       new CustomEvent("open-login-dialog")
                                    );
                                 }
                              }}
                              className="underline text-blue-500"
                           >
                              Sign in
                           </button>
                        </span>
                     </div>
                  </form>
               </div>
            </div>
         </DialogContent>
      </Dialog>
   );
}

export default RegisterDialog;
