import { ArrowLeft, Download, Heart } from "lucide-react";
import React from "react";
import TrackRow from "./TrackRow";

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: string;
  bpm: number;
  image: string;
  genres: string[];
  moods: string[];
}

interface LikedSongsProps {
  onBack: () => void;
  likedTracks: Track[];
  toggleLikedSong: (track: Track) => void;
}

const LikedSongs: React.FC<LikedSongsProps> = ({
  onBack,
  likedTracks,
  toggleLikedSong,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 text-gray-400 hover:text-white hover:bg-[#374151] rounded-full transition-all duration-200"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-2xl font-bold">Liked Songs</h2>
        </div>
        <div className="flex items-center space-x-4">
          <Heart size={20} className="text-red-500" />
          {/* <Plus
            size={20}
            className="text-gray-400 hover:text-white transition-colors"
          /> */}
          <Download
            size={20}
            className="text-gray-400 hover:text-white transition-colors"
          />
          {/* <Link2
            size={20}
            className="text-gray-400 hover:text-white transition-colors"
          /> */}
        </div>
      </div>

      {likedTracks.length === 0 ? (
        <div className="text-center py-16">
          <Heart size={40} className="mx-auto mb-4 text-gray-500" />
          <p className="text-gray-400">No liked songs yet</p>
          <p className="text-sm text-gray-500 mt-2">
            Songs you like will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {likedTracks.map((track) => (
            <TrackRow
              key={track.id}
              track={track}
              isLiked={true}
              onLikeToggle={() => toggleLikedSong(track)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default LikedSongs;
