import React, { useEffect } from "react";
import { X, Download, ZoomIn, ZoomOut } from "lucide-react";

interface ImagePreviewProps {
  previewImage: string | null;
  setPreviewImage: (url: string | null) => void;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({ previewImage, setPreviewImage }) => {
  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && previewImage) {
        setPreviewImage(null);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewImage, setPreviewImage]);
  
  if (!previewImage) return null;
  
  // Handle image download
  const handleDownload = () => {
    // Open image in a new tab/window
    const newWindow = window.open('about:blank', '_blank');
    if (newWindow) {
      newWindow.location.href = previewImage || '';
      newWindow.focus();
    } else {
      // Fallback if popup is blocked
      alert('Please allow popups for this website to open the image in a new window.');
    }
  };
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={() => setPreviewImage(null)}
    >
      <div 
        className="relative max-w-[80vw] max-h-[80vh] rounded-lg shadow-2xl transition-opacity duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 right-0 flex gap-2 p-3 bg-gradient-to-b from-black/50 to-transparent rounded-tr-lg">
          <button
            onClick={handleDownload}
            className="p-1.5 bg-slate-800/80 rounded-full text-white hover:bg-indigo-600 transition-colors"
            title="Download"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            onClick={() => setPreviewImage(null)}
            className="p-1.5 bg-slate-800/80 rounded-full text-white hover:bg-red-600 transition-colors"
            title="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <img
          src={previewImage}
          alt="Preview"
          className="max-w-full max-h-[80vh] object-contain rounded-lg"
          style={{ maxWidth: "500px" }}
        />
      </div>
    </div>
  );
};
