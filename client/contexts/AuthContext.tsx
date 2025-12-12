/**
 * Authentication Context
 * Manages user authentication state
 */
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "@/lib/api";

interface User {
   id: string;
   email: string;
   name: string;
}

interface AuthContextType {
   user: User | null;
   isLoading: boolean;
   login: (email: string, password: string) => Promise<void>;
   register: (name: string, email: string, password: string) => Promise<void>;
   logout: () => void;
   isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
   const [user, setUser] = useState<User | null>(null);
   const [isLoading, setIsLoading] = useState(true);

   useEffect(() => {
      // Load user from localStorage on mount
      const stored = localStorage.getItem("user");
      if (stored) {
         setUser(JSON.parse(stored));
      }
      setIsLoading(false);
   }, []);

   const login = async (email: string, password: string) => {
      setIsLoading(true);
      try {
         const data = await api.login(email, password);
         const u = data.user;
         if (u) {
            localStorage.setItem("user", JSON.stringify(u));
            setUser(u);
         }
      } finally {
         setIsLoading(false);
      }
   };

   const register = async (name: string, email: string, password: string) => {
      setIsLoading(true);
      try {
         const data = await api.register(name, email, password);
         const u = data.user;
         if (u) {
            localStorage.setItem("user", JSON.stringify(u));
            setUser(u);
         }
      } finally {
         setIsLoading(false);
      }
   };

   const logout = () => {
      localStorage.removeItem("user");
      localStorage.removeItem("cart");
      setUser(null);
   };

   return (
      <AuthContext.Provider
         value={{
            user,
            isLoading,
            login,
            register,
            logout,
            isLoggedIn: user !== null,
         }}
      >
         {children}
      </AuthContext.Provider>
   );
}

export function useAuth() {
   const context = useContext(AuthContext);
   if (!context) {
      throw new Error("useAuth must be used within AuthProvider");
   }
   return context;
}
