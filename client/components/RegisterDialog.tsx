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

export function RegisterDialog() {
   const [open, setOpen] = useState(false);
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
         <DialogTrigger asChild>
            <Button size="sm">Sign Up</Button>
         </DialogTrigger>

         <DialogContent>
            <DialogHeader>
               <DialogTitle>Create your account</DialogTitle>
               <DialogDescription>
                  Join ShopEase and start shopping
               </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
               <Input
                  type="text"
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
               />
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
               <Input
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
               />

               <DialogFooter>
                  <DialogClose asChild>
                     <Button variant="ghost">Cancel</Button>
                  </DialogClose>
                  <Button type="submit" disabled={isLoading}>
                     {isLoading ? "Creating account..." : "Create Account"}
                  </Button>
               </DialogFooter>
            </form>
         </DialogContent>
      </Dialog>
   );
}

export default RegisterDialog;
