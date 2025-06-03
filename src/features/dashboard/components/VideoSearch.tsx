import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface VideoSearchProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

const VideoSearch: React.FC<VideoSearchProps> = ({ onSearch, isLoading = false }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-2xl mx-auto mt-6">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by video link..."
          disabled={isLoading}
          className={`w-full bg-slate-800 text-slate-200 pl-10 pr-4 py-2 rounded-lg border border-slate-700/50 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all duration-200 ${
            isLoading ? 'opacity-50 cursor-wait' : ''
          }`}
        />
        <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 ${
          isLoading ? 'animate-spin' : ''
        }`} />
      </div>
    </form>
  );
};

export default VideoSearch;