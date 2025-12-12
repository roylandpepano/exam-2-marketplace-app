/**
 * Shopping Cart Page
 */
"use client";

import { motion } from "motion/react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCart } from "@/contexts/CartContext";
import { formatCurrency } from "@/lib/currency";
import { useAuth } from "@/contexts/AuthContext";
import { Trash2, ShoppingBag, ArrowRight, Plus, Minus } from "lucide-react";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";

export default function CartPage() {
   const { items, removeItem, updateQuantity, total, clearCart } = useCart();
   const { isLoggedIn } = useAuth();

   const freeShippingThreshold = 100; // display-only threshold
   const shippingProgress = Math.min(
      100,
      Math.round((total / freeShippingThreshold) * 100)
   );

   const [taxRate, setTaxRate] = useState(0.1);

   useEffect(() => {
      let mounted = true;
      (async () => {
         try {
            const res = await api.getConstants();
            const c = res.constants || {};
            if (!mounted) return;
            setTaxRate(Number(c.tax ?? 0.1));
         } catch {
            // ignore error and keep default
         }
      })();
      return () => {
         mounted = false;
      };
   }, []);

   const taxAmount = +(total * taxRate);
   const totalWithTax = +(total + taxAmount);

   if (items.length === 0) {
      return (
         <div className="container mx-auto px-4 py-12 text-center">
            <motion.div
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
            >
               <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-60" />
               <h1 className="text-2xl font-semibold mb-1">
                  Your cart is empty
               </h1>
               <p className="text-sm text-muted-foreground mb-6">
                  Add products to get started
               </p>
               <Link href="/">
                  <Button size="sm">Continue Shopping</Button>
               </Link>
            </motion.div>
         </div>
      );
   }

   return (
      <div className="container mx-auto px-4 py-6">
         <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
         >
            <div className="flex items-baseline justify-between">
               <div>
                  <h1 className="text-2xl font-semibold">Cart</h1>
                  <p className="text-sm text-muted-foreground">
                     {items.length} item{items.length !== 1 ? "s" : ""}
                  </p>
               </div>
               <Button variant="ghost" size="sm" onClick={() => clearCart()}>
                  Clear
               </Button>
            </div>
         </motion.div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2">
               <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ staggerChildren: 0.1 }}
                  className="space-y-3"
               >
                  {items.map((item) => (
                     <motion.div
                        key={item.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                     >
                        <Card className="p-3">
                           <div className="flex items-center gap-3">
                              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-gray-100">
                                 <Image
                                    src={item.image}
                                    alt={item.name}
                                    fill
                                    unoptimized
                                    className="object-cover"
                                 />
                              </div>

                              <div className="flex-1 min-w-0">
                                 <h3 className="font-medium text-sm truncate">
                                    {item.name}
                                 </h3>
                                 <div className="flex items-center gap-3 mt-1">
                                    <span className="text-sm font-semibold text-blue-600">
                                       {formatCurrency(item.price)}
                                    </span>

                                    <div className="ml-2 inline-flex items-center rounded-md border bg-transparent">
                                       <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() =>
                                             updateQuantity(
                                                item.id,
                                                Math.max(1, item.quantity - 1)
                                             )
                                          }
                                          className="h-7 w-7 p-0"
                                       >
                                          <Minus className="h-4 w-4" />
                                       </Button>
                                       <div className="px-2 text-sm w-8 text-center">
                                          {item.quantity}
                                       </div>
                                       <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() =>
                                             updateQuantity(
                                                item.id,
                                                item.quantity + 1
                                             )
                                          }
                                          className="h-7 w-7 p-0"
                                       >
                                          <Plus className="h-4 w-4" />
                                       </Button>
                                    </div>

                                    <span className="text-xs text-muted-foreground ml-3">
                                       {formatCurrency(
                                          item.price * item.quantity
                                       )}
                                    </span>
                                 </div>
                              </div>

                              <div className="ml-2 flex items-start">
                                 <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeItem(item.id)}
                                    className="h-8 w-8 text-red-500 hover:bg-red-50"
                                    aria-label={`Remove ${item.name}`}
                                 >
                                    <Trash2 className="h-4 w-4" />
                                 </Button>
                              </div>
                           </div>
                        </Card>
                     </motion.div>
                  ))}
               </motion.div>
            </div>

            {/* Order Summary */}
            <motion.div
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.3 }}
            >
               <Card className="p-4 sticky top-24 bg-linear-to-tr from-white/60 to-white/40 backdrop-blur-md">
                  <div className="flex items-center justify-between mb-3">
                     <div className="flex items-center gap-3">
                        <div className="rounded-md bg-blue-50 p-2">
                           <ShoppingBag className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                           <h3 className="text-sm font-semibold">
                              Order Summary
                           </h3>
                           <p className="text-xs text-muted-foreground">
                              {items.length} items
                           </p>
                        </div>
                     </div>
                     <span className="text-xs text-muted-foreground">
                        Estimate
                     </span>
                  </div>

                  <div className="space-y-3 mb-4 pb-3 border-b">
                     <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                           Subtotal
                        </span>
                        <span className="text-sm font-medium">
                           {formatCurrency(total)}
                        </span>
                     </div>

                     <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                           Shipping
                        </span>
                        <span className="text-sm font-medium">Free</span>
                     </div>

                     <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                           Tax ({(taxRate * 100).toFixed(2)}%)
                        </span>
                        <span className="text-sm font-medium">
                           {formatCurrency(taxAmount)}
                        </span>
                     </div>

                     <div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                           <span>Free shipping progress</span>
                           <span>{shippingProgress}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                           <div
                              className="h-2 bg-linear-to-r from-blue-500 to-indigo-600"
                              style={{ width: `${shippingProgress}%` }}
                           />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                           Free over {formatCurrency(freeShippingThreshold)}
                        </p>
                     </div>
                  </div>

                  <div className="flex justify-between items-center mb-4">
                     <span className="text-sm text-muted-foreground">
                        Total
                     </span>
                     <span className="inline-flex items-center gap-2 bg-linear-to-r from-blue-500 to-indigo-600 text-white px-3 py-1 rounded-full font-semibold">
                        {formatCurrency(totalWithTax)}
                     </span>
                  </div>

                  <div className="space-y-2">
                     {!isLoggedIn && (
                        <Link href="/login" className="block">
                           <Button
                              className="w-full"
                              size="sm"
                              variant="outline"
                           >
                              Login to Checkout
                              <ArrowRight className="h-4 w-4 ml-2" />
                           </Button>
                        </Link>
                     )}

                     <Link href="/checkout" className="block">
                        <Button
                           className="w-full bg-linear-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
                           size="sm"
                           disabled={items.length === 0 || !isLoggedIn}
                        >
                           {!isLoggedIn
                              ? "Login Required"
                              : "Proceed to Checkout"}
                           {isLoggedIn && (
                              <ArrowRight className="h-4 w-4 ml-2" />
                           )}
                        </Button>
                     </Link>

                     <Link href="/" className="block">
                        <Button variant="ghost" className="w-full" size="sm">
                           Continue Shopping
                        </Button>
                     </Link>
                  </div>
               </Card>
            </motion.div>
         </div>
      </div>
   );
}
