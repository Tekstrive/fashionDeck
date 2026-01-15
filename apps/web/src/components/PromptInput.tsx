"use client";

import { useEffect, useRef } from "react";
import { Loader2, ArrowRight } from "lucide-react";

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
  suggestions?: string[];
  placeholder?: string;
}

export default function PromptInput({
  value,
  onChange,
  onSubmit,
  isLoading = false,
  suggestions = [],
  placeholder = "Describe your vision...",
}: PromptInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      onSubmit();
    }
  };

  const isQueryValid = value.trim().length >= 10;

  return (
    <div className="w-full space-y-4">
      <div className="relative border-b-2 border-shadow/10 focus-within:border-shadow transition-all duration-700 pb-2">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full bg-transparent text-2xl md:text-3xl font-serif text-shadow placeholder:text-shadow/20 focus:outline-none transition-all"
        />

        <div className="absolute right-0 bottom-2 flex items-center gap-4">
          <button
            onClick={onSubmit}
            disabled={!isQueryValid || isLoading}
            className="flex items-center gap-2 text-shadow hover:text-tuscan-dark disabled:opacity-20 disabled:cursor-not-allowed transition-all group"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <span className="hidden md:inline text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 group-hover:opacity-100 transition-opacity">
                  Generate
                </span>
                <ArrowRight
                  size={20}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Suggested Chips - Styled as subtle links/tags */}
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-shadow/30 self-center">
            Try:
          </span>
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => onChange(suggestion)}
              className="text-xs font-medium text-shadow/40 hover:text-shadow border-b border-transparent hover:border-shadow transition-all uppercase tracking-wider"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
