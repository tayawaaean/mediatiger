import React from 'react';

interface LoadingScreenProps {
  isVisible: boolean;
  progress: number;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ isVisible, progress }) => {
  console.log('LoadingScreen render - isVisible:', isVisible, 'progress:', progress);

  // Detect platform for consistent styling
  const isWindows = typeof window !== 'undefined' && window.navigator.platform.includes('Win');

  return (
    <div className={`fixed inset-0 z-[100] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center transition-all duration-700 ease-out ${
      isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
    }`} style={{
      // Force consistent background for Windows
      backgroundColor: '#0f172a',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)'
    }}>
      {/* Animated background elements with platform-specific adjustments */}
      <div className="absolute inset-0">
        <div 
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl animate-pulse"
          style={{
            backgroundColor: 'rgba(99, 102, 241, 0.2)',
            animationDuration: isWindows ? '3s' : '2s'
          }}
        ></div>
        <div 
          className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-3xl animate-pulse" 
          style={{ 
            animationDelay: '1s',
            backgroundColor: 'rgba(139, 92, 246, 0.2)',
            animationDuration: isWindows ? '3s' : '2s'
          }}
        ></div>
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-2xl animate-pulse" 
          style={{ 
            animationDelay: '2s',
            backgroundColor: 'rgba(59, 130, 246, 0.15)',
            animationDuration: isWindows ? '3s' : '2s'
          }}
        ></div>
      </div>

      <div className="relative text-center">
        {/* Logo with premium animation */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/30 via-purple-500/30 to-indigo-500/30 rounded-2xl blur-2xl animate-pulse"></div>
          <div className="relative flex items-center justify-center space-x-4 px-8 py-4 rounded-2xl border border-slate-700/50" style={{
            backgroundColor: 'rgba(30, 41, 59, 0.5)',
            backdropFilter: 'blur(12px)'
          }}>
            <img 
              src="https://vaeuvecjtnvismnobvyy.supabase.co/storage/v1/object/public/images//39888c2f-22d0-4a95-85ae-dfa6dc1aae7b.png" 
              alt="MediaTiger Logo" 
              className="w-10 h-10 object-contain animate-pulse"
            />
            <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-white">
              MediaTiger
            </span>
          </div>
        </div>

        {/* Completely smooth loading progress bar */}
        <div className="w-80 mx-auto mb-6">
          <div className="relative h-4 rounded-full overflow-hidden" style={{
            backgroundColor: 'rgba(51, 65, 85, 0.5)',
            backdropFilter: 'blur(12px)'
          }}>
            {/* Background track */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-700/50 to-slate-600/50 rounded-full"></div>
            
            {/* Singular smooth progress bar */}
            <div 
              className="absolute top-0 left-0 h-full rounded-full"
              style={{ 
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #6366f1 100%)',
                // No transition - let the JavaScript animation handle smoothness
                transition: 'none',
                boxShadow: '0 0 20px rgba(139, 92, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
              }}
            >
              {/* Inner highlight for depth */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/20 rounded-full"></div>
              
              {/* Continuous shimmer effect */}
              <div 
                className="absolute inset-0 rounded-full animate-shimmer"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%)',
                  backgroundSize: '200% 100%'
                }}
              ></div>
            </div>
            
            {/* Subtle border glow */}
            <div className="absolute inset-0 rounded-full border border-indigo-500/30 pointer-events-none"></div>
          </div>
          
          {/* Progress text with smooth number display */}
          <div className="mt-4 text-slate-300 text-lg font-medium flex items-center justify-center space-x-2">
            <span>Loading...</span>
            <span 
              className="font-bold text-indigo-400 tabular-nums"
              style={{
                textShadow: '0 0 10px rgba(99, 102, 241, 0.5)'
              }}
            >
              {Math.round(progress)}%
            </span>
          </div>
        </div>

        {/* Loading dots animation */}
        <div className="flex justify-center space-x-3 mb-6">
          {[0, 1, 2].map((index) => (
            <div 
              key={index}
              className="w-3 h-3 rounded-full animate-bounce"
              style={{ 
                backgroundColor: index === 0 ? '#6366f1' : index === 1 ? '#8b5cf6' : '#6366f1',
                animationDelay: `${index * 0.15}s`,
                animationDuration: isWindows ? '1.4s' : '1.2s',
                boxShadow: `0 0 10px ${index === 0 ? 'rgba(99, 102, 241, 0.6)' : index === 1 ? 'rgba(139, 92, 246, 0.6)' : 'rgba(99, 102, 241, 0.6)'}`
              }}
            ></div>
          ))}
        </div>

        {/* Loading text with dynamic messages */}
        <div className="space-y-3">
          <p className="text-slate-400 text-lg font-medium animate-pulse">
            {progress < 20 && "Initializing MediaTiger..."}
            {progress >= 20 && progress < 40 && "Loading premium features..."}
            {progress >= 40 && progress < 60 && "Setting up your workspace..."}
            {progress >= 60 && progress < 80 && "Preparing your experience..."}
            {progress >= 80 && progress < 95 && "Finalizing setup..."}
            {progress >= 95 && "Almost ready..."}
          </p>
          <p className="text-slate-500 text-sm">
            Get ready for the future of YouTube monetization
            {isWindows && " (Windows)"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;