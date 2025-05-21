/**
 * Sets the document title with optional suffix
 * @param title The main title of the document
 * @param suffix The optional suffix to append to the title
 */
export const setDocumentTitle = (title: string, suffix = "| MediaTiger") => {
  document.title = `${title} ${suffix}`;
};
