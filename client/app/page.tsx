"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { SearchBar } from "@/components/SearchBar";
import { ProductFilter } from "@/components/ProductFilter";
import { ProductsGrid } from "@/components/ProductsGrid";
import { MOCK_PRODUCTS } from "@/lib/products";

export default function Home() {
   const [searchQuery, setSearchQuery] = useState("");
   const [selectedCategory, setSelectedCategory] = useState("All");
   const [minPrice, setMinPrice] = useState(0);
   const [maxPrice, setMaxPrice] = useState(1000);

   const handleSearch = useCallback((query: string) => {
      setSearchQuery(query);
   }, []);

   // Filter and search products
   const filteredProducts = useMemo(() => {
      return MOCK_PRODUCTS.filter((product) => {
         const matchesSearch =
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description
               .toLowerCase()
               .includes(searchQuery.toLowerCase());

         const matchesCategory =
            selectedCategory === "All" || product.category === selectedCategory;

         const matchesPrice =
            product.price >= minPrice && product.price <= maxPrice;

         return matchesSearch && matchesCategory && matchesPrice;
      });
   }, [searchQuery, selectedCategory, minPrice, maxPrice]);

   return (
      <div className="container mx-auto px-4 py-8">
         {/* Header / Hero */}
         <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 text-center hero"
         >
            {/* Decorative animated background - purely visual */}
            <div className="hero__bg" aria-hidden="true">
               <div className="blob b1" />
               <div className="blob b2" />
               <div className="blob b3" />
            </div>

            <header className="hero-content" role="banner">
               <h1 className="mb-4 text-4xl font-bold">Explore Marketplace</h1>
               <p className="text-muted-foreground">
                  Discover amazing products from various categories all in one
               </p>
               <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 }}
                  className="mt-6 mx-auto max-w-xl"
               >
                  <SearchBar onSearch={handleSearch} />
               </motion.div>
            </header>
         </motion.div>

         {/* Products Section */}
         <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
               <ProductFilter
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  onMinPriceChange={setMinPrice}
                  onMaxPriceChange={setMaxPrice}
               />
            </div>

            {/* Products Grid */}
            <div className="lg:col-span-3">
               <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">
                     {selectedCategory === "All"
                        ? "All Products"
                        : selectedCategory}
                  </h2>
                  <p className="text-muted-foreground">
                     Showing {filteredProducts.length} product
                     {filteredProducts.length !== 1 ? "s" : ""}
                     {searchQuery && ` matching "${searchQuery}"`}
                  </p>
               </div>
               <ProductsGrid products={filteredProducts} />
            </div>
         </div>

         {/* Footer */}
         <footer className="mt-8 text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()}{" "}
            <Link href="https://roylandvp.com/">RoylandVP</Link>. All rights
            reserved.
         </footer>
      </div>
   );
}
