"use client";

import Link from "next/link";
import {
  Sparkles,
  Shirt,
  ArrowRight,
  Zap,
  TrendingUp,
  ShoppingBag,
  Check,
  Star,
  Clock,
  Wallet,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-shadow/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
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

            <div className="hidden md:flex items-center gap-8">
              <Link
                href="#features"
                className="text-sm font-medium text-shadow/60 hover:text-shadow transition-colors"
              >
                Features
              </Link>
              <Link
                href="#how-it-works"
                className="text-sm font-medium text-shadow/60 hover:text-shadow transition-colors"
              >
                How it Works
              </Link>
              <Link
                href="#pricing"
                className="text-sm font-medium text-shadow/60 hover:text-shadow transition-colors"
              >
                Pricing
              </Link>
              <Link
                href="/search"
                className="bg-shadow text-ivory px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-shadow-light transition-all shadow-md hover:shadow-lg"
              >
                Try Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-ivory-light via-white to-dust/20">
        <div className="max-w-7xl mx-auto px-6 py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Value Prop */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-tuscan/10 text-tuscan-dark px-4 py-2 rounded-full text-sm font-bold">
                <Sparkles size={16} />
                Powered by Advanced AI
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-shadow leading-tight font-medium">
                Your Personal
                <br />
                <span className="relative inline-block">
                  AI Stylist
                  <span className="absolute -bottom-2 left-0 w-full h-2 bg-tuscan/30" />
                </span>
              </h1>

              <p className="text-xl text-shadow/70 leading-relaxed max-w-lg">
                Describe what you need in plain English. Get complete outfit
                recommendations from top retailers in seconds.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                  href="/search"
                  className="inline-flex items-center justify-center gap-2 bg-shadow text-ivory px-8 py-4 rounded-lg font-bold hover:bg-shadow-light transition-all shadow-lg hover:shadow-xl text-center"
                >
                  Start Styling Now <ArrowRight size={18} />
                </Link>
                <button className="inline-flex items-center justify-center gap-2 bg-white text-shadow px-8 py-4 rounded-lg font-bold border-2 border-shadow/20 hover:border-shadow/40 transition-all">
                  Watch Demo
                </button>
              </div>

              {/* Social Proof */}
              <div className="flex items-center gap-6 pt-8">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-tuscan/20 to-dust border-2 border-white"
                    />
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        size={14}
                        className="fill-tuscan text-tuscan"
                      />
                    ))}
                  </div>
                  <p className="text-sm text-shadow/60">
                    <span className="font-bold text-shadow">2,500+</span>{" "}
                    outfits generated
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Visual */}
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl border border-shadow/10 p-8 space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-shadow/10">
                  <div className="w-8 h-8 bg-tuscan/10 rounded-lg flex items-center justify-center">
                    <Sparkles size={16} className="text-tuscan-dark" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-shadow/40 uppercase tracking-wider">
                      AI Recommendation
                    </p>
                    <p className="text-sm font-bold text-shadow">
                      Korean Minimal
                    </p>
                  </div>
                  <div className="ml-auto bg-tuscan/10 text-tuscan-dark px-3 py-1 rounded-full text-xs font-bold">
                    9.4/10
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="aspect-[3/4] bg-gradient-to-br from-dust/30 to-dust/10 rounded-lg"
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-shadow/10">
                  <div>
                    <p className="text-xs text-shadow/40 font-bold uppercase tracking-wider mb-1">
                      Total Price
                    </p>
                    <p className="text-2xl font-bold text-shadow">₹3,598</p>
                  </div>
                  <button className="bg-shadow text-ivory px-6 py-3 rounded-lg font-bold hover:bg-shadow-light transition-all shadow-md">
                    View Items
                  </button>
                </div>
              </div>

              {/* Floating Stats */}
              <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg border border-shadow/10 px-4 py-3">
                <p className="text-xs text-shadow/40 font-bold uppercase tracking-wider mb-1">
                  Success Rate
                </p>
                <p className="text-2xl font-bold text-tuscan-dark">94%</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif text-shadow mb-4 font-medium">
              Why Choose FashionDeck?
            </h2>
            <p className="text-xl text-shadow/60 max-w-2xl mx-auto">
              The smartest way to discover and shop complete outfits
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "Instant Recommendations",
                desc: "Get AI-curated outfit suggestions in seconds, not hours of browsing",
                color: "from-yellow-500/20 to-tuscan/20",
              },
              {
                icon: TrendingUp,
                title: "Smart Aesthetic Matching",
                desc: "Our AI understands style contexts and creates cohesive looks",
                color: "from-blue-500/20 to-purple-500/20",
              },
              {
                icon: ShoppingBag,
                title: "Multi-Retailer Search",
                desc: "We search across 50+ retailers to find the best pieces for you",
                color: "from-green-500/20 to-emerald-500/20",
              },
              {
                icon: Wallet,
                title: "Budget-Friendly",
                desc: "Set your budget and get recommendations that fit your price range",
                color: "from-pink-500/20 to-rose-500/20",
              },
              {
                icon: Clock,
                title: "Save Time",
                desc: "No more endless scrolling. Get complete outfits in one search",
                color: "from-orange-500/20 to-amber-500/20",
              },
              {
                icon: Check,
                title: "Direct Purchase Links",
                desc: "Buy items instantly with affiliate links to trusted retailers",
                color: "from-teal-500/20 to-cyan-500/20",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="bg-white p-8 rounded-xl border border-shadow/10 hover:border-tuscan/30 hover:shadow-lg transition-all group"
              >
                <div
                  className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon size={24} className="text-shadow" />
                </div>
                <h3 className="text-xl font-serif text-shadow mb-3 font-medium">
                  {feature.title}
                </h3>
                <p className="text-shadow/60 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="py-20 bg-gradient-to-b from-white to-ivory-light"
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif text-shadow mb-4 font-medium">
              How It Works
            </h2>
            <p className="text-xl text-shadow/60">
              Get personalized outfits in 3 simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection Lines */}
            <div className="hidden md:block absolute top-20 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-tuscan/30 to-transparent" />

            {[
              {
                step: "1",
                title: "Describe Your Need",
                desc: "Tell us the occasion, style, and budget in natural language",
                example: '"Casual brunch outfit under ₹5000"',
              },
              {
                step: "2",
                title: "AI Finds Matches",
                desc: "Our algorithm searches retailers and creates complete outfits",
                example: "Analyzing 10,000+ products...",
              },
              {
                step: "3",
                title: "Shop & Save",
                desc: "Review curated outfits and buy items with one click",
                example: "3 complete outfits ready!",
              },
            ].map((item, idx) => (
              <div key={idx} className="relative">
                <div className="bg-white p-8 rounded-xl border border-shadow/10 shadow-md hover:shadow-xl transition-all space-y-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-tuscan to-tuscan-dark text-white rounded-full flex items-center justify-center text-xl font-bold shadow-lg">
                    {item.step}
                  </div>
                  <h3 className="text-2xl font-serif text-shadow font-medium">
                    {item.title}
                  </h3>
                  <p className="text-shadow/60 leading-relaxed">{item.desc}</p>
                  <div className="bg-tuscan/5 border border-tuscan/20 rounded-lg p-3 text-sm font-mono text-shadow/70 italic">
                    {item.example}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/search"
              className="inline-flex items-center gap-2 bg-shadow text-ivory px-8 py-4 rounded-lg font-bold hover:bg-shadow-light transition-all shadow-lg hover:shadow-xl"
            >
              Try It Free Now <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-shadow to-shadow-light text-ivory">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-serif font-medium">
            Ready to Upgrade Your Wardrobe?
          </h2>
          <p className="text-xl text-ivory/80 max-w-2xl mx-auto">
            Join thousands of users who've discovered their perfect style with
            AI
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              href="/search"
              className="inline-flex items-center justify-center gap-2 bg-tuscan text-shadow px-8 py-4 rounded-lg font-bold hover:bg-tuscan-light transition-all shadow-lg hover:shadow-xl"
            >
              Get Started Free <ArrowRight size={18} />
            </Link>
            <button className="inline-flex items-center justify-center gap-2 bg-white/10 text-ivory px-8 py-4 rounded-lg font-bold border-2 border-white/20 hover:bg-white/20 transition-all backdrop-blur-sm">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-shadow py-12 px-6 text-ivory">
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
                  <Link
                    href="/search"
                    className="hover:text-ivory transition-colors"
                  >
                    Try Free
                  </Link>
                </li>
                <li>
                  <Link
                    href="#features"
                    className="hover:text-ivory transition-colors"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="#pricing"
                    className="hover:text-ivory transition-colors"
                  >
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
                    Careers
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
          <div className="pt-8 border-t border-ivory/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-ivory/40">
            <p>© 2026 FashionDeck. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="#" className="hover:text-ivory transition-colors">
                Privacy
              </Link>
              <Link href="#" className="hover:text-ivory transition-colors">
                Terms
              </Link>
              <Link href="#" className="hover:text-ivory transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
