/**
 * Product Card Component
 */
"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { ShoppingCart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { Product } from "@/lib/products";
import { formatCurrency } from "@/lib/currency";
import { useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogDescription,
} from "@/components/ui/dialog";

interface ProductCardProps {
   product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
   const { addItem } = useCart();
   const { isLoggedIn, user } = useAuth();
   const readStoredRating = (id: number | string) => {
      if (typeof window === "undefined") return null;
      try {
         const storageKey = user?.id
            ? `user_ratings_${user.id}`
            : "user_ratings_guest";
         const map = JSON.parse(
            localStorage.getItem(storageKey) || "{}"
         ) as Record<string, number>;
         return map[String(id)] ?? null;
      } catch {
         return null;
      }
   };

   const writeStoredRating = (id: number | string, rating: number | null) => {
      if (typeof window === "undefined") return;
      try {
         const storageKey = user?.id
            ? `user_ratings_${user.id}`
            : "user_ratings_guest";
         const map = JSON.parse(
            localStorage.getItem(storageKey) || "{}"
         ) as Record<string, number>;
         if (rating === null) {
            delete map[String(id)];
         } else {
            map[String(id)] = rating;
         }
         localStorage.setItem(storageKey, JSON.stringify(map));
      } catch {
         // ignore
      }
   };

   const [localUserRating, setLocalUserRating] = useState<number | null>(
      // prefer server-provided `your_rating`, fall back to a per-user/guest stored value
      (product as unknown as { your_rating?: number }).your_rating ??
         readStoredRating(product.id) ??
         null
   );
   const [localRating, setLocalRating] = useState<number>(product.rating ?? 0);
   const [localReviews, setLocalReviews] = useState<number>(
      Number(product.reviews || 0)
   );

   const handleAddToCart = () => {
      addItem({
         id: product.id,
         name: product.name,
         price: product.price,
         image: product.image,
      });
      toast.success(`${product.name} added to cart!`);
   };

