import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   images: {
      // Allow loading images from Unsplash (used in mock product data)
      remotePatterns: [
         {
            protocol: "https",
            hostname: "images.unsplash.com",
            port: "",
            pathname: "/**",
         },
         // Allow loading images served from local API during development
         {
            protocol: "http",
            hostname: "localhost",
            port: "5000",
            pathname: "/**",
         },
         {
            protocol: "http",
            hostname: "127.0.0.1",
            port: "5000",
            pathname: "/**",
         },
      ],
   },
};

export default nextConfig;
