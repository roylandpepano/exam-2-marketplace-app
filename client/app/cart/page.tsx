/**
 * Shopping Cart Page
 */
"use client";

import { motion } from "motion/react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";
import { formatCurrency } from "@/lib/currency";
import { useAuth } from "@/contexts/AuthContext";
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react";

export default function CartPage() {
   const { items, removeItem, updateQuantity, total, clearCart } = useCart();
   const { isLoggedIn } = useAuth();

   if (items.length === 0) {
      return (
         <div className="container mx-auto px-4 py-12 text-center">
            <motion.div
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
            >
               <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
               <h1 className="text-3xl font-bold mb-2">Your cart is empty</h1>
               <p className="text-muted-foreground mb-8">
                  Start shopping to add items to your cart
               </p>
               <Link href="/">
                  <Button size="lg">Continue Shopping</Button>
               </Link>
            </motion.div>
         </div>
      );
   }

   return (
      <div className="container mx-auto px-4 py-8">
         <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
         >
            <h1 className="text-3xl font-bold">Shopping Cart</h1>
            <p className="text-muted-foreground">
               {items.length} item{items.length !== 1 ? "s" : ""} in your cart
            </p>
         </motion.div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
               <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ staggerChildren: 0.1 }}
                  className="space-y-4"
               >
                  {items.map((item) => (
                     <motion.div
                        key={item.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                     >
                        <Card className="p-4">
                           <div className="flex gap-4">
                              {/* Product Image */}
                              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                 <Image
                                    src={item.image}
                                    alt={item.name}
                                    fill
                                    className="object-cover"
                                 />
                              </div>

                              {/* Product Details */}
                              <div className="flex-1">
                                 <h3 className="font-semibold text-lg mb-1">
                                    {item.name}
                                 </h3>
                                 <p className="text-lg font-bold text-blue-600">
                                    {formatCurrency(item.price)}
                                 </p>

                                 <div className="mt-3 flex items-center gap-2">
                                    <label className="text-sm text-muted-foreground">
                                       Qty:
                                    </label>
                                    <Input
                                       type="number"
                                       min="1"
                                       value={item.quantity}
                                       onChange={(e) =>
                                          updateQuantity(
                                             item.id,
                                             parseInt(e.target.value) || 1
                                          )
                                       }
                                       className="w-16"
                                    />
                                    <span className="text-sm text-muted-foreground">
                                       Subtotal:{" "}
                                       {formatCurrency(
                                          item.price * item.quantity
                                       )}
                                    </span>
                                 </div>
                              </div>

                              {/* Remove Button */}
                              <motion.div
                                 whileHover={{ scale: 1.1 }}
                                 whileTap={{ scale: 0.95 }}
                              >
                                 <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeItem(item.id)}
                                    className="h-10 w-10 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                 >
                                    <Trash2 className="h-5 w-5" />
                                 </Button>
                              </motion.div>
                           </div>
                        </Card>
                     </motion.div>
                  ))}
               </motion.div>

               <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mt-6"
               >
                  <Button
                     variant="outline"
                     className="w-full"
                     onClick={() => clearCart()}
                  >
                     Clear Cart
                  </Button>
               </motion.div>
            </div>

            {/* Order Summary */}
            <motion.div
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.3 }}
            >
               <Card className="p-6 sticky top-24">
                  <h3 className="text-lg font-semibold mb-4">Order Summary</h3>

                  <div className="space-y-3 mb-6 pb-6 border-b">
                     <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>{formatCurrency(total)}</span>
                     </div>
                     <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Shipping</span>
                        <span>Free</span>
                     </div>
                     <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tax</span>
                        <span>{formatCurrency(total * 0.1)}</span>
                     </div>
                  </div>

                  <div className="flex justify-between items-center mb-6">
                     <span className="font-bold text-lg">Total:</span>
                     <span className="font-bold text-2xl text-blue-600">
                        {formatCurrency(total * 1.1)}
                     </span>
                  </div>

                  {!isLoggedIn && (
                     <Link href="/login" className="block mb-3">
                        <Button className="w-full gap-2" size="lg">
                           Login to Checkout
                           <ArrowRight className="h-4 w-4" />
                        </Button>
                     </Link>
                  )}

                  <Link href="/checkout" className="block">
                     <Button
                        className="w-full gap-2"
                        size="lg"
                        disabled={items.length === 0 || !isLoggedIn}
                     >
                        {!isLoggedIn ? "Login Required" : "Proceed to Checkout"}
                        {isLoggedIn && <ArrowRight className="h-4 w-4" />}
                     </Button>
                  </Link>

                  <Link href="/" className="block mt-3">
                     <Button variant="outline" className="w-full">
                        Continue Shopping
                     </Button>
                  </Link>
               </Card>
            </motion.div>
         </div>
      </div>
   );
}
