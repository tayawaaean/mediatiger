import React from "react";
import { MessageSquare, Search } from "lucide-react";

interface ChatHeaderProps {
  recipientName: string;
  onSearch: (query: string) => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  recipientName,
  onSearch,
}) => {
  return (
    <div className="flex items-center justify-between p-3 sm:p-6 border-b border-slate-700/50 bg-slate-800/60">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-200">
            {recipientName}
          </h1>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search messages..."
            onChange={(e) => onSearch(e.target.value.trim())}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                (e.target as HTMLInputElement).value = "";
                onSearch("");
              }
            }}
            className="pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 w-full max-w-xs sm:max-w-sm md:w-64 transition-all duration-200"
          />
        </div>
      </div>
    </div>
  );
};
