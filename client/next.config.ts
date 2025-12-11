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
      ],
   },
};

export default nextConfig;
