import { useEffect, useRef } from 'react';

export const useIntersectionObserver = (options = { threshold: 0.1, triggerOnce: true }) => {
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-slide-in');
          if (options.triggerOnce) {
            observer.unobserve(entry.target);
          }
        }
      });
    }, options);

    const element = elementRef.current;
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [options.threshold, options.triggerOnce]);

  return elementRef;
};