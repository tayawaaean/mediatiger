import React from 'react';
import { Search } from 'lucide-react';

interface NoResultsProps {
  searchTerm: string;
}

export const NoResults: React.FC<NoResultsProps> = ({ searchTerm }) => {
  return (
    <div className="col-span-full text-center py-16">
      <div className="inline-block mb-4 text-slate-400">
        <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
      </div>
      <h3 className="text-lg font-medium mb-2">No results found</h3>
      <p className="text-sm text-slate-400">
        No matches found for "{searchTerm}". Try different keywords or check the spelling
      </p>
    </div>
  );
};
