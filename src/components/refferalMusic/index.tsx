import React, { useEffect } from 'react';
import HeroSection from './sections/HeroSection';
import IntroSection from './sections/IntroSection';
import HowItWorksSection from './sections/HowItWorksSection';
import BenefitsSection from './sections/BenefitsSection';
import PaymentSection from './sections/PaymentSection';
import UniqueSellingSection from './sections/UniqueSellingSection';
import Footer from './common/Footer';
import "../../music.css"
import { useIntersectionObserver } from "../../hooks/useIntersectionObserver"

const MusicReferal = () => {
  useEffect(() => {
    const elements = document.querySelectorAll('.fade-in-element');
    const childElements = document.querySelectorAll('.fade-in-child');
    const staggerContainers = document.querySelectorAll('.stagger-animation');
    
    elements.forEach((el, index) => {
      setTimeout(() => {
        el.classList.add('fade-in');
      }, index * 200);
    });

    childElements.forEach((el, index) => {
      setTimeout(() => {
        el.classList.add('fade-in');
      }, 300 + (index * 100));
    });

    staggerContainers.forEach((container) => {
      setTimeout(() => {
        container.classList.add('animate');
      }, 500);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  const heroRef = useIntersectionObserver();
  const introRef = useIntersectionObserver();
  const howItWorksRef = useIntersectionObserver();
  const benefitsRef = useIntersectionObserver();
  const paymentRef = useIntersectionObserver();
  const uniqueRef = useIntersectionObserver();
  const footerRef = useIntersectionObserver();

  return (
    <div className="min-h-screen text-black body-music">
      <div ref={heroRef} className="fade-in-element"><HeroSection /></div>
      <div ref={introRef} className="fade-in-element"><IntroSection /></div>
      <div ref={howItWorksRef} className="fade-in-element"><HowItWorksSection /></div>
      <div ref={benefitsRef} className="fade-in-element"><BenefitsSection /></div>
      <div ref={paymentRef} className="fade-in-element"><PaymentSection /></div>
      <div ref={uniqueRef} className="fade-in-element"><UniqueSellingSection /></div>
      <div ref={footerRef} className="fade-in-element"><Footer /></div>
    </div>
  );
};

export default MusicReferal;