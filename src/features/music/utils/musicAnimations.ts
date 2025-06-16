export const animatePageLoad = () => {
  // Add animation classes to elements
  const header = document.querySelector('.header');
  const navigation = document.querySelector('.navigation');
  const searchContainer = document.querySelector('.search-container');
  const mainContent = document.querySelector('.main-content');
  
  if (header) header.classList.add('animate-fade-in');
  
  setTimeout(() => {
    if (navigation) navigation.classList.add('animate-fade-in');
  }, 100);
  
  setTimeout(() => {
    if (searchContainer) searchContainer.classList.add('animate-fade-in');
  }, 200);
  
  setTimeout(() => {
    if (mainContent) {
      mainContent.classList.add('animate-fade-in');
      
      // Add staggered animation to music items
      const musicItems = document.querySelectorAll('.music-item');
      musicItems.forEach((item, index) => {
        setTimeout(() => {
          item.classList.add('animate-scale-in');
        }, 300 + (index * 50));
      });
    }
  }, 300);
};

export const animateItemClick = (element: HTMLElement) => {
  element.style.transition = 'transform 0.3s ease';
  element.style.transform = 'scale(1.02)';
  
  setTimeout(() => {
    element.style.transform = 'scale(1)';
  }, 300);
};


