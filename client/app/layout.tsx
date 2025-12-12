import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { PayPalProvider } from "@/contexts/PayPalContext";
import ClientToaster from "@/components/ClientToaster";

const geistSans = Geist({
   variable: "--font-geist-sans",
   subsets: ["latin"],
});

const geistMono = Geist_Mono({
   variable: "--font-geist-mono",
   subsets: ["latin"],
});

export const metadata: Metadata = {
   title: "ShopEase",
   description: "Your one-stop online shop for everything you need.",
};

export default function RootLayout({
   children,
}: Readonly<{
   children: React.ReactNode;
}>) {
   return (
      <html lang="en">
         <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
         >
            <AuthProvider>
               <CartProvider>
                  <PayPalProvider>
                     <Navbar />
                     <main className="min-h-screen bg-gray-50 dark:bg-black">
                        {children}
                     </main>
                     <ClientToaster />
                  </PayPalProvider>
               </CartProvider>
            </AuthProvider>
         </body>
      </html>
   );
}
