import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
   Card,
   CardContent,
   CardTitle,
   CardDescription,
} from "@/components/ui/card";

export const metadata = {
   title: "About — ShopEase",
   description: "Learn more about ShopEase — our mission, values, and team.",
};

export default function AboutPage() {
   return (
      <main className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-950">
         <section className="container mx-auto px-8 py-16">
            <div className="grid gap-12 md:grid-cols-2 md:items-center">
               <div>
                  <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white md:text-5xl">
                     Built for sellers. Loved by shoppers.
                  </h1>
                  <p className="mt-4 max-w-xl text-lg text-slate-600 dark:text-slate-300">
                     ShopEase is a modern marketplace focused on delightful
                     shopping experiences — curated products, secure checkout,
                     and fast shipping. We're a small team with a big mission:
                     make buying and selling online simple and beautiful.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">
                     <Link href="/">
                        <Button className="shadow-md">Browse products</Button>
                     </Link>
                  </div>
               </div>

               <div className="relative flex items-center justify-center">
                  <div className="pointer-events-none select-none">
                     <div className="overflow-hidden">
                        <Image
                           src="/about.png"
                           alt="About hero"
                           width={720}
                           height={450}
                           className="h-auto w-full object-cover"
                        />
                     </div>
                  </div>
               </div>
            </div>
         </section>

         <section className="container mx-auto px-8 pb-16">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
               What we offer
            </h2>

            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
               <Card>
                  <CardContent>
                     <CardTitle className="text-lg">
                        Curated selection
                     </CardTitle>
                     <CardDescription>
                        Hand-picked products from trusted sellers — quality and
                        value first.
                     </CardDescription>
                  </CardContent>
               </Card>

               <Card>
                  <CardContent>
                     <CardTitle className="text-lg">Secure checkout</CardTitle>
                     <CardDescription>
                        End-to-end security and privacy for customers and
                        sellers.
                     </CardDescription>
                  </CardContent>
               </Card>

               <Card>
                  <CardContent>
                     <CardTitle className="text-lg">Fast shipping</CardTitle>
                     <CardDescription>
                        Optimized fulfillment and tracking for a dependable
                        delivery experience.
                     </CardDescription>
                  </CardContent>
               </Card>
            </div>
         </section>

         <section className="border-t border-slate-100 dark:border-slate-800">
            <div className="container mx-auto px-8 py-12">
               <div className="grid gap-8 md:grid-cols-3">
                  <div>
                     <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        Our mission
                     </h3>
                     <p className="mt-3 text-slate-600 dark:text-slate-300">
                        We want to make commerce human again — empowering
                        creators and small businesses while creating joyful
                        experiences for shoppers.
                     </p>
                  </div>

                  <div>
                     <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        Team
                     </h3>
                     <p className="mt-3 text-slate-600 dark:text-slate-300">
                        A compact, cross-functional team focused on product
                        quality, performance, and design.
                     </p>
                  </div>

                  <div>
                     <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        Questions?
                     </h3>
                     <p className="mt-3 text-slate-600 dark:text-slate-300">
                        Reach out via the contact page or email
                        support@shopease.local and we'll get back shortly.
                     </p>
                  </div>
               </div>
            </div>
         </section>
      </main>
   );
}
