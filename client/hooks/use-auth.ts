"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, getToken } from "@/lib/api";

export function useAuth() {
   const [user, setUser] = useState<any>(null);
   const [loading, setLoading] = useState(true);
   const router = useRouter();

   useEffect(() => {
      checkAuth();
   }, []);

   const checkAuth = async () => {
      try {
         const token = getToken();
         if (!token) {
            setLoading(false);
            return;
         }

         const data = await api.getCurrentUser();
         setUser(data.user);
      } catch (error) {
         console.error("Auth check failed:", error);
         if ((error as any)?.body)
            console.error("Error body:", (error as any).body);
         setUser(null);
      } finally {
         setLoading(false);
      }
   };

   const login = async (email: string, password: string) => {
      const data = await api.login(email, password);
      setUser(data.user);
      return data;
   };

   const logout = async () => {
      await api.logout();
      setUser(null);
      router.push("/login");
   };

   return {
      user,
      loading,
      login,
      logout,
      isAuthenticated: !!user,
      isAdmin: user?.is_admin || false,
   };
}
