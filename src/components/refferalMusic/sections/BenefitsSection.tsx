import React, { useEffect, useRef } from 'react';
import { CheckCircle } from 'lucide-react';

const BenefitsSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
          }
        });
      },
      { threshold: 0.1 }
    );
    
    const elements = sectionRef.current?.querySelectorAll('.animate-on-scroll');
    elements?.forEach(el => observer.observe(el));
    
    return () => {
      elements?.forEach(el => observer.unobserve(el));
    };
  }, []);

  return (
    <section id="benefits" ref={sectionRef} className="py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-on-scroll opacity-0 transition-opacity duration-1000 delay-400">
            <div className="neubrutalist-card">
              <h3 className="text-2xl font-black uppercase mb-4 text-center">
                <span className="bg-yellow-400">Why Creators Love MediaTiger</span>
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <CheckCircle size={16} className="text-black" />
                  </div>
                  <p className="font-bold">Immediate increase in revenue with zero extra work</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <CheckCircle size={20} className="text-black" />
                  </div>
                  <p className="font-bold">Access to exclusive, high-quality music library</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <CheckCircle size={20} className="text-black" />
                  </div>
                  <p className="font-bold">Detailed analytics dashboard to track earnings</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <CheckCircle size={20} className="text-black" />
                  </div>
                  <p className="font-bold">Seamless integration with existing content workflow</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <CheckCircle size={20} className="text-black" />
                  </div>
                  <p className="font-bold">Custom music creation available on request</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <CheckCircle size={20} className="text-black" />
                  </div>
                  <p className="font-bold">Expert support team available for all partners</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;