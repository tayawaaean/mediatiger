import React from 'react';
import { X } from 'lucide-react';

interface ImagePreviewProps {
  src: string;
  onRemove: () => void;
  className?: string;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  src,
  onRemove,
  className = ''
}) => {
  return (
    <div className={`relative inline-block ${className}`}>
      <div className="relative group">
        <img 
          src={src} 
          alt="Upload preview" 
          className="max-h-32 rounded-lg border border-slate-600"
        />
        <button
          type="button"
          onClick={onRemove}
          className="absolute -top-2 -right-2 p-1 bg-slate-700 rounded-full text-slate-300 hover:text-white hover:bg-slate-600 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};