"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Shirt,
  Search,
  TrendingUp,
  Zap,
  ArrowRight,
  Check,
} from "lucide-react";
import PromptInput from "@/components/PromptInput";
import OutfitCard from "@/components/OutfitCard";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import { Outfit } from "@fashiondeck/types";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<Outfit[]>([]);

  const handleSearch = async () => {
    if (!query || query.trim().length < 10) return;

    setIsSearching(true);

    // Simulate API call
    setTimeout(() => {
      const mockResults: Outfit[] = [
        {
          aesthetic: "KOREAN MINIMAL",
          score: 9.4,
          totalPrice: 3598,
          items: [
            {
              category: "top",
              title: "Oversized Cotton Tee",
              price: 899,
              image: "",
              url: "#",
              affiliateUrl: "#",
              marketplace: "amazon",
            },
            {
              category: "bottom",
              title: "Beige Chino Pants",
              price: 1499,
              image: "",
              url: "#",
              affiliateUrl: "#",
              marketplace: "flipkart",
            },
            {
              category: "shoes",
              title: "Canvas Sneakers",
              price: 1200,
              image: "",
              url: "#",
              affiliateUrl: "#",
              marketplace: "amazon",
            },
          ],
        },
        {
          aesthetic: "STREETWEAR",
          score: 8.7,
          totalPrice: 4200,
          items: [
            {
              category: "top",
              title: "Heavyweight Hoodie",
              price: 2100,
              image: "",
              url: "#",
              affiliateUrl: "#",
              marketplace: "amazon",
            },
            {
              category: "bottom",
              title: "Cargo Joggers",
              price: 2100,
              image: "",
              url: "#",
              affiliateUrl: "#",
              marketplace: "amazon",
            },
          ],
        },
        {
          aesthetic: "OLD MONEY",
          score: 9.1,
          totalPrice: 5800,
          items: [
            {
              category: "top",
              title: "Linen Blazer",
              price: 3400,
              image: "",
              url: "#",
              affiliateUrl: "#",
              marketplace: "amazon",
            },
            {
              category: "bottom",
              title: "Tailored Shorts",
              price: 2400,
              image: "",
              url: "#",
              affiliateUrl: "#",
              marketplace: "amazon",
            },
          ],
        },
      ];
      setResults(mockResults);
      setIsSearching(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory-light via-white to-dust/20 flex flex-col">
      {/* App Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-shadow/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-shadow to-shadow-light text-tuscan flex items-center justify-center rounded-lg group-hover:scale-105 transition-transform shadow-md">
                <Shirt size={20} />
              </div>
              <div>
                <span className="font-display font-black text-xl tracking-tight text-shadow">
                  FashionDeck
                </span>
                <p className="text-[9px] font-bold uppercase tracking-widest text-shadow/40">
                  AI Outfit Generator
                </p>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link
                href="#"
                className="text-sm font-medium text-shadow/60 hover:text-shadow transition-colors"
              >
                How it Works
              </Link>
              <Link
                href="#"
                className="text-sm font-medium text-shadow/60 hover:text-shadow transition-colors"
              >
                Pricing
              </Link>
              <button className="bg-shadow text-ivory px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-shadow-light transition-all shadow-md hover:shadow-lg">
                Sign In
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section - Clear Value Prop */}
      <section className="py-16 px-6 bg-white border-b border-shadow/5">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-tuscan/10 text-tuscan-dark px-4 py-2 rounded-full text-sm font-bold">
            <Sparkles size={16} />
            AI-Powered Fashion Recommendations
          </div>

          {/* Main Headline */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-shadow leading-tight font-medium">
              Describe Your Style,
              <br />
              Get Complete Outfits
            </h1>
            <p className="text-lg md:text-xl text-shadow/70 max-w-2xl mx-auto leading-relaxed">
              Tell us what you're looking for in plain English. Our AI finds and
              combines the perfect pieces from top retailers.
            </p>
          </div>

          {/* Search Input - Primary CTA */}
          <div className="max-w-3xl mx-auto pt-4">
            <PromptInput
              value={query}
              onChange={setQuery}
              onSubmit={handleSearch}
              isLoading={isSearching}
              suggestions={[
                "Casual summer brunch outfit under ₹5000",
                "Professional office look for a presentation",
                "Weekend streetwear with sneakers",
              ]}
              placeholder="e.g., 'Smart casual for a dinner date, budget ₹8000'"
            />
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-8 pt-8 text-sm text-shadow/60">
            <div className="flex items-center gap-2">
              <Check size={16} className="text-tuscan" />
              <span>Curated from 50+ retailers</span>
            </div>
            <div className="flex items-center gap-2">
              <Check size={16} className="text-tuscan" />
              <span>AI-matched aesthetics</span>
            </div>
            <div className="flex items-center gap-2">
              <Check size={16} className="text-tuscan" />
              <span>Direct purchase links</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Quick Overview */}
      {!results.length && !isSearching && (
        <section className="py-20 px-6 bg-gradient-to-b from-white to-ivory-light">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-serif text-shadow mb-4 font-medium">
                How FashionDeck Works
              </h2>
              <p className="text-shadow/60 text-lg">
                Get personalized outfit recommendations in 3 simple steps
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Search,
                  step: "1",
                  title: "Describe Your Need",
                  desc: "Tell us the occasion, style preference, and budget in natural language",
                },
                {
                  icon: Sparkles,
                  step: "2",
                  title: "AI Finds Matches",
                  desc: "Our algorithm searches across retailers and creates complete outfit combinations",
                },
                {
                  icon: TrendingUp,
                  step: "3",
                  title: "Shop Instantly",
                  desc: "Review curated outfits and buy items directly from your favorite stores",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white p-8 rounded-xl border border-shadow/10 hover:border-tuscan/30 transition-all hover:shadow-lg group"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-tuscan/20 to-tuscan/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <item.icon size={24} className="text-tuscan-dark" />
                  </div>
                  <div className="text-xs font-bold text-tuscan mb-2">
                    STEP {item.step}
                  </div>
                  <h3 className="text-xl font-serif text-shadow mb-3 font-medium">
                    {item.title}
                  </h3>
                  <p className="text-shadow/60 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="text-center mt-12">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="inline-flex items-center gap-2 bg-shadow text-ivory px-8 py-4 rounded-lg font-bold hover:bg-shadow-light transition-all shadow-lg hover:shadow-xl"
              >
                Try It Now <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Results Section */}
      {(results.length > 0 || isSearching) && (
        <main className="flex-1 py-16 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-12">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-3xl font-serif text-shadow mb-2 font-medium">
                    {isSearching
                      ? "Finding Perfect Matches..."
                      : "Your Outfit Recommendations"}
                  </h2>
                  <p className="text-shadow/60">
                    {isSearching
                      ? "Our AI is searching across retailers"
                      : `Found ${results.length} complete outfits for you`}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setResults([]);
                    setQuery("");
                  }}
                  className="text-sm font-medium text-shadow/60 hover:text-shadow transition-colors"
                >
                  New Search
                </button>
              </div>
            </div>

            {isSearching ? (
              <LoadingSkeleton />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {results.map((outfit, idx) => (
                  <div
                    key={idx}
                    className="animate-in fade-in slide-in-from-bottom-8 duration-700"
                    style={{ animationDelay: `${idx * 150}ms` }}
                  >
                    <OutfitCard outfit={outfit} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      )}

      {/* Footer */}
      <footer className="bg-shadow py-12 px-6 text-ivory mt-auto">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-tuscan text-shadow flex items-center justify-center rounded-lg">
                  <Shirt size={20} />
                </div>
                <span className="font-display font-black text-xl">
                  FashionDeck
                </span>
              </div>
              <p className="text-ivory/60 text-sm leading-relaxed max-w-sm">
                AI-powered outfit recommendations that match your style and
                budget. Shop smarter, dress better.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-ivory/60">
                <li>
                  <Link href="#" className="hover:text-ivory transition-colors">
                    How it Works
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-ivory transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-ivory transition-colors">
                    API
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-ivory/60">
                <li>
                  <Link href="#" className="hover:text-ivory transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-ivory transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-ivory transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-ivory/10 text-center text-sm text-ivory/40">
            © 2026 FashionDeck. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
