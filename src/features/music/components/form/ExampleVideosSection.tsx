import React from 'react';

interface ExampleVideosSectionProps {
  videos: string[];
  onAddVideo: () => void;
  onUpdateVideo: (index: number, value: string) => void;
  onRemoveVideo?: (index: number) => void;
}

export const ExampleVideosSection: React.FC<ExampleVideosSectionProps> = ({
  videos,
  onAddVideo,
  onUpdateVideo,
  onRemoveVideo
}) => {
  return (
    <div>
      <label className="block text-white mb-4">Example Videos (Optional)</label>
      <div className="space-y-4">
        {videos.map((video, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="text"
              value={video}
              onChange={(e) => onUpdateVideo(index, e.target.value)}
              placeholder="Enter video URL"
              className="flex-1 px-6 py-4 bg-slate-800 text-white rounded-xl border border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-200 placeholder-slate-400"
            />
            {onRemoveVideo && videos.length > 0 && (
              <button
                onClick={() => onRemoveVideo(index)}
                className="px-4 py-4 bg-red-600/20 text-red-400 rounded-xl hover:bg-red-600/30 transition-all duration-200"
              >
                ×
              </button>
            )}
          </div>
        ))}
        <button 
          onClick={onAddVideo}
          className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 bg-slate-800 text-white hover:bg-slate-700 border border-slate-700/50"
        >
          <span className="text-lg">+</span> Add Example Video
        </button>
      </div>
    </div>
  );
};