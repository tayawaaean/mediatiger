export const initSectionAnimations = () => {
  const sections = document.querySelectorAll('.animate-section');
  let observer: IntersectionObserver;
  
  // Initial animation for visible sections
  sections.forEach(section => {
    if (isElementInViewport(section)) {
      section.classList.add('active');
    }
  });
  
  // Animate sections on scroll with improved handling
  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        
        // Add staggered delay to children with proper cleanup
        const children = entry.target.children;
        Array.from(children).forEach((child, index) => {
          const element = child as HTMLElement;
          element.style.transitionDelay = `${index * 0.1}s`;
          // Remove transition delay after animation completes
          setTimeout(() => {
            element.style.transitionDelay = '';
          }, (index * 100) + 1000); // Add 1s buffer after the stagger
        });
        
        // Unobserve after animation to prevent interference
        observer.unobserve(entry.target);
      }
    });
  }, { 
    threshold: 0.1,
    // Add rootMargin to start animation slightly before element comes into view
    rootMargin: '50px'
  });
  
  sections.forEach(section => observer.observe(section));

  // Cleanup function to prevent memory leaks
  return () => {
    sections.forEach(section => {
      observer.unobserve(section);
      section.classList.remove('active');
      Array.from(section.children).forEach((child) => {
        (child as HTMLElement).style.transitionDelay = '';
      });
    });
    observer.disconnect();
  };
};

const isElementInViewport = (el: Element) => {
  const rect = el.getBoundingClientRect();
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;
  const windowWidth = window.innerWidth || document.documentElement.clientWidth;
  
  // Add a small buffer for top detection to prevent sticking
  return (
    rect.top >= -50 && // Allow elements to be slightly above viewport
    rect.left >= 0 &&
    rect.bottom <= windowHeight + 50 && // Allow elements to be slightly below viewport
    rect.right <= windowWidth
  );
};