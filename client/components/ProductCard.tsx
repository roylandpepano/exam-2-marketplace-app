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
      <motion.div whileHover={{ y: -8 }} transition={{ duration: 0.2 }}>
         <Card className="overflow-hidden h-full flex flex-col">
            <div className="relative h-48 w-full overflow-hidden bg-gray-100">
               <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
               />
               <div className="absolute top-2 right-2 bg-white dark:bg-gray-900 rounded-full px-3 py-1 text-sm font-semibold">
                  ${product.price}
               </div>
            </div>

            <div className="flex-1 p-4 flex flex-col">
               <h3 className="font-semibold text-lg mb-1 line-clamp-2">
                  {product.name}
               </h3>

               <p className="text-sm text-muted-foreground mb-3 line-clamp-2 flex-1">
                  {product.description}
               </p>

               <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center">
                     {[...Array(5)].map((_, i) => (
                        <Star
                           key={i}
                           className={`h-4 w-4 ${
                              i < Math.floor(product.rating)
                                 ? "fill-yellow-400 text-yellow-400"
                                 : "text-gray-300"
                           }`}
                        />
                     ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                     ({product.reviews})
                  </span>
               </div>

               <Button
                  onClick={handleAddToCart}
                  className="w-full gap-2"
                  size="sm"
               >
                  <ShoppingCart className="h-4 w-4" />
                  Add to Cart
               </Button>
            </div>
         </Card>
      </motion.div>
   );
}
