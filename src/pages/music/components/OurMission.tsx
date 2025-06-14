import React from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const OurMission: React.FC = () => {
  const { elementRef, animationClasses } = useScrollAnimation({
    animationType: 'scale',
    delay: 300,
    duration: 1000
  });

  return (
    <div ref={elementRef} id="our-mission" className={`relative bg-gradient-to-br from-amber-900/20 via-yellow-900/20 to-amber-800/20 py-16 overflow-hidden scroll-mt-16 ${animationClasses}`}>
      {/* Simplified background elements */}
      <div className="absolute inset-0">
        {/* Basic gradient overlay */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-amber-900/20 via-transparent to-yellow-900/20"></div>
        
        {/* Subtle animated shapes */}
        <div className="absolute -top-16 -left-16 w-48 h-48 bg-amber-500/8 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-yellow-500/8 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="text-center">
          {/* Main heading */}
          <h2 className="relative inline-block mb-8">
            <span className="text-5xl md:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-white tracking-tight leading-tight drop-shadow-2xl">
              OUR
            </span>
            <br />
            <span className="relative inline-block">
              <span className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tight leading-tight drop-shadow-2xl">
                MISSION
              </span>
              {/* Luxurious yellow highlight with multiple layers */}
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 transform -rotate-1 -z-10 rounded-xl shadow-2xl"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-300/50 via-amber-300/50 to-yellow-400/50 transform rotate-1 -z-20 rounded-xl blur-sm"></div>
              <div className="absolute inset-0 bg-yellow-500/30 -z-30 rounded-xl blur-xl animate-pulse"></div>
            </span>
            
            {/* Premium glow effects around the entire heading */}
            <div className="absolute -inset-8 bg-gradient-to-r from-amber-500/20 via-yellow-400/20 to-amber-500/20 blur-3xl -z-40 animate-pulse"></div>
            <div className="absolute -inset-12 bg-gradient-to-r from-yellow-400/10 via-amber-300/10 to-yellow-400/10 blur-3xl -z-50 animate-pulse" style={{ animationDelay: '1s' }}></div>
            
            {/* Luxury sparkle effects */}
            <div className="absolute -top-4 -left-4 w-3 h-3 bg-yellow-400 rounded-full animate-ping opacity-70"></div>
            <div className="absolute -top-2 -right-6 w-2 h-2 bg-amber-400 rounded-full animate-ping opacity-60" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute -bottom-6 left-8 w-2.5 h-2.5 bg-yellow-500 rounded-full animate-ping opacity-50" style={{ animationDelay: '1s' }}></div>
            <div className="absolute -bottom-4 -right-4 w-3 h-3 bg-amber-500 rounded-full animate-ping opacity-65" style={{ animationDelay: '1.5s' }}></div>
            
            {/* Additional luxury border effects */}
            <div className="absolute -inset-2 border-2 border-yellow-400/20 dark:border-yellow-500/20 rounded-2xl animate-pulse"></div>
            <div className="absolute -inset-4 border border-amber-400/10 dark:border-amber-500/10 rounded-3xl animate-pulse" style={{ animationDelay: '0.7s' }}></div>
            <div className="absolute -inset-2 border-2 border-yellow-400/20 rounded-2xl animate-pulse"></div>
            <div className="absolute -inset-4 border border-amber-400/10 rounded-3xl animate-pulse" style={{ animationDelay: '0.7s' }}></div>
          </h2>

          {/* Mission statement */}
          <div className="max-w-4xl mx-auto">
            <p className="text-xl md:text-2xl lg:text-3xl text-slate-200 leading-relaxed font-medium">
              Short-form is the future, and we make sure you get paid more for your hard work!{" "}
              <span className="font-bold text-white">
                We believe we can help every single creator on YouTube earn more.
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OurMission;