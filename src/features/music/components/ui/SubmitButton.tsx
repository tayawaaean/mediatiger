import React from 'react';

interface SubmitButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({
  onClick,
  disabled = false,
  loading = false,
  children,
  className = ""
}) => {
  return (
    <button 
      onClick={onClick}
      disabled={disabled || loading}
      className={`px-8 py-4 rounded-lg font-medium transition-all duration-200 bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {loading ? 'Submitting...' : children}
    </button>
  );
};