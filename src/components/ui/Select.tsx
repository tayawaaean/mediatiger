import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[];
  icon?: React.ReactNode;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', options, icon, error, ...props }, ref) => {
    return (
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
            {icon}
          </div>
        )}
        <select
          ref={ref}
          className={`
            appearance-none
            block w-full 
            px-4 py-2.5 
            ${icon ? 'pl-10' : 'pl-4'} 
            bg-slate-700/50 
            border border-slate-600 
            rounded-lg
            text-slate-200 
            focus:outline-none
            focus:ring-2 
            focus:ring-indigo-500/50 
            focus:border-indigo-500
            transition-all duration-200
            pr-10
            ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
            ${className}
          `}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
          <ChevronDown size={18} />
        </div>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';