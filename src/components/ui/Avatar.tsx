
// Avatar.tsx (if you need to modify it)
import React from 'react';

interface AvatarProps {
  letter: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
                                                letter,
                                                size = 'md',
                                                className = ''
                                              }) => {
  const sizeClasses = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
    xl: 'h-16 w-16 text-2xl',
  };

  return (
      <div
          className={`rounded-full flex items-center justify-center text-white font-bold ${sizeClasses[size]} ${className}`}
      >
        {letter}
      </div>
  );
};