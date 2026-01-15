"use client";

import { ProductItem } from "@fashiondeck/types";
import { ExternalLink, ShoppingBag, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import MarketplaceBadge from "./MarketplaceBadge";

interface ItemCardProps {
  item: ProductItem;
  className?: string;
}

export default function ItemCard({ item, className = "" }: ItemCardProps) {
  return (
    <div
      className={`group relative bg-white border border-shadow/5 hover:border-shadow/20 transition-all duration-500 ${className}`}
    >
      {/* Product Image */}
      <div className="relative aspect-[3/4] bg-dust/5 overflow-hidden flex items-center justify-center">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.title}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-700 grayscale-[0.5] group-hover:grayscale-0"
            loading="lazy"
          />
        ) : (
          <ShoppingBag size={48} className="text-shadow/5" />
        )}

        {/* Subtle Marketplace Indicator */}
        <div className="absolute top-4 right-4 z-10 opacity-60 group-hover:opacity-100 transition-opacity">
          <MarketplaceBadge
            marketplace={item.marketplace}
            className="!bg-white/80 !border-none scale-75"
          />
        </div>
      </div>

      {/* Product Info */}
      <div className="p-5 space-y-3">
        <div className="space-y-1">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-shadow/60">
            {item.category}
          </p>
          <h5 className="font-serif text-lg text-shadow leading-snug line-clamp-1 group-hover:text-shadow/80 transition-colors font-medium">
            {item.title}
          </h5>
        </div>

        <div className="flex items-center justify-between pt-2">
          <p className="text-lg font-display font-medium text-shadow tracking-tighter">
            ₹{item.price}
          </p>
          <a
            href={item.affiliateUrl || item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-shadow/60 hover:text-shadow transition-colors"
          >
            Details <ArrowUpRight size={12} />
          </a>
        </div>
      </div>
    </div>
  );
}
