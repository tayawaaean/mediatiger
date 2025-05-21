import { ArrowLeft, Download, Heart } from "lucide-react";
import React from "react";
import TrackRow from "./TrackRow";

interface PlaylistViewProps {
  mood: string;
  onBack: () => void;
  likedSongs: Track[];
  toggleLikedSong: (track: Track) => void;
}

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

const tracks: Track[] = [
  {
    id: "1",
    title: "Spectre in the Leaves",
    artist: "DonVavei",
    duration: "2:09",
    bpm: 92,
    image: "https://images.pexels.com/photos/1547813/pexels-photo-1547813.jpeg",
    genres: ["Boom Bap"],
    moods: ["happy"],
  },
  {
    id: "4",
    title: "Come Out Tonight (I'm Ready)",
    artist: "Vicki Vox",
    duration: "2:30",
    bpm: 150,
    image: "https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg",
    genres: ["Pop"],
    moods: ["happy"],
  },
  {
    id: "5",
    title: "Strawberry Acai (In My Cup)",
    artist: "I'MIN",
    duration: "3:06",
    bpm: 129,
    image: "https://images.pexels.com/photos/1793037/pexels-photo-1793037.jpeg",
    genres: ["K-pop"],
    moods: ["happy"],
  },
  {
    id: "6",
    title: "Short Circuit",
    artist: "Ryan James Carr",
    duration: "2:38",
    bpm: 110,
    image: "https://images.pexels.com/photos/1010519/pexels-photo-1010519.jpeg",
    genres: ["Synth Funk"],
    moods: ["happy", "quirky"],
  },
  {
    id: "7",
    title: "Applecart Upset",
    artist: "Harry Edvino",
    duration: "2:43",
    bpm: 192,
    image: "https://images.pexels.com/photos/1774389/pexels-photo-1774389.jpeg",
    genres: ["Jazz", "Swing"],
    moods: ["happy"],
  },
  {
    id: "8",
    title: "All Night Dance",
    artist: "PØW",
    duration: "2:13",
    bpm: 120,
    image: "https://images.pexels.com/photos/2111015/pexels-photo-2111015.jpeg",
    genres: ["EDM", "K-pop"],
    moods: ["happy"],
  },
  {
    id: "9",
    title: "Dreaming of You",
    artist: "Luna Wave",
    duration: "3:15",
    bpm: 85,
    image: "https://images.pexels.com/photos/1834407/pexels-photo-1834407.jpeg",
    genres: ["Ambient"],
    moods: ["dreamy"],
  },
  {
    id: "10",
    title: "Epic Journey",
    artist: "Thunder Strike",
    duration: "4:20",
    bpm: 140,
    image: "https://images.pexels.com/photos/1647972/pexels-photo-1647972.jpeg",
    genres: ["Orchestral"],
    moods: ["epic"],
  },
  {
    id: "11",
    title: "Sunset Vibes",
    artist: "Chill Master",
    duration: "3:45",
    bpm: 95,
    image: "https://images.pexels.com/photos/1834633/pexels-photo-1834633.jpeg",
    genres: ["Lo-fi"],
    moods: ["laid-back"],
  },
  {
    id: "12",
    title: "Cloud Nine",
    artist: "Sky High",
    duration: "3:30",
    bpm: 128,
    image: "https://images.pexels.com/photos/1834403/pexels-photo-1834403.jpeg",
    genres: ["Trance"],
    moods: ["euphoric"],
  },
];

const PlaylistView: React.FC<PlaylistViewProps> = ({
  mood,
  onBack,
  likedSongs,
  toggleLikedSong,
}) => {
  const filteredTracks = tracks.filter((track) => track.moods.includes(mood));

  // Check if a track is liked
  const isTrackLiked = (trackId: string) => {
    return likedSongs.some((song) => song.id === trackId);
  };

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
          <h2 className="text-2xl font-bold capitalize">{mood} Playlist</h2>
        </div>
        <button className="flex items-center space-x-4">
          <Heart
            size={20}
            className="text-gray-400 hover:text-white transition-colors"
          />
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
        </button>
      </div>

      <div className="space-y-1">
        {filteredTracks.map((track) => (
          <TrackRow
            key={track.id}
            track={track}
            isLiked={isTrackLiked(track.id)}
            onLikeToggle={() => toggleLikedSong(track)}
          />
        ))}
      </div>
    </div>
  );
};

export default PlaylistView;
