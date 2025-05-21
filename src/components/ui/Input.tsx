import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', icon, error, ...props }, ref) => {
    return (
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={`
            block w-full 
            px-4 py-2.5 
            ${icon ? 'pl-10' : 'pl-4'} 
            bg-slate-700/50 
            border border-slate-600 
            rounded-lg
            text-slate-200 
            placeholder:text-slate-500
            focus:outline-none
            focus:ring-2 
            focus:ring-indigo-500/50 
            focus:border-indigo-500
            transition-all duration-200
            ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
            ${className}
          `}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';