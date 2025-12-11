/**
 * Navbar component
 * Navigation bar with branding and links
 */
"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Home, ShoppingCart, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import LoginDialog from "@/components/LoginDialog";
import RegisterDialog from "@/components/RegisterDialog";

export function Navbar() {
   const { logout, isLoggedIn } = useAuth();
   const { items } = useCart();
   const router = useRouter();
   const pathname = usePathname();

   if (pathname?.startsWith("/admin")) return null;

   const cartCount = items.length;

   const handleLogout = () => {
      logout();
      router.push("/");
   };

   return (
      <motion.nav
         initial={{ y: -100 }}
         animate={{ y: 0 }}
         className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80"
      >
         <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <Link href="/" className="flex items-center gap-2">
               <Image
                  src="/icon.png"
                  width={64}
                  height={64}
                  alt="ShopEase logo"
               />
               <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex flex-col leading-none"
               >
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                     ShopEase
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                     Marketplace by RoylandVP
                  </span>
               </motion.div>
            </Link>

            <div className="flex items-center gap-2 sm:gap-4">
               <Link href="/">
                  <motion.div
                     whileHover={{ scale: 1.05 }}
                     whileTap={{ scale: 0.95 }}
                  >
                     <Button variant="ghost" className="gap-2">
                        <Home className="h-5 w-5" />
                        <span className="hidden sm:inline">Home</span>
                     </Button>
                  </motion.div>
               </Link>

               <Link href="/cart">
                  <motion.div
                     whileHover={{ scale: 1.05 }}
                     whileTap={{ scale: 0.95 }}
                     className="relative"
                  >
                     <Button variant="ghost" className="gap-2">
                        <ShoppingCart className="h-5 w-5" />
                        <span className="hidden sm:inline">Cart</span>
                     </Button>
                     {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                           {cartCount}
                        </span>
                     )}
                  </motion.div>
               </Link>

               {isLoggedIn ? (
                  <>
                     <Link href="/orders">
                        <motion.div
                           whileHover={{ scale: 1.05 }}
                           whileTap={{ scale: 0.95 }}
                        >
                           <Button variant="ghost" className="gap-2">
                              <User className="h-5 w-5" />
                              <span className="hidden sm:inline">Orders</span>
                           </Button>
                        </motion.div>
                     </Link>

                     <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                     >
                        <Button
                           variant="ghost"
                           className="gap-2"
                           onClick={handleLogout}
                        >
                           <LogOut className="h-5 w-5" />
                           <span className="hidden sm:inline">Logout</span>
                        </Button>
                     </motion.div>
                  </>
               ) : (
                  <>
                     <LoginDialog />
                     <RegisterDialog />
                  </>
               )}
            </div>
         </div>
      </motion.nav>
   );
}
