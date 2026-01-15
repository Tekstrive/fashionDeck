import { Marketplace } from "@fashiondeck/types";
import { Info } from "lucide-react";

interface MarketplaceBadgeProps {
  marketplace: Marketplace;
  className?: string;
}

export default function MarketplaceBadge({
  marketplace,
  className = "",
}: MarketplaceBadgeProps) {
  const isAmazon = marketplace === "amazon";

  return (
    <div
      className={`group relative flex items-center justify-center p-1.5 rounded-lg border border-dust/30 bg-white/50 backdrop-blur-sm cursor-help hover:border-tuscan transition-colors ${className}`}
      title={isAmazon ? "Available on Amazon" : "Available on Flipkart"}
    >
      {isAmazon ? (
        <span className="font-display font-black text-[10px] tracking-tighter text-shadow select-none">
          AMZN<span className="text-tuscan">.</span>
        </span>
      ) : (
        <span className="font-display font-black text-[10px] tracking-tighter text-shadow italic select-none">
          FK<span className="text-tuscan">RT</span>
        </span>
      )}

      {/* Tooltip placeholder - in a real app we'd use a portal or Radix Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-shadow text-ivory text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
        {isAmazon ? "Amazon India" : "Flipkart"}
      </div>
    </div>
  );
}
