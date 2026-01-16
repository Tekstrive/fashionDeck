"use client";

import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-editorial-white text-editorial-text font-sans selection:bg-editorial-accent/30">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-editorial-white/80 backdrop-blur-md border-b border-editorial-divider">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="font-serif text-2xl tracking-tight font-medium hover:opacity-80 transition-opacity">
              FashionDeck
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-10">
            <Link href="#how-it-works" className="text-sm font-medium text-editorial-text-muted hover:text-editorial-text transition-colors">
              How it works
            </Link>
            <Link href="#faq" className="text-sm font-medium text-editorial-text-muted hover:text-editorial-text transition-colors">
              FAQ
            </Link>
            <Link
              href="/app"
              className="text-sm font-medium border-b border-editorial-text pb-0.5 hover:border-editorial-text-muted hover:text-editorial-text-muted transition-all"
            >
              Try for free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-10 order-2 lg:order-1">
            <h1 className="font-serif text-6xl md:text-7xl lg:text-8xl leading-[0.95] tracking-tight">
              Tell us the vibe. <br />
              We build the outfit.
            </h1>
            <p className="text-lg md:text-xl text-editorial-text-muted max-w-md leading-relaxed">
              Turn natural language requests into ready-to-buy outfits from Amazon and Flipkart. No scrolling. No filters. Just the look.
            </p>
            
            <div className="pt-4 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
              <Link
                href="/app"
                className="bg-editorial-text text-editorial-white px-8 py-4 text-sm font-medium hover:bg-editorial-text-muted transition-colors"
              >
                Try for free
              </Link>
              <Link href="#how-it-works" className="text-sm border-b border-gray-300 pb-1 hover:border-editorial-text transition-all">
                How it works
              </Link>
            </div>
          </div>

          <div className="relative order-1 lg:order-2 aspect-[4/5] bg-gray-100 overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1550614000-4b9519e02d48?q=80&w=2576&auto=format&fit=crop"
              alt="Fashion Editorial"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 border-t border-editorial-divider">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20">
            <h2 className="font-serif text-4xl md:text-5xl mb-4">How it works</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12 lg:gap-24">
            <div className="space-y-4">
              <span className="font-serif text-5xl text-gray-200">01</span>
              <h3 className="text-xl font-medium">Describe the vibe</h3>
              <p className="text-editorial-text-muted leading-relaxed">
                Type something like &quot;korean minimal fit, size M, under 1500&quot; or &quot;90s vintage streetwear&quot;.
              </p>
            </div>
            <div className="space-y-4">
              <span className="font-serif text-5xl text-gray-200">02</span>
              <h3 className="text-xl font-medium">We build the outfit</h3>
              <p className="text-editorial-text-muted leading-relaxed">
                Our system matches your aesthetic using real products from multiple marketplaces.
              </p>
            </div>
            <div className="space-y-4">
              <span className="font-serif text-5xl text-gray-200">03</span>
              <h3 className="text-xl font-medium">Buy it instantly</h3>
              <p className="text-editorial-text-muted leading-relaxed">
                Get distinct, complete outfits sourced directly from leading retailers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-24 px-6 bg-gray-50 border-y border-editorial-divider">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-32">
            <div>
              <h2 className="font-serif text-4xl md:text-5xl leading-tight mb-8">
                Designed for how people actually shop.
              </h2>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-12">
              <div>
                <h3 className="font-medium text-lg mb-2">Aesthetic-first shopping</h3>
                <p className="text-sm text-editorial-text-muted leading-relaxed">Shop by vibes: Korean, Y2K, Minimal, Streetwear, Vintage.</p>
              </div>
              <div>
                <h3 className="font-medium text-lg mb-2">Cross-marketplace results</h3>
                <p className="text-sm text-editorial-text-muted leading-relaxed">Get the best combo from Amazon and Flipkart in one place.</p>
              </div>
              <div>
                <h3 className="font-medium text-lg mb-2">Budget & size aware</h3>
                <p className="text-sm text-editorial-text-muted leading-relaxed">Filter by price and size automatically in your prompt.</p>
              </div>
               <div>
                <h3 className="font-medium text-lg mb-2">Complete outfits</h3>
                <p className="text-sm text-editorial-text-muted leading-relaxed">Not just single items, full cohesive looks that work together.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Example Output / Inspiration */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto mb-20">
           <h2 className="font-serif text-4xl md:text-5xl">Outfits you can actually buy</h2>
        </div>

        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="group cursor-pointer">
                <div className="aspect-[3/4] bg-gray-100 relative mb-4 overflow-hidden">
                    <Image 
                     src="https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=1887&auto=format&fit=crop" 
                     alt="Korean Minimal" 
                     fill 
                     className="object-cover group-hover:scale-105 transition-transform duration-700" 
                   />
                </div>
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-medium">Korean Minimal</h3>
                        <p className="text-sm text-gray-500 mt-1">~ ₹3,500</p>
                    </div>
                </div>
            </div>

             {/* Card 2 */}
            <div className="group cursor-pointer">
                <div className="aspect-[3/4] bg-gray-100 relative mb-4 overflow-hidden">
                    <Image 
                       src="https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=1887&auto=format&fit=crop" 
                       alt="Urban Streetwear" 
                       fill 
                       className="object-cover group-hover:scale-105 transition-transform duration-700" 
                     />
                </div>
                 <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-medium">Urban Streetwear</h3>
                        <p className="text-sm text-gray-500 mt-1">~ ₹4,200</p>
                    </div>
                </div>
            </div>

             {/* Card 3 */}
            <div className="group cursor-pointer">
                <div className="aspect-[3/4] bg-gray-100 relative mb-4 overflow-hidden">
                    <Image 
                       src="https://images.unsplash.com/photo-1550246140-29f40b909e5a?q=80&w=1887&auto=format&fit=crop" 
                       alt="Vintage Casual" 
                       fill 
                       className="object-cover group-hover:scale-105 transition-transform duration-700" 
                     />
                </div>
                 <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-medium">Vintage Casual</h3>
                        <p className="text-sm text-gray-500 mt-1">~ ₹2,800</p>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Marketplaces */}
      <section className="py-24 px-6 border-t border-editorial-divider text-center">
        <div className="max-w-4xl mx-auto">
            <h2 className="font-serif text-3xl mb-4">Powered by your favorite stores</h2>
            <p className="text-editorial-text-muted mb-12">Currently supporting</p>
            
            <div className="flex justify-center items-center gap-12 md:gap-24 opacity-60 grayscale">
                 {/* Amazon Logo Placeholder */}
                 <span className="text-2xl font-bold tracking-tight">amazon</span>
                 <span className="h-6 w-px bg-gray-300"></span>
                 {/* Flipkart Logo Placeholder */}
                 <span className="text-2xl font-bold italic text-blue-600">Flipkart</span>
            </div>
             <p className="text-sm text-gray-400 mt-12">More marketplaces coming soon.</p>
        </div>
      </section>


      {/* FAQ */}
      <section id="faq" className="py-24 px-6 bg-gray-50 border-t border-editorial-divider">
        <div className="max-w-3xl mx-auto">
            <h2 className="font-serif text-4xl mb-16 text-center">Frequently Asked Questions</h2>
            
            <div className="space-y-px bg-editorial-divider border border-editorial-divider">
                 {[
                    { q: "How does it work?", a: "Describe your desired look, budget, and size in plain English. We search top retailers to build a complete outfit that matches your request." },
                    { q: "Where do the products come from?", a: "We currently source products from Amazon and Flipkart to ensure fast delivery and reliable service." },
                    { q: "Do you sell the items?", a: "No, we are a discovery platform. We provide direct links to purchase items from the respective retailers." },
                    { q: "Which sizes do you support?", a: "You can specify any standard size (XS to XXL) in your prompt, and we'll filter for available items." },
                    { q: "Is it free to use?", a: "Yes, FashionDeck is completely free to use for outfit generation and discovery." }
                 ].map((item, i) => (
                    <div key={i} className="bg-editorial-white p-6 md:p-8">
                        <h3 className="font-medium text-lg mb-2">{item.q}</h3>
                        <p className="text-editorial-text-muted leading-relaxed">{item.a}</p>
                    </div>
                 ))}
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-editorial-divider bg-editorial-white">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
            <div className="md:col-span-1">
                <Link href="/" className="font-serif text-2xl font-medium block mb-6">FashionDeck</Link>
            </div>
            
            <div className="col-span-2 md:col-start-3 grid grid-cols-2 sm:grid-cols-3 gap-8">
                <div>
                     <h4 className="text-xs uppercase tracking-widest text-gray-500 mb-6">Product</h4>
                     <ul className="space-y-4 text-sm">
                        <li><Link href="/app" className="hover:text-gray-600">Try for free</Link></li>
                        <li><Link href="#how-it-works" className="hover:text-gray-600">How it works</Link></li>
                     </ul>
                </div>
                 <div>
                     <h4 className="text-xs uppercase tracking-widest text-gray-500 mb-6">Company</h4>
                     <ul className="space-y-4 text-sm">
                        <li><Link href="#" className="hover:text-gray-600">About</Link></li>
                        <li><Link href="#" className="hover:text-gray-600">Contact</Link></li>
                     </ul>
                </div>
                  <div>
                     <h4 className="text-xs uppercase tracking-widest text-gray-500 mb-6">Legal</h4>
                     <ul className="space-y-4 text-sm">
                        <li><Link href="#" className="hover:text-gray-600">Terms</Link></li>
                        <li><Link href="#" className="hover:text-gray-600">Privacy</Link></li>
                     </ul>
                </div>
            </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between text-sm text-gray-400">
             <p>&copy; 2026 FashionDeck. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
