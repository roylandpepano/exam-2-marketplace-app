"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
   Dialog,
   DialogTrigger,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogDescription,
   DialogFooter,
   DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

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

   return (
      <Dialog open={open} onOpenChange={setOpen}>
         <DialogTrigger asChild>
            <Button variant="ghost" className="gap-2">
               Login
            </Button>
         </DialogTrigger>

         <DialogContent>
            <DialogHeader>
               <DialogTitle>Sign in to ShopEase</DialogTitle>
               <DialogDescription>
                  Enter your account details to continue.
               </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
               <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
               />
               <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
               />

               <DialogFooter>
                  <DialogClose asChild>
                     <Button variant="ghost">Cancel</Button>
                  </DialogClose>
                  <Button type="submit" disabled={isLoading}>
                     {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
               </DialogFooter>
            </form>
         </DialogContent>
      </Dialog>
   );
}

export default LoginDialog;
