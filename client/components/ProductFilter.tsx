/**
 * Product Filter Component
 */
"use client";

import { motion } from "motion/react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CATEGORIES } from "@/lib/products";

interface ProductFilterProps {
   selectedCategory: string;
   onCategoryChange: (category: string) => void;
   minPrice: number;
   maxPrice: number;
   onMinPriceChange: (price: number) => void;
   onMaxPriceChange: (price: number) => void;
}

export function ProductFilter({
   selectedCategory,
   onCategoryChange,
   minPrice,
   maxPrice,
   onMinPriceChange,
   onMaxPriceChange,
}: ProductFilterProps) {
   return (
      <motion.div
         initial={{ opacity: 0, x: -20 }}
         animate={{ opacity: 1, x: 0 }}
         transition={{ duration: 0.3 }}
      >
         <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Filters</h3>

            {/* Category Filter */}
            <div className="mb-6">
               <h4 className="font-medium text-sm mb-3">Category</h4>
               <div className="space-y-2">
                  {CATEGORIES.map((category) => (
                     <label
                        key={category}
                        className="flex items-center gap-3 cursor-pointer group"
                     >
                        <input
                           type="radio"
                           name="category"
                           value={category}
                           checked={selectedCategory === category}
                           onChange={(e) => onCategoryChange(e.target.value)}
                           className="rounded-full"
                        />
                        <span className="text-sm group-hover:text-blue-600 transition-colors">
                           {category}
                        </span>
                     </label>
                  ))}
               </div>
            </div>

            {/* Price Filter */}
            <div>
               <h4 className="font-medium text-sm mb-3">Price Range</h4>
               <div className="space-y-3">
                  <div>
                     <label className="text-xs text-muted-foreground">
                        Min Price
                     </label>
                     <Input
                        type="number"
                        value={minPrice}
                        onChange={(e) =>
                           onMinPriceChange(Number(e.target.value))
                        }
                        placeholder="$0"
                        className="mt-1"
                     />
                  </div>
                  <div>
                     <label className="text-xs text-muted-foreground">
                        Max Price
                     </label>
                     <Input
                        type="number"
                        value={maxPrice}
                        onChange={(e) =>
                           onMaxPriceChange(Number(e.target.value))
                        }
                        placeholder="$1000"
                        className="mt-1"
                     />
                  </div>
               </div>
            </div>
         </Card>
      </motion.div>
   );
}
