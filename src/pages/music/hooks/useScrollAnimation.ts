import { useState, useEffect, useRef } from 'react';

interface UseScrollAnimationOptions {
  threshold?: number;
  delay?: number;
  animationType?: 'fadeIn' | 'slideUp' | 'slideLeft' | 'slideRight' | 'scale' | 'rotate';
  duration?: number;
  once?: boolean;
}

export const useScrollAnimation = (options: UseScrollAnimationOptions = {}) => {
  const {
    threshold = 0.1,
    delay = 0,
    animationType = 'fadeIn',
    duration = 800,
    once = true
  } = options;

  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && (!once || !hasAnimated)) {
          setTimeout(() => {
            setIsVisible(true);
            if (once) {
              setHasAnimated(true);
            }
          }, delay);
        } else if (!once && !entry.isIntersecting) {
          setIsVisible(false);
        }
      },
      { threshold }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [delay, threshold, once, hasAnimated]);

  const getAnimationClasses = () => {
    const baseClasses = `transition-all ease-out duration-${duration}`;
    
    if (!isVisible) {
      switch (animationType) {
        case 'slideUp':
          return `${baseClasses} opacity-0 translate-y-8 scale-95`;
        case 'slideLeft':
          return `${baseClasses} opacity-0 translate-x-8 scale-95`;
        case 'slideRight':
          return `${baseClasses} opacity-0 -translate-x-8 scale-95`;
        case 'scale':
          return `${baseClasses} opacity-0 scale-90`;
        case 'rotate':
          return `${baseClasses} opacity-0 rotate-3 scale-90`;
        default:
          return `${baseClasses} opacity-0 scale-95`;
      }
    }

    return `${baseClasses} opacity-100 translate-y-0 translate-x-0 scale-100 rotate-0`;
  };

  return {
    elementRef,
    isVisible,
    animationClasses: getAnimationClasses(),
  };
};

// Hook for staggered animations (for lists/grids)
export const useStaggeredAnimation = (itemCount: number, baseDelay: number = 100) => {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Trigger staggered animations
          for (let i = 0; i < itemCount; i++) {
            setTimeout(() => {
              setVisibleItems(prev => new Set([...prev, i]));
            }, i * baseDelay);
          }
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [itemCount, baseDelay]);

  const getItemClasses = (index: number) => {
    const isVisible = visibleItems.has(index);
    return `transition-all duration-700 ease-out ${
      isVisible 
        ? 'opacity-100 translate-y-0 scale-100' 
        : 'opacity-0 translate-y-8 scale-95'
    }`;
  };

  return {
    containerRef,
    getItemClasses,
    visibleItems,
  };
};