import { useState } from 'react';

export const usePageAnimation = () => {
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  const triggerPageLoad = () => {
    console.log('Triggering page load animation...');
    
    // Start page animations after loading screen begins to fade
    const loadTimer = setTimeout(() => {
      console.log('Page animations starting...');
      setIsPageLoaded(true);
    }, 2000); // Start when loading is at 95%

    return () => clearTimeout(loadTimer);
  };

  return {
    isPageLoaded,
    triggerPageLoad,
  };
};