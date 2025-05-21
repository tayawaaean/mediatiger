import React from 'react';

interface ToggleProps {
  label?: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  className?: string;
  disabled?: boolean;
}

export const Toggle: React.FC<ToggleProps> = ({
                                                label,
                                                enabled,
                                                onChange,
                                                className = '',
                                                disabled = false,
                                              }) => {
  return (
      <button
          type="button"
          className={`
        relative inline-flex h-6 w-11
        rounded-full 
        transition-colors ease-in-out duration-200
        ${enabled ? 'bg-indigo-600' : 'bg-slate-700'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
          onClick={() => !disabled && onChange(!enabled)}
          aria-pressed={enabled}
          disabled={disabled}
      >
        {label && <span className="sr-only">{label}</span>}
        <span
            className={`
          absolute top-0.5
          h-5 w-5 rounded-full 
          bg-white shadow
          transition-all duration-200 ease-in-out
          ${enabled ? 'left-6' : 'left-0.5'}
        `}
            aria-hidden="true"
        />
      </button>
  );
};