"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { SearchBar } from "@/components/SearchBar";
import { ProductFilter } from "@/components/ProductFilter";
import { ProductsGrid } from "@/components/ProductsGrid";
import { api, API_BASE_URL } from "@/lib/api";
import { Product } from "@/lib/products";
import { useEffect } from "react";

export default function Home() {
   const [searchQuery, setSearchQuery] = useState("");
   const [selectedCategory, setSelectedCategory] = useState("All");
   const [minPrice, setMinPrice] = useState(0);
   const [maxPrice, setMaxPrice] = useState(1000);
   const [products, setProducts] = useState<Product[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

   const handleSearch = useCallback((query: string) => {
      setSearchQuery(query);
   }, []);

   useEffect(() => {
      let mounted = true;
      api.getPublicProducts()
         .then((res) => {
            if (!mounted) return;
            const items = res.products || [];
            // Map server product shape to client Product shape
            type ServerProduct = {
               id?: number | string;
               name?: string;
               price?: number | string;
               category?: { name?: string } | string;
               short_description?: string;
               description?: string;
               image_url?: string;
               images?: string[];
               view_count?: number | string;
               sales_count?: number | string;
            };

            const mapped: Product[] = items.map(
               (p: Record<string, unknown>) => {
                  const pp = p as ServerProduct;
                  const imageUrl = pp.image_url;
                  const imagesArr = pp.images;
                  const resolvedImage =
                     typeof imageUrl === "string" && imageUrl
                        ? imageUrl.startsWith("http")
                           ? imageUrl
                           : `${API_BASE_URL}/${imageUrl}`
                        : imagesArr && imagesArr[0]
                        ? `${API_BASE_URL}/${imagesArr[0]}`
                        : "/placeholder.png";

                  const viewCount = Number(pp.view_count || 0);

                  return {
                     id: String(pp.id),
                     name: pp.name,
                     price: Number(pp.price || 0),
                     category:
                        typeof pp.category === "string"
                           ? pp.category
                           : pp.category?.name || "Uncategorized",
                     description: pp.short_description || pp.description || "",
                     image: resolvedImage,
                     rating: Math.min(
                        5,
                        Math.max(1, Math.round((viewCount % 5) + 1))
                     ),
                     reviews: Number(pp.sales_count || 0),
                  } as Product;
               }
            );

            setProducts(mapped);
         })
         .catch((err) => {
            console.error(err);
            if (!mounted) return;
            setError(err.message || "Failed to load products");
         })
         .finally(() => mounted && setLoading(false));

      return () => {
         mounted = false;
      };
   }, []);

   // Filter and search products
   const filteredProducts = useMemo(() => {
      return products.filter((product) => {
         const name = (product.name || "").toString();
         const desc = (product.description || "").toString();

         const matchesSearch =
            name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            desc.toLowerCase().includes(searchQuery.toLowerCase());

         const matchesCategory =
            selectedCategory === "All" || product.category === selectedCategory;

         const price = Number(product.price || 0);
         const matchesPrice = price >= minPrice && price <= maxPrice;

         return matchesSearch && matchesCategory && matchesPrice;
      });
   }, [products, searchQuery, selectedCategory, minPrice, maxPrice]);

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
                     {loading
                        ? "Loading products..."
                        : error
                        ? `Error: ${error}`
                        : `Showing ${filteredProducts.length} product${
                             filteredProducts.length !== 1 ? "s" : ""
                          }${searchQuery ? ` matching "${searchQuery}"` : ""}`}
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
