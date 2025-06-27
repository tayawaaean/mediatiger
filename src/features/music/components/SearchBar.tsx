import React, { useRef } from "react";
import { Search, XCircle } from "lucide-react";

interface SearchBarProps {
  searchTerm: string;
  onSearch: (term: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearch,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = () => {
    onSearch("");
    inputRef.current?.focus();
    inputRef.current!.value = ""; // Force reset input value
  };

  return (
    <div className="relative flex-1">
      <input
        ref={inputRef}
        type="text"
        value={searchTerm}
        onChange={(e) => onSearch(e.target.value)}
        placeholder="Search tracks..."
        className="w-full pl-10 pr-12 py-2 md:py-2.5 bg-white/5 text-slate-300 rounded-full border border-slate-700/50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 text-sm md:text-base transition-colors"
      />

      {/* Search icon */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
        <Search className="w-4 h-4 md:w-5 md:h-5" />
      </div>

      {/* Clear button */}
      {searchTerm && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1 rounded-full hover:bg-white/5 min-w-[24px] min-h-[24px] flex items-center justify-center"
          aria-label="Clear search"
        >
          <XCircle className="w-4 h-4 md:w-5 md:h-5" />
        </button>
      )}
    </div>
  );
};
