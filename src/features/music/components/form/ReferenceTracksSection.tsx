import React from 'react';

interface ReferenceTracksSectionProps {
  tracks: string[] | undefined;
  onAddTrack: () => void;
  onUpdateTrack: (index: number, value: string) => void;
  onRemoveTrack?: (index: number) => void;
}

export const ReferenceTracksSection: React.FC<ReferenceTracksSectionProps> = ({
  tracks = [],
  onAddTrack,
  onUpdateTrack,
  onRemoveTrack
}) => {
  return (
    <div>
      <label className="block text-white mb-4">Reference Track(s)</label>
      <div className="space-y-4">
        {(tracks || []).map((track, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="text"
              value={track || ''}
              onChange={(e) => onUpdateTrack(index, e.target.value)}
              placeholder="Enter URL"
              className="flex-1 px-6 py-4 bg-slate-800 text-white rounded-xl border border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-200 placeholder-slate-400"
            />
            {onRemoveTrack && tracks.length > 1 && (
              <button
                onClick={() => onRemoveTrack(index)}
                className="px-4 py-4 bg-red-600/20 text-red-400 rounded-xl hover:bg-red-600/30 transition-all duration-200"
              >
                ×
              </button>
            )}
          </div>
        ))}
        <button 
          onClick={onAddTrack}
          className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 bg-slate-800 text-white hover:bg-slate-700 border border-slate-700/50"
        >
          <span className="text-lg">+</span> Add Reference Track
        </button>
      </div>
    </div>
  );
};