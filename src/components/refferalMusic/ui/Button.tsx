import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  color?: 'yellow' | 'pink' | 'blue';
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  color = 'yellow',
  size = 'medium',
  children,
  className,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold uppercase border-4 border-black transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]';
  
  const colorStyles = {
    yellow: 'bg-yellow-400 hover:bg-yellow-500',
    pink: 'bg-pink-400 hover:bg-pink-500',
    blue: 'bg-blue-400 hover:bg-blue-500',
  };
  
  const sizeStyles = {
    small: 'text-sm sm:text-base px-3 sm:px-4 py-1.5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]',
    medium: 'text-base sm:text-lg px-4 sm:px-6 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
    large: 'text-lg sm:text-xl px-6 sm:px-8 py-2.5 sm:py-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]',
  };
  
  return (
    <button
      className={`${baseStyles} ${colorStyles[color]} ${sizeStyles[size]} 
                 hover:translate-x-[3px] hover:translate-y-[3px] hover:scale-[0.98]
                 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;