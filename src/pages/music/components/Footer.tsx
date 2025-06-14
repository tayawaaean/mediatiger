import React from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const Footer: React.FC = () => {
  const { elementRef, animationClasses } = useScrollAnimation({
    animationType: 'slideUp',
    delay: 200,
    duration: 800
  });

  return (
    <footer ref={elementRef} className={`bg-slate-800 py-8 border-t border-slate-700 ${animationClasses}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-slate-300 font-medium">
          © MediaTiger 2025 All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;