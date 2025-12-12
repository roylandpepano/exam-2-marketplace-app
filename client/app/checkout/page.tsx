/**
 * Checkout Page
 */
"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";
import { formatCurrency } from "@/lib/currency";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Check, ArrowLeft } from "lucide-react";
import { API_BASE_URL, getToken, api } from "@/lib/api";

export default function CheckoutPage() {
   const { items, total, clearCart } = useCart();
   const { user, isLoggedIn } = useAuth();
   const router = useRouter();
   const [billingSame, setBillingSame] = useState(true);

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
      billingFullName: "",
      billingAddress: "",
      billingCity: "",
      billingState: "",
      billingZip: "",
   });

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
            // ignore
         }
      })();
      return () => {
         mounted = false;
      };
   }, []);

   if (!isLoggedIn) {
      return (
         <div className="container mx-auto px-4 py-8 text-center">
            <h1 className="text-2xl font-semibold mb-3">Checkout</h1>
            <p className="text-muted-foreground mb-4">
               Please login to continue with checkout
            </p>
            <Link href="/login">
               <Button size="sm">Go to Login</Button>
            </Link>
         </div>
      );
   }

   if (items.length === 0) {
      return (
         <div className="container mx-auto px-4 py-8 text-center">
            <h1 className="text-2xl font-semibold mb-3">Checkout</h1>
            <p className="text-muted-foreground mb-4">Your cart is empty</p>
            <Link href="/">
               <Button size="sm">Continue Shopping</Button>
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

   const handlePlaceOrder = async (e?: React.SyntheticEvent) => {
      if (e && typeof e.preventDefault === "function") e.preventDefault();

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
      const tax = +(total * taxRate);
      const totalWithTax = +(total + tax);
      try {
         // Simulate payment processing
         await new Promise((resolve) => setTimeout(resolve, 2000));

         // Save order to localStorage
         const order = {
            id: "ORD-" + Date.now(),
            userId: user?.id,
            items,
            subtotal: total,
            tax,
            shipping_cost: 0,
            discount: 0,
            total: totalWithTax,
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

         // If we have a token, try to save to API as well
         try {
            const token = getToken();
            if (token) {
               const res = await fetch(`${API_BASE_URL}/api/orders`, {
                  method: "POST",
                  headers: {
                     "Content-Type": "application/json",
                     Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({
                     items: items.map((it) => ({
                        id: it.id,
                        product_id: it.id,
                        name: it.name,
                        image: it.image,
                        quantity: it.quantity,
                        unit_price: it.price,
                     })),
                     subtotal: total,
                     tax,
                     shipping_cost: 0,
                     discount: 0,
                     total: totalWithTax,
                     shipping_address: {
                        fullName: formData.fullName,
                        address: formData.address,
                        city: formData.city,
                        state: formData.state,
                        zipCode: formData.zipCode,
                     },
                  }),
               });

               if (res.ok) {
                  const data = await res.json();
                  // Use server order id if available
                  if (data?.order?.order_number) {
                     order.id = data.order.order_number;
                  }
               }
            }
         } catch (err) {
            console.warn(
               "Failed to save order to API, falling back to localStorage",
               err
            );
         }

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
         <div className="container mx-auto px-4 py-8 text-center">
            <motion.div
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
            >
               <div className="mb-3 text-4xl">
                  <Check className="h-12 w-12 text-green-500 mx-auto" />
               </div>
               <h1 className="text-2xl font-semibold mb-2">Order Placed!</h1>
               <p className="text-muted-foreground mb-4">
                  Thank you for your order. You will be redirected to your order
                  details shortly.
               </p>
               <Link href="/orders">
                  <Button size="sm">View Your Orders</Button>
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
            className="mb-4"
         >
            <Link
               href="/cart"
               className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline mb-4"
            >
               <ArrowLeft className="h-4 w-4" />
               Back to cart
            </Link>
            <h1 className="text-2xl font-semibold">Checkout</h1>
            <div className="mt-3">
               <ol className="flex items-center gap-3 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2">
                     <span className="h-5 w-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px]">
                        1
                     </span>
                     <span>Cart</span>
                  </li>
                  <li className="text-muted-foreground">›</li>
                  <li className="flex items-center gap-2">
                     <span className="h-5 w-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px]">
                        2
                     </span>
                     <span>Shipping</span>
                  </li>
                  <li className="text-muted-foreground">›</li>
                  <li className="flex items-center gap-2">
                     <span className="h-5 w-5 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-[11px]">
                        3
                     </span>
                     <span>Payment</span>
                  </li>
               </ol>
            </div>
         </motion.div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
               <motion.form
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onSubmit={handlePlaceOrder}
                  className="space-y-4"
               >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {/* Shipping Information */}
                     <Card className="p-3">
                        <h2 className="text-lg font-semibold mb-2">
                           Shipping Information
                        </h2>
                        <div className="space-y-3">
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
                           <div className="grid grid-cols-2 gap-3">
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
                     <Card className="p-3">
                        <div className="flex items-center gap-2 mb-2">
                           <input
                              id="billingSame"
                              type="checkbox"
                              checked={billingSame}
                              onChange={() => setBillingSame((s) => !s)}
                              className="h-4 w-4 rounded border"
                           />
                           <label htmlFor="billingSame" className="text-sm">
                              Billing same as shipping
                           </label>
                        </div>
                        <h2 className="text-lg font-semibold mb-2">
                           Payment Information
                        </h2>
                        <div className="space-y-3">
                           <Input
                              type="text"
                              name="cardNumber"
                              value={formData.cardNumber}
                              onChange={handleInputChange}
                              placeholder="Card Number"
                              maxLength={16}
                              required
                           />
                           <div className="grid grid-cols-2 gap-3">
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
                     {!billingSame && (
                        <Card className="p-3 md:col-span-2">
                           <h2 className="text-lg font-semibold mb-2">
                              Billing Address
                           </h2>
                           <div className="space-y-3">
                              <Input
                                 type="text"
                                 name="billingFullName"
                                 value={formData.billingFullName}
                                 onChange={handleInputChange}
                                 placeholder="Full Name"
                              />
                              <Input
                                 type="text"
                                 name="billingAddress"
                                 value={formData.billingAddress}
                                 onChange={handleInputChange}
                                 placeholder="Street Address"
                              />
                              <div className="grid grid-cols-2 gap-3">
                                 <Input
                                    type="text"
                                    name="billingCity"
                                    value={formData.billingCity}
                                    onChange={handleInputChange}
                                    placeholder="City"
                                 />
                                 <Input
                                    type="text"
                                    name="billingState"
                                    value={formData.billingState}
                                    onChange={handleInputChange}
                                    placeholder="State"
                                 />
                              </div>
                              <Input
                                 type="text"
                                 name="billingZip"
                                 value={formData.billingZip}
                                 onChange={handleInputChange}
                                 placeholder="ZIP Code"
                              />
                           </div>
                        </Card>
                     )}
                  </div>
               </motion.form>
            </div>

            {/* Order Summary */}
            <motion.div
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.3 }}
            >
               <Card className="p-4 sticky top-16">
                  <h3 className="text-md font-semibold mb-3">Order Summary</h3>

                  <div className="space-y-2 max-h-56 overflow-y-auto mb-4 pb-4 border-b">
                     {items.map((item) => (
                        <div key={item.id} className="flex gap-2 items-center">
                           <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded bg-gray-100">
                              <Image
                                 src={item.image}
                                 alt={item.name}
                                 fill
                                 unoptimized
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
                                 {formatCurrency(item.price * item.quantity)}
                              </p>
                           </div>
                        </div>
                     ))}
                  </div>

                  <div className="space-y-2 mb-6 pb-6 border-b">
                     <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>{formatCurrency(total)}</span>
                     </div>
                     <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Shipping</span>
                        <span>Free</span>
                     </div>
                     <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                           Tax ({(taxRate * 100).toFixed(2)}%)
                        </span>
                        <span>{formatCurrency(total * taxRate)}</span>
                     </div>
                  </div>

                  <div className="flex justify-between items-center">
                     <span className="font-bold">Total:</span>
                     <span className="font-bold text-xl text-blue-600">
                        {formatCurrency(total * (1 + taxRate))}
                     </span>
                  </div>
                  <div className="mt-4">
                     <Button
                        size="lg"
                        className="w-full"
                        onClick={handlePlaceOrder}
                        disabled={isProcessing}
                     >
                        {isProcessing ? "Processing..." : "Place Order"}
                     </Button>
                  </div>
               </Card>
            </motion.div>
         </div>
      </div>
   );
}
