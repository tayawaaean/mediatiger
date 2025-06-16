import { useState, useEffect } from 'react';

export interface LoadingState {
  isInitialLoading: boolean;
  isNavigationLoaded: boolean;
  isHeroLoaded: boolean;
  isContentLoaded: boolean;
  loadingProgress: number;
}

export const useLoadingAnimations = () => {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isInitialLoading: true,
    isNavigationLoaded: false,
    isHeroLoaded: false,
    isContentLoaded: false,
    loadingProgress: 0,
  });

  useEffect(() => {
    console.log('Starting smooth loading animation...');
    
    // Detect if running in Electron (Windows/Mac)
    const isElectron = typeof window !== 'undefined' && window.navigator.userAgent.includes('Electron');
    const isWindows = typeof window !== 'undefined' && window.navigator.platform.includes('Win');
    
    // Force immediate dark mode for Windows
    if (isElectron && isWindows) {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#0f172a';
      document.body.style.color = '#ffffff';
      
      // Prevent any light mode flashing
      const style = document.createElement('style');
      style.textContent = `
        * {
          transition: none !important;
          animation-duration: 0.01ms !important;
        }
        
        body, html {
          background-color: #0f172a !important;
          color: #ffffff !important;
        }
      `;
      document.head.appendChild(style);
      
      // Remove the style after a short delay to restore animations
      setTimeout(() => {
        document.head.removeChild(style);
      }, 100);
    }

    // Smooth continuous loading with requestAnimationFrame
    const startTime = Date.now();
    const totalDuration = 2500; // 2.5 seconds total
    const windowsDelay = isElectron && isWindows ? 200 : 0;
    
    let animationFrame: number;
    
    const animate = () => {
      const elapsed = Date.now() - startTime - windowsDelay;
      const progress = Math.min((elapsed / totalDuration) * 100, 100);
      
      // Smooth easing function for natural progression
      const easedProgress = easeOutCubic(progress / 100) * 100;
      
      setLoadingState(prev => ({
        ...prev,
        loadingProgress: Math.max(0, easedProgress),
        // Trigger state changes at specific progress points
        isNavigationLoaded: easedProgress >= 60,
        isHeroLoaded: easedProgress >= 80,
        isContentLoaded: easedProgress >= 95,
        isInitialLoading: easedProgress < 100,
      }));
      
      if (progress < 100) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        // Final cleanup after animation completes
        setTimeout(() => {
          setLoadingState(prev => ({
            ...prev,
            isInitialLoading: false,
            loadingProgress: 100,
          }));
        }, 300);
      }
    };
    
    // Start animation after initial delay
    const startTimeout = setTimeout(() => {
      animationFrame = requestAnimationFrame(animate);
    }, windowsDelay);

    return () => {
      console.log('Cleaning up smooth loading animation');
      clearTimeout(startTimeout);
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, []);

  return loadingState;
};

// Smooth easing function for natural progression
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}