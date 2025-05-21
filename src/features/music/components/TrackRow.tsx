import { Download, Heart, Play } from "lucide-react";
import React from "react";

interface TrackProps {
  track: {
    id: string;
    title: string;
    artist: string;
    duration: string;
    bpm: number;
    image: string;
    genres: string[];
    moods: string[];
  };
  isLiked: boolean;
  onLikeToggle: () => void;
}

const TrackRow: React.FC<TrackProps> = ({ track, isLiked, onLikeToggle }) => {
  return (
    <div className="group flex items-center justify-between p-2 rounded hover:bg-[#2A324A] transition-all duration-200 ease-in-out">
      <div className="flex items-center space-x-4 flex-1">
        <button
          className="opacity-0 group-hover:opacity-100 transition-all duration-200 w-6 h-6 flex items-center justify-center"
          aria-label="Play track"
        >
          <Play size={14} className="text-white" />
        </button>
        <img
          src={track.image}
          alt={track.title}
          className="w-10 h-10 rounded object-cover"
        />
        <div className="min-w-0">
          <h3 className="font-medium truncate text-sm">{track.title}</h3>
          <p className="text-sm text-gray-400">{track.artist}</p>
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <button
            className={`p-1 ${
              isLiked ? "text-red-500" : "text-gray-400 hover:text-red-500"
            } hover:scale-110 transition-all duration-200 relative group/like`}
            aria-label={isLiked ? "Unlike track" : "Like track"}
            onClick={onLikeToggle}
          >
            <Heart size={14} className={isLiked ? "fill-red-500" : ""} />
            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-xs text-white px-2 py-1 rounded opacity-0 group-hover/like:opacity-100 transition-opacity whitespace-nowrap">
              {isLiked ? "Unlike track" : "Like track"}
            </span>
          </button>
          {/* <button
            className="p-1 text-gray-400 hover:text-white transition-colors"
            aria-label="Add to playlist"
          >
            <Plus size={14} />
          </button> */}
          <button
            className="p-1 text-gray-400 hover:text-white hover:scale-110 transition-all duration-200 relative group/download"
            aria-label="Download track"
          >
            <Download size={14} />
            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-xs text-white px-2 py-1 rounded opacity-0 group-hover/download:opacity-100 transition-opacity whitespace-nowrap">
              Download
            </span>
          </button>
          {/* <button
            className="p-1 text-gray-400 hover:text-white transition-colors"
            aria-label="Copy link"
          >
            <Link2 size={14} />
          </button> */}
        </div>

        <div className="flex items-center space-x-4 ml-4">
          <div className="flex space-x-2">
            {track.genres.map((genre) => (
              <span
                key={genre}
                className="px-2 py-0.5 text-xs text-gray-300 bg-[#374151] rounded"
              >
                {genre}
              </span>
            ))}
          </div>
          <div className="w-24 text-right">
            <span className="text-xs text-gray-400">{track.bpm} BPM</span>
          </div>
          <div className="w-12 text-right">
            <span className="text-xs text-gray-400">{track.duration}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackRow;
