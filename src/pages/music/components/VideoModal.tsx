import React from 'react';
import { X } from 'lucide-react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
}

const VideoModal: React.FC<VideoModalProps> = ({ isOpen, onClose, videoUrl }) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-4xl mx-4 bg-slate-900 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-red-500/90 hover:bg-red-500 text-white p-2 rounded-full transition-all duration-200 backdrop-blur-sm shadow-lg"
          aria-label="Close video"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Video container */}
        <div className="relative aspect-video">
          <video
            src={videoUrl}
            controls
            autoPlay
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error('Video failed to load:', e);
            }}
          >
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Video info */}
        <div className="p-6 bg-slate-800/95 backdrop-blur-sm border-t border-slate-700/50">
          <h3 className="text-xl font-bold text-white mb-2">
            How MediaTiger Helps Creators Earn More
          </h3>
          <p className="text-slate-300">
            Watch how creators are earning an extra $5K-$20K+ per month from their YouTube Shorts utilizing MediaTiger.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VideoModal;