"use client";

import { useState } from "react";
import { Outfit } from "@fashiondeck/types";
import { Sparkles, ChevronRight, ChevronDown, ShoppingBag } from "lucide-react";
import ItemCard from "./ItemCard";

interface OutfitCardProps {
  outfit: Outfit;
  className?: string;
}

export default function OutfitCard({
  outfit,
  className = "",
}: OutfitCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={`group bg-white border border-shadow/5 hover:border-shadow/20 transition-all duration-700 ${className}`}
    >
      {/* Header Info */}
      <div className="p-8">
        <div className="flex justify-between items-start mb-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-shadow/60 bg-shadow/5 px-2 py-1">
                {outfit.aesthetic}
              </span>
              {outfit.score && (
                <div className="flex items-center gap-1.5 text-shadow text-xs font-serif italic font-medium">
                  <Sparkles size={12} className="text-tuscan-dark" />
                  {outfit.score.toFixed(1)} / 10
                </div>
              )}
            </div>
            <h4 className="text-3xl font-serif text-shadow leading-tight font-medium">
              The {outfit.aesthetic.split(" ")[0]} Look
            </h4>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-shadow/60 uppercase tracking-[0.2em] mb-1">
              Price
            </p>
            <p className="text-2xl font-display font-medium text-shadow tracking-tighter">
              ₹{outfit.totalPrice}
            </p>
          </div>
        </div>

        {/* Visual Preview - Modular Squares */}
        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
          {outfit.items.map((item, idx) => (
            <div
              key={idx}
              className="w-20 h-20 bg-ivory-light flex-shrink-0 flex items-center justify-center overflow-hidden border border-shadow/5 grayscale hover:grayscale-0 transition-all duration-500"
            >
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <ShoppingBag size={24} className="text-shadow/10" />
              )}
            </div>
          ))}
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between pt-6 mt-4 border-t border-shadow/5 text-[10px] font-bold uppercase tracking-[0.3em] text-shadow/60 hover:text-shadow transition-colors group/btn"
        >
          {isExpanded ? "COLLAPSE VIEW" : "EXPLORE ITEMS"}
          {isExpanded ? (
            <ChevronDown size={14} />
          ) : (
            <ChevronRight
              size={14}
              className="group-hover/btn:translate-x-1 transition-transform"
            />
          )}
        </button>
      </div>

      {/* Expanded Items Display - Magazine Grid */}
      {isExpanded && (
        <div className="px-8 pb-8 space-y-4 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 gap-4">
            {outfit.items.map((item, idx) => (
              <ItemCard
                key={idx}
                item={item}
                className="!bg-ivory-light border-none shadow-none"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
