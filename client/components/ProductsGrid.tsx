/**
 * Products Grid Component
 */
"use client";

import { motion } from "motion/react";
import { ProductCard } from "./ProductCard";
import { Product } from "@/lib/products";

interface ProductsGridProps {
   products: Product[];
   isLoading?: boolean;
}

export function ProductsGrid({ products, isLoading }: ProductsGridProps) {
   if (isLoading) {
      return (
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
               <div
                  key={i}
                  className="h-80 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
               />
            ))}
         </div>
      );
   }

   if (products.length === 0) {
      return (
         <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
         >
            <p className="text-lg text-muted-foreground">
               No products found matching your criteria
            </p>
         </motion.div>
      );
   }

   return (
      <motion.div
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         transition={{ staggerChildren: 0.1 }}
         className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
         {products.map((product) => (
            <motion.div
               key={product.id}
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
            >
               <ProductCard product={product} />
            </motion.div>
         ))}
      </motion.div>
   );
}
