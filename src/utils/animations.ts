export const initSectionAnimations = () => {
  const sections = document.querySelectorAll('.animate-section');
  
  // Initial animation for visible sections
  sections.forEach(section => {
    if (isElementInViewport(section)) {
      section.classList.add('active');
    }
  });
  
  // Animate sections on scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        
        // Add staggered delay to children
        const children = entry.target.children;
        Array.from(children).forEach((child, index) => {
          (child as HTMLElement).style.transitionDelay = `${index * 0.1}s`;
        });
      }
    });
  }, { threshold: 0.1 });
  
  sections.forEach(section => observer.observe(section));
};

const isElementInViewport = (el: Element) => {
  const rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};