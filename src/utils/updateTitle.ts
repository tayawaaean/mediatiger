export const updatePageTitle = (title: string): void => {
  const titleElement = document.querySelector('title');
  if (titleElement) {
    titleElement.textContent = title;
  }
};