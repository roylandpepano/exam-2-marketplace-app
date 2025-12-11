/**
 * Mock Products Data
 */

export interface Product {
   id: string;
   name: string;
   price: number;
   category: string;
   description: string;
   image: string;
   rating: number;
   reviews: number;
}

export const MOCK_PRODUCTS: Product[] = [
   {
      id: "1",
      name: "Wireless Headphones",
      price: 79.99,
      category: "Electronics",
      description: "High-quality wireless headphones with noise cancellation",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
      rating: 4.5,
      reviews: 128,
   },
   {
      id: "2",
      name: "Smart Watch",
      price: 199.99,
      category: "Electronics",
      description: "Track your fitness and stay connected",
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
      rating: 4.8,
      reviews: 256,
   },
   {
      id: "3",
      name: "Yoga Mat",
      price: 29.99,
      category: "Sports",
      description: "Premium non-slip yoga mat for all types of yoga",
      image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=400&fit=crop",
      rating: 4.6,
      reviews: 89,
   },
   {
      id: "4",
      name: "Running Shoes",
      price: 120.0,
      category: "Sports",
      description: "Comfortable and durable running shoes",
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
      rating: 4.7,
      reviews: 342,
   },
   {
      id: "5",
      name: "Coffee Maker",
      price: 89.99,
      category: "Home",
      description: "Programmable coffee maker with thermal carafe",
      image: "https://images.unsplash.com/photo-1517668808822-9ebb02ae2a0e?w=400&h=400&fit=crop",
      rating: 4.4,
      reviews: 167,
   },
   {
      id: "6",
      name: "Desk Lamp",
      price: 45.99,
      category: "Home",
      description: "LED desk lamp with adjustable brightness",
      image: "https://images.unsplash.com/photo-1565636192335-14c0b8ce5fb6?w=400&h=400&fit=crop",
      rating: 4.3,
      reviews: 56,
   },
   {
      id: "7",
      name: "Bluetooth Speaker",
      price: 59.99,
      category: "Electronics",
      description: "Portable waterproof Bluetooth speaker",
      image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop",
      rating: 4.6,
      reviews: 203,
   },
   {
      id: "8",
      name: "Phone Stand",
      price: 19.99,
      category: "Electronics",
      description: "Adjustable aluminum phone stand",
      image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop",
      rating: 4.5,
      reviews: 134,
   },
   {
      id: "9",
      name: "Water Bottle",
      price: 34.99,
      category: "Sports",
      description: "Insulated stainless steel water bottle",
      image: "https://images.unsplash.com/photo-1602143407151-7e36dd5f5914?w=400&h=400&fit=crop",
      rating: 4.7,
      reviews: 412,
   },
   {
      id: "10",
      name: "Bedside Table",
      price: 159.99,
      category: "Home",
      description: "Modern wooden bedside table with drawer",
      image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop",
      rating: 4.5,
      reviews: 78,
   },
   {
      id: "11",
      name: "Gaming Mouse",
      price: 69.99,
      category: "Electronics",
      description: "High-precision gaming mouse with RGB lighting",
      image: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&h=400&fit=crop",
      rating: 4.8,
      reviews: 289,
   },
   {
      id: "12",
      name: "Weighted Blanket",
      price: 99.99,
      category: "Home",
      description: "Premium weighted blanket for better sleep",
      image: "https://images.unsplash.com/photo-1557804506-669714d2e745?w=400&h=400&fit=crop",
      rating: 4.6,
      reviews: 521,
   },
];

export const CATEGORIES = ["All", "Electronics", "Sports", "Home"];
