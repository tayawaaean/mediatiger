import React from 'react';
import { RequestStatus } from '../../music/types';

interface RequestFiltersProps {
  activeFilter: RequestStatus | 'all';
  onFilterChange: (filter: RequestStatus | 'all') => void;
}

export const RequestFilters: React.FC<RequestFiltersProps> = ({
  activeFilter,
  onFilterChange
}) => {
  const filters: Array<{ key: RequestStatus | 'all'; label: string }> = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'completed', label: 'Completed' },
    { key: 'rejected', label: 'Rejected' }
  ];

  return (
    <div className="flex gap-2">
      {filters.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onFilterChange(key)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            activeFilter === key
              ? 'bg-purple-600 text-white'
              : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
};