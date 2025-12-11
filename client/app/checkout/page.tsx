/**
 * Checkout Page
 */
"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Check, ArrowLeft } from "lucide-react";

export default function CheckoutPage() {
   const { items, total, clearCart } = useCart();
   const { user, isLoggedIn } = useAuth();
   const router = useRouter();

   const [isProcessing, setIsProcessing] = useState(false);
   const [orderPlaced, setOrderPlaced] = useState(false);
   const [formData, setFormData] = useState({
      email: user?.email || "",
      fullName: user?.name || "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      cardNumber: "",
      cardExpiry: "",
      cardCVC: "",
   });

   if (!isLoggedIn) {
      return (
         <div className="container mx-auto px-4 py-12 text-center">
            <h1 className="text-3xl font-bold mb-4">Checkout</h1>
            <p className="text-muted-foreground mb-6">
               Please login to continue with checkout
            </p>
            <Link href="/login">
               <Button size="lg">Go to Login</Button>
            </Link>
         </div>
      );
   }

   if (items.length === 0) {
      return (
         <div className="container mx-auto px-4 py-12 text-center">
            <h1 className="text-3xl font-bold mb-4">Checkout</h1>
            <p className="text-muted-foreground mb-6">Your cart is empty</p>
            <Link href="/">
               <Button size="lg">Continue Shopping</Button>
            </Link>
         </div>
      );
   }

   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
         ...prev,
         [name]: value,
      }));
   };

   const handlePlaceOrder = async (e: React.FormEvent) => {
      e.preventDefault();

      if (
         !formData.address ||
         !formData.city ||
         !formData.state ||
         !formData.zipCode ||
         !formData.cardNumber
      ) {
         toast.error("Please fill in all fields");
         return;
      }

      setIsProcessing(true);
      try {
         // Simulate payment processing
         await new Promise((resolve) => setTimeout(resolve, 2000));

         // Save order to localStorage
         const order = {
            id: "ORD-" + Date.now(),
            userId: user?.id,
            items,
            total: total * 1.1,
            status: "Completed",
            shippingAddress: {
               fullName: formData.fullName,
               address: formData.address,
               city: formData.city,
               state: formData.state,
               zipCode: formData.zipCode,
            },
            date: new Date().toISOString(),
         };

         const orders = JSON.parse(localStorage.getItem("orders") || "[]");
         orders.push(order);
         localStorage.setItem("orders", JSON.stringify(orders));

         setOrderPlaced(true);
         clearCart();
         toast.success("Order placed successfully!");

         setTimeout(() => {
            router.push(`/orders/${order.id}`);
         }, 2000);
      } catch (error) {
         toast.error("Failed to place order");
         console.error(error);
      } finally {
         setIsProcessing(false);
      }
   };

   if (orderPlaced) {
      return (
         <div className="container mx-auto px-4 py-12 text-center">
            <motion.div
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
            >
               <div className="mb-4 text-6xl">
                  <Check className="h-16 w-16 text-green-500 mx-auto" />
               </div>
               <h1 className="text-3xl font-bold mb-2">Order Placed!</h1>
               <p className="text-muted-foreground mb-8">
                  Thank you for your order. You will be redirected to your order
                  details shortly.
               </p>
               <Link href="/orders">
                  <Button size="lg">View Your Orders</Button>
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
            <Link
               href="/cart"
               className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline mb-4"
            >
               <ArrowLeft className="h-4 w-4" />
               Back to cart
            </Link>
            <h1 className="text-3xl font-bold">Checkout</h1>
         </motion.div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
               <motion.form
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onSubmit={handlePlaceOrder}
                  className="space-y-6"
               >
                  {/* Shipping Information */}
                  <Card className="p-6">
                     <h2 className="text-xl font-semibold mb-4">
                        Shipping Information
                     </h2>
                     <div className="space-y-4">
                        <Input
                           type="email"
                           name="email"
                           value={formData.email}
                           onChange={handleInputChange}
                           placeholder="Email"
                           disabled
                        />
                        <Input
                           type="text"
                           name="fullName"
                           value={formData.fullName}
                           onChange={handleInputChange}
                           placeholder="Full Name"
                           disabled
                        />
                        <Input
                           type="text"
                           name="address"
                           value={formData.address}
                           onChange={handleInputChange}
                           placeholder="Street Address"
                           required
                        />
                        <div className="grid grid-cols-2 gap-4">
                           <Input
                              type="text"
                              name="city"
                              value={formData.city}
                              onChange={handleInputChange}
                              placeholder="City"
                              required
                           />
                           <Input
                              type="text"
                              name="state"
                              value={formData.state}
                              onChange={handleInputChange}
                              placeholder="State"
                              required
                           />
                        </div>
                        <Input
                           type="text"
                           name="zipCode"
                           value={formData.zipCode}
                           onChange={handleInputChange}
                           placeholder="ZIP Code"
                           required
                        />
                     </div>
                  </Card>

                  {/* Payment Information */}
                  <Card className="p-6">
                     <h2 className="text-xl font-semibold mb-4">
                        Payment Information
                     </h2>
                     <div className="space-y-4">
                        <Input
                           type="text"
                           name="cardNumber"
                           value={formData.cardNumber}
                           onChange={handleInputChange}
                           placeholder="Card Number"
                           maxLength={16}
                           required
                        />
                        <div className="grid grid-cols-2 gap-4">
                           <Input
                              type="text"
                              name="cardExpiry"
                              value={formData.cardExpiry}
                              onChange={handleInputChange}
                              placeholder="MM/YY"
                              maxLength={5}
                           />
                           <Input
                              type="text"
                              name="cardCVC"
                              value={formData.cardCVC}
                              onChange={handleInputChange}
                              placeholder="CVC"
                              maxLength={3}
                           />
                        </div>
                     </div>
                  </Card>

                  <Button
                     type="submit"
                     className="w-full"
                     size="lg"
                     disabled={isProcessing}
                  >
                     {isProcessing ? "Processing..." : "Place Order"}
                  </Button>
               </motion.form>
            </div>

            {/* Order Summary */}
            <motion.div
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.3 }}
            >
               <Card className="p-6 sticky top-24">
                  <h3 className="text-lg font-semibold mb-4">Order Summary</h3>

                  <div className="space-y-3 max-h-64 overflow-y-auto mb-6 pb-6 border-b">
                     {items.map((item) => (
                        <div key={item.id} className="flex gap-3">
                           <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded bg-gray-100">
                              <Image
                                 src={item.image}
                                 alt={item.name}
                                 fill
                                 className="object-cover"
                              />
                           </div>
                           <div className="flex-1">
                              <p className="text-sm font-medium line-clamp-2">
                                 {item.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                 Qty: {item.quantity}
                              </p>
                              <p className="text-sm font-semibold">
                                 ${(item.price * item.quantity).toFixed(2)}
                              </p>
                           </div>
                        </div>
                     ))}
                  </div>

                  <div className="space-y-2 mb-6 pb-6 border-b">
                     <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>${total.toFixed(2)}</span>
                     </div>
                     <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Shipping</span>
                        <span>Free</span>
                     </div>
                     <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tax (10%)</span>
                        <span>${(total * 0.1).toFixed(2)}</span>
                     </div>
                  </div>

                  <div className="flex justify-between items-center">
                     <span className="font-bold">Total:</span>
                     <span className="font-bold text-2xl text-blue-600">
                        ${(total * 1.1).toFixed(2)}
                     </span>
                  </div>
               </Card>
            </motion.div>
         </div>
      </div>
   );
}