   const handleRate = async (value: number, e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (!isLoggedIn) {
         toast.error("Please login to rate products");
         if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("open-login-dialog"));
         }
         return;
      }

      // Capture previous state for possible rollback
      const prevUserRating =
         localUserRating ??
         (product as unknown as { your_rating?: number }).your_rating ??
         readStoredRating(product.id) ??
         null;
      const prevLocalRating = localRating;
      const prevLocalReviews = localReviews;

      // Optimistically update UI immediately for snappy feedback
      try {
         let newReviews = prevLocalReviews;
         let total = prevLocalRating * prevLocalReviews;

         if (prevUserRating == null) {
            // new review
            newReviews = prevLocalReviews + 1;
            total = total + value;
         } else {
            // replacing previous user rating
            total = total - (prevUserRating as number) + value;
         }

         const newAvg = newReviews > 0 ? total / newReviews : value;

         setLocalUserRating(value);
         setLocalRating(newAvg);
         setLocalReviews(newReviews);
         writeStoredRating(product.id, value);

         // Fire-and-forget server submission; update state when server responds
         api.rateProduct(Number(product.id), value)
            .then((res) => {
               const p = res.product;
               setLocalRating(p.rating || 0);
               setLocalUserRating(value);
               writeStoredRating(product.id, value);
               setLocalReviews(p.reviews || 0);
               toast.success("Thanks for your rating!");
            })
            .catch((err: unknown) => {
               console.error("Rate failed", err);
               const msg =
                  (err as { message?: string })?.message ||
                  "Failed to submit rating";
               // rollback optimistic state
               setLocalRating(prevLocalRating);
               setLocalUserRating(prevUserRating);
               setLocalReviews(prevLocalReviews);
               writeStoredRating(product.id, prevUserRating as number | null);
               toast.error(msg);
            });
      } catch (err) {
         console.error("Optimistic update failed", err);
      }
   };

   const [open, setOpen] = useState(false);

   const computedUserRating =
      localUserRating ??
      (product as unknown as { your_rating?: number }).your_rating ??
      readStoredRating(product.id) ??
      null;

   return (
      <Dialog open={open} onOpenChange={setOpen}>
         <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.18 }}
            className="group"
            onClick={() => setOpen(true)}
            role="button"
            tabIndex={0}
         >
            <Card className="overflow-hidden h-full flex flex-col rounded-2xl border border-transparent hover:shadow-2xl hover:border-gray-100 transition-shadow duration-250 py-0 gap-0">
               <div className="relative h-56 w-full overflow-hidden bg-linear-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-t-2xl">
                  <Image
                     src={product.image}
                     alt={product.name}
                     fill
                     className="object-cover object-center transition-transform duration-700 group-hover:scale-110"
                     unoptimized
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-90 transition-opacity duration-400 pointer-events-none" />

                  <div className="absolute left-3 top-3 bg-amber-50/90 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 rounded-full px-3 py-1 text-lg font-bold shadow-sm backdrop-blur-sm">
                     {formatCurrency(product.price)}
                  </div>
               </div>

               <div className="flex-1 p-4 flex flex-col">
                  <h3 className="text-md font-semibold line-clamp-2 text-gray-900 dark:text-white">
                     {product.name}
                  </h3>

                  <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
                     {product.description}
                  </p>

                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <div className="flex items-center">
                           {(() => {
                              // Always show the total (average) rating in the product card.
                              const displayRating = Math.round(
                                 localRating || 0
                              );
                              return [...Array(5)].map((_, i) => {
                                 const idx = i + 1;
                                 const filled = idx <= displayRating;
                                 return (
                                    <Star
                                       key={i}
                                       className={`h-4 w-4 transition-colors ${
                                          filled
                                             ? "fill-amber-400 text-amber-400"
                                             : "text-gray-300"
                                       }`}
                                    />
                                 );
                              });
                           })()}
                        </div>
                        <span className="text-xs font-medium text-muted-foreground ml-1">
                           {Number(localRating || 0).toFixed(1)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                           ({localReviews})
                        </span>
                     </div>

                     <Button
                        onClick={(e) => {
                           e.stopPropagation();
                           handleAddToCart();
                        }}
                        size="sm"
                        className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5"
                     >
                        <ShoppingCart className="h-3.5 w-3.5" />
                        Add
                     </Button>
                  </div>
               </div>
            </Card>
         </motion.div>

         <DialogContent showCloseButton={true}>
            <DialogHeader>
               <DialogTitle>{product.name}</DialogTitle>
               <DialogDescription className="text-2xl font-extrabold text-amber-600">
                  {formatCurrency(product.price)}
               </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 md:grid-cols-2">
               <div className="relative h-64 w-full rounded-lg overflow-hidden bg-linear-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                  <Image
                     src={product.image}
                     alt={product.name}
                     fill
                     className="object-cover"
                     unoptimized
                  />
               </div>

               <div className="flex flex-col gap-4">
                  <p className="text-sm text-muted-foreground">
                     {product.description}
                  </p>

                  <div className="flex items-center gap-3">
                     <div className="flex items-center">
                        {(() => {
                           const clickable = isLoggedIn;
                           const displayRating = (() => {
                              if (isLoggedIn) {
                                 return computedUserRating != null
                                    ? computedUserRating
                                    : 0;
                              }
                              return Math.round(localRating || 0);
                           })();

                           return [...Array(5)].map((_, i) => {
                              const idx = i + 1;
                              const filled = idx <= displayRating;
                              return (
                                 <span
                                    key={i}
                                    title={
                                       clickable
                                          ? `Rate ${idx} stars`
                                          : "Login to rate"
                                    }
                                    role={clickable ? "button" : undefined}
                                    aria-disabled={!clickable}
                                    className={
                                       clickable
                                          ? "cursor-pointer"
                                          : "cursor-default"
                                    }
                                    onClick={(e) => {
                                       e.stopPropagation();
                                       if (clickable) {
                                          handleRate(
                                             idx,
                                             e as unknown as React.MouseEvent
                                          );
                                       } else {
                                          if (typeof window !== "undefined") {
                                             window.dispatchEvent(
                                                new Event("open-login-dialog")
                                             );
                                          }
                                       }
                                    }}
                                 >
                                    <Star
                                       className={`h-5 w-5 transition-colors ${
                                          filled
                                             ? "fill-amber-400 text-amber-400"
                                             : "text-gray-300"
                                       }`}
                                    />
                                 </span>
                              );
                           });
                        })()}
                     </div>
                     <span className="text-sm text-muted-foreground">
                        ({localReviews} reviews)
                     </span>
                  </div>

                  <div className="mt-auto flex items-center gap-3">
                     <Button
                        className="bg-amber-500 hover:bg-amber-600 text-white w-full"
                        onClick={(e) => {
                           e.stopPropagation();
                           handleAddToCart();
                        }}
                     >
                        <ShoppingCart className="h-3.5 w-3.5" /> Add to cart
                     </Button>
                  </div>
               </div>
            </div>
         </DialogContent>
      </Dialog>
   );
}
