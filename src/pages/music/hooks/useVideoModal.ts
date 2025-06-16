import { useState } from 'react';

export const useVideoModal = () => {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const openVideoModal = () => {
    setIsVideoModalOpen(true);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
  };

  const closeVideoModal = () => {
    setIsVideoModalOpen(false);
    // Restore body scroll when modal is closed
    document.body.style.overflow = 'unset';
  };

  return {
    isVideoModalOpen,
    openVideoModal,
    closeVideoModal,
  };
};