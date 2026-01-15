import { Shirt, ExternalLink, Heart, Sparkles } from "lucide-react";
import Image from "next/image";

interface Product {
  id: string;
  title: string;
  price: number;
  category: string;
  image_url: string;
  shop_url?: string;
}

interface OutfitCardProps {
  aesthetic: string;
  score: number;
  items: Product[];
}

export default function OutfitCard({
  aesthetic,
  score,
  items,
}: OutfitCardProps) {
  return (
    <div className="group glass-card rounded-3xl overflow-hidden hover:shadow-vibrant transition-all duration-500 hover:translate-y-[-4px]">
      {/* Visual Header */}
      <div className="relative h-48 bg-dust/20 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <Shirt className="text-dust w-16 h-16 opacity-20" />
        </div>

        {/* Aesthetic Badge */}
        <div className="absolute top-4 left-4 bg-shadow/80 backdrop-blur-md text-ivory px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
          {aesthetic}
        </div>

        {/* Score Badge */}
        <div className="absolute top-4 right-4 bg-tuscan text-shadow px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
          <Sparkles size={12} />
          {score.toFixed(1)}
        </div>

        {/* Preview of item images (if available) - just placeholder for now */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-ivory/80 to-transparent flex items-end px-4 pb-4 gap-2">
          {items.slice(0, 3).map((item, idx) => (
            <div
              key={idx}
              className="w-12 h-12 rounded-lg bg-white border border-dust/50 shadow-sm flex-shrink-0"
            />
          ))}
        </div>
      </div>

      {/* Details Section */}
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-display font-bold text-shadow text-lg truncate">
            Complete Look
          </h4>
          <button className="text-dust hover:text-red-400 transition-colors">
            <Heart size={20} />
          </button>
        </div>

        <ul className="space-y-2">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-center justify-between text-sm">
              <span className="text-shadow/70 truncate mr-2">{item.title}</span>
              <span className="font-bold text-shadow whitespace-nowrap">
                ₹{item.price}
              </span>
            </li>
          ))}
        </ul>

        <div className="pt-2 flex items-center gap-2">
          <button className="flex-1 premium-button !p-3 rounded-xl text-sm flex items-center justify-center gap-2">
            View Details
            <ExternalLink size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
