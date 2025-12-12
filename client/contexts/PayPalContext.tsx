"use client";

import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { ReactNode } from "react";

const initialOptions = {
   clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
   currency: "USD",
   intent: "capture",
};

export function PayPalProvider({ children }: { children: ReactNode }) {
   return (
      <PayPalScriptProvider options={initialOptions}>
         {children}
      </PayPalScriptProvider>
   );
}
