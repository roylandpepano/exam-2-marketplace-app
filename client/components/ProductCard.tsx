/**
 * Product Card Component
 */
"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { ShoppingCart, Star, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { Product } from "@/lib/products";
import { formatCurrency } from "@/lib/currency";

interface ProductCardProps {
   product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
   const { addItem } = useCart();

   const handleAddToCart = () => {
      addItem({
         id: product.id,
         name: product.name,
         price: product.price,
         image: product.image,
      });
      toast.success(`${product.name} added to cart!`);
   };

   return (
      <motion.div
         whileHover={{ scale: 1.02 }}
         transition={{ duration: 0.18 }}
         className="group"
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

               <div className="absolute left-3 top-3 bg-amber-50/90 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 rounded-full px-2 py-0.5 text-xs font-semibold shadow-sm backdrop-blur-sm">
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
                        {[...Array(5)].map((_, i) => (
                           <Star
                              key={i}
                              className={`h-4 w-4 ${
                                 i < Math.floor(product.rating)
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-gray-300"
                              }`}
                           />
                        ))}
                     </div>
                     <span className="text-xs text-muted-foreground">
                        ({product.reviews})
                     </span>
                  </div>

                  <Button
                     onClick={handleAddToCart}
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
   );
}
