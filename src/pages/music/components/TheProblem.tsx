import React from 'react';
import { AlertTriangle, TrendingDown, DollarSign, Mouse } from 'lucide-react';
import { useScrollAnimation, useStaggeredAnimation } from '../hooks/useScrollAnimation';

const TheProblem: React.FC = () => {
  const { elementRef: headerRef, animationClasses: headerClasses } = useScrollAnimation({
    animationType: 'scale',
    delay: 300,
    duration: 800
  });

  const { elementRef: subtitleRef, animationClasses: subtitleClasses } = useScrollAnimation({
    animationType: 'slideUp',
    delay: 500,
    duration: 800
  });

  const { containerRef: statsRef, getItemClasses } = useStaggeredAnimation(3, 200);

  const { elementRef: ctaRef, animationClasses: ctaClasses } = useScrollAnimation({
    animationType: 'fadeIn',
    delay: 800,
    duration: 800
  });

  return (
    <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-32 overflow-hidden">
      {/* Premium background elements */}
      <div className="absolute inset-0">
        {/* Gradient overlays */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-red-900/20 via-transparent to-orange-900/20"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-slate-900/50 to-transparent"></div>
        
        {/* Animated geometric shapes */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-500/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* Premium grid pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="h-full w-full bg-[linear-gradient(to_right,#ef444480_1px,transparent_1px),linear-gradient(to_bottom,#ef444480_1px,transparent_1px)] bg-[size:6rem_6rem]"></div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        {/* Warning indicator */}
        <div className="flex justify-center mb-8">
          <div className="relative inline-flex items-center px-6 py-3 bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded-full shadow-2xl">
            <AlertTriangle className="w-6 h-6 text-red-400 mr-3 animate-pulse" />
            <span className="text-red-300 font-semibold text-lg tracking-wide">REVENUE ALERT</span>
            <div className="absolute inset-0 bg-red-500/10 rounded-full blur-xl animate-pulse"></div>
          </div>
        </div>

        <div className="text-center">
          {/* Main heading with premium styling */}
          <div ref={headerRef} className={headerClasses}>
            <h2 className="relative inline-block mb-8">
            <span className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 tracking-tight leading-tight">
              The Problem
            </span>
            
            {/* Glowing underline effect */}
            <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 rounded-full shadow-lg shadow-orange-500/50"></div>
            
            {/* Premium glow effects */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-orange-500/20 to-yellow-500/20 blur-3xl -z-10 animate-pulse"></div>
          </h2>
          </div>

          {/* Subtitle with enhanced typography */}
          <div ref={subtitleRef} className={`max-w-5xl mx-auto mb-12 ${subtitleClasses}`}>
            <p className="text-2xl md:text-3xl text-slate-200 leading-relaxed font-light mb-6">
              Most YouTube creators are{" "}
              <span className="relative inline-block">
                <span className="relative z-10 font-bold text-red-300">missing out on thousands</span>
                <span className="absolute bottom-0 left-0 w-full h-3 bg-red-500/30 transform -rotate-1 blur-sm"></span>
              </span>
              {" "}in revenue from their Shorts, just because they're not using{" "}
              <span className="relative inline-block">
                <span className="relative z-10 font-bold text-yellow-300">monetizable music</span>
                <span className="absolute bottom-0 left-0 w-full h-3 bg-yellow-500/30 transform rotate-1 blur-sm"></span>
              </span>.
            </p>
          </div>

          {/* Impact statistics */}
          <div ref={statsRef} className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {/* Lost Revenue Card */}
            <div className={`relative group ${getItemClasses(0)}`}>
              <div className="relative bg-slate-800/50 backdrop-blur-sm border border-red-500/30 rounded-2xl p-8 shadow-2xl hover:shadow-red-500/20 transition-all duration-500 transform hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent rounded-2xl"></div>
                <div className="relative z-10">
                  <TrendingDown className="w-12 h-12 text-red-400 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <div className="text-3xl font-black text-red-300 mb-2">$5K-$20K+</div>
                  <div className="text-slate-300 font-medium">Monthly Revenue Lost</div>
                </div>
                <div className="absolute inset-0 bg-red-500/5 rounded-2xl blur-xl group-hover:bg-red-500/10 transition-all duration-500"></div>
              </div>
            </div>

            {/* Missed Opportunity Card */}
            <div className={`relative group ${getItemClasses(1)}`}>
              <div className="relative bg-slate-800/50 backdrop-blur-sm border border-orange-500/30 rounded-2xl p-8 shadow-2xl hover:shadow-orange-500/20 transition-all duration-500 transform hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent rounded-2xl"></div>
                <div className="relative z-10">
                  <DollarSign className="w-12 h-12 text-orange-400 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <div className="text-3xl font-black text-orange-300 mb-2">95%</div>
                  <div className="text-slate-300 font-medium">Creators Missing Out</div>
                </div>
                <div className="absolute inset-0 bg-orange-500/5 rounded-2xl blur-xl group-hover:bg-orange-500/10 transition-all duration-500"></div>
              </div>
            </div>

            {/* Simple Solution Card */}
            <div className={`relative group ${getItemClasses(2)}`}>
              <div className="relative bg-slate-800/50 backdrop-blur-sm border border-yellow-500/30 rounded-2xl p-8 shadow-2xl hover:shadow-yellow-500/20 transition-all duration-500 transform hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent rounded-2xl"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                    <Mouse className="w-8 h-8 text-yellow-400 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div className="text-3xl font-black text-yellow-300 mb-2">1 Click</div>
                  <div className="text-slate-300 font-medium">To Fix This Problem</div>
                </div>
                <div className="absolute inset-0 bg-yellow-500/5 rounded-2xl blur-xl group-hover:bg-yellow-500/10 transition-all duration-500"></div>
              </div>
            </div>
          </div>

          {/* Call to action hint */}
          <div ref={ctaRef} className={`mt-16 ${ctaClasses}`}>
            <div className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-slate-800/80 to-slate-700/80 backdrop-blur-sm border border-slate-600/50 rounded-full shadow-2xl">
              <span className="text-slate-300 font-medium text-lg mr-3">But there's a simple solution...</span>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default TheProblem;