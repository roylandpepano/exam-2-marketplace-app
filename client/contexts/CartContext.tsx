/**
 * Cart Context
 * Manages shopping cart state
 */
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
   id: string;
   name: string;
   price: number;
   quantity: number;
   image: string;
}

interface CartContextType {
   items: CartItem[];
   addItem: (item: Omit<CartItem, "quantity">) => void;
   removeItem: (id: string) => void;
   updateQuantity: (id: string, quantity: number) => void;
   clearCart: () => void;
   total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
   const [items, setItems] = useState<CartItem[]>(() => {
      if (typeof window === "undefined") return [];
      const stored = localStorage.getItem("cart");
      return stored ? JSON.parse(stored) : [];
   });

   // Save to localStorage whenever items change
   useEffect(() => {
      localStorage.setItem("cart", JSON.stringify(items));
   }, [items]);

   const addItem = (item: Omit<CartItem, "quantity">) => {
      setItems((prevItems) => {
         const existing = prevItems.find((i) => i.id === item.id);
         if (existing) {
            return prevItems.map((i) =>
               i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
            );
         }
         return [...prevItems, { ...item, quantity: 1 }];
      });
   };

   const removeItem = (id: string) => {
      setItems((prevItems) => prevItems.filter((i) => i.id !== id));
   };

   const updateQuantity = (id: string, quantity: number) => {
      if (quantity <= 0) {
         removeItem(id);
         return;
      }
      setItems((prevItems) =>
         prevItems.map((i) => (i.id === id ? { ...i, quantity } : i))
      );
   };

   const clearCart = () => {
      setItems([]);
   };

   const total = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
   );

   return (
      <CartContext.Provider
         value={{
            items,
            addItem,
            removeItem,
            updateQuantity,
            clearCart,
            total,
         }}
      >
         {children}
      </CartContext.Provider>
   );
}

export function useCart() {
   const context = useContext(CartContext);
   if (!context) {
      throw new Error("useCart must be used within CartProvider");
   }
   return context;
}
