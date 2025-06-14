import React from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const HowItWorks: React.FC = () => {
  const { elementRef, animationClasses } = useScrollAnimation({
    animationType: 'slideUp',
    delay: 300,
    duration: 1000
  });

  return (
    <div ref={elementRef} className={`relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-16 overflow-hidden ${animationClasses}`}>
      {/* Premium background elements */}
      <div className="absolute inset-0">
        {/* Gradient overlays */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-amber-900/20 via-transparent to-yellow-900/20"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-slate-900/50 to-transparent"></div>
        
        {/* Animated geometric shapes with luxury colors */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-yellow-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-orange-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* Additional luxury elements */}
        <div className="absolute top-20 left-1/4 w-48 h-48 bg-gradient-to-r from-amber-400/10 to-yellow-400/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-20 right-1/4 w-56 h-56 bg-gradient-to-r from-yellow-400/10 to-orange-400/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        
        {/* Premium grid pattern with luxury colors */}
        <div className="absolute inset-0 opacity-8">
          <div className="h-full w-full bg-[linear-gradient(to_right,#f59e0b40_1px,transparent_1px),linear-gradient(to_bottom,#f59e0b40_1px,transparent_1px)] bg-[size:8rem_8rem]"></div>
        </div>
        
        {/* Luxury shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/5 to-transparent animate-pulse" style={{ animationDuration: '3s' }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="text-center">
          {/* Main heading with premium luxury styling */}
          <h2 className="relative inline-block mb-4">
            <span className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 tracking-tight leading-tight drop-shadow-2xl">
              How It Works
            </span>
            
            {/* Multiple glowing underline effects for luxury */}
            <div className="absolute -bottom-2 left-0 w-full h-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 rounded-full shadow-xl shadow-amber-500/50"></div>
            <div className="absolute -bottom-0.5 left-0 w-full h-0.5 bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-300 rounded-full shadow-md shadow-yellow-400/30"></div>
            
            {/* Premium glow effects with multiple layers */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 via-yellow-400/20 to-amber-500/20 blur-2xl -z-10 animate-pulse"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/15 via-amber-300/15 to-yellow-400/15 blur-xl -z-10 animate-pulse" style={{ animationDelay: '1s' }}></div>
            
            {/* Luxury sparkle effects */}
            <div className="absolute -top-3 -left-3 w-2 h-2 bg-yellow-300 rounded-full animate-ping opacity-60"></div>
            <div className="absolute -top-1 -right-4 w-1.5 h-1.5 bg-amber-300 rounded-full animate-ping opacity-50" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute -bottom-4 left-6 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-ping opacity-40" style={{ animationDelay: '1s' }}></div>
            <div className="absolute -bottom-3 -right-3 w-2 h-2 bg-amber-400 rounded-full animate-ping opacity-55" style={{ animationDelay: '1.5s' }}></div>
          </h2>
        </div>
      </div>

      {/* Luxury bottom fade effect with gradient */}
      <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-white dark:from-slate-900 via-amber-50/5 dark:via-slate-800/30 to-transparent"></div>
      
      {/* Additional luxury overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-amber-900/5 to-transparent pointer-events-none"></div>
    </div>
  );
};

export default HowItWorks;