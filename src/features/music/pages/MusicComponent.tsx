import React, { useState } from "react";
import LikedSongs from "../components/LikedSongs";
import MoodSection from "../components/MoodSection";
import PlaylistView from "../components/PlaylistView";
import TrackRow from "../components/TrackRow";
import { useLanguage } from "../../../contexts/LanguageContext"; // Adjust path as needed

// Define the Track interface
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

const MusicComponent: React.FC = () => {
  const { translate } = useLanguage(); // Hook for translation
  const [selectedMood, setSelectedMood] = React.useState<string | null>(null);
  const [showLikedSongs, setShowLikedSongs] = React.useState(false);
  const [likedSongs, setLikedSongs] = useState<Track[]>([
    {
      id: "1",
      title: "Spectre in the Leaves",
      artist: "DonVavei",
      duration: "2:09",
      bpm: 92,
      image:
        "https://images.pexels.com/photos/1547813/pexels-photo-1547813.jpeg",
      genres: ["Boom Bap"],
      moods: ["happy"],
    },
    {
      id: "9",
      title: "Dreaming of You",
      artist: "Luna Wave",
      duration: "3:15",
      bpm: 85,
      image:
        "https://images.pexels.com/photos/1834407/pexels-photo-1834407.jpeg",
      genres: ["Ambient"],
      moods: ["dreamy"],
    },
  ]);

  // Function to toggle a song's liked status
  const toggleLikedSong = (track: Track) => {
    setLikedSongs((prevLikedSongs) => {
      const isAlreadyLiked = prevLikedSongs.some(
        (song) => song.id === track.id
      );

      if (isAlreadyLiked) {
        // Remove from liked songs
        return prevLikedSongs.filter((song) => song.id !== track.id);
      } else {
        // Add to liked songs
        return [...prevLikedSongs, track];
      }
    });
  };

  console.log("[MusicComponent] Liked songs:", likedSongs);

  return (
    <div className="w-full h-full flex">
      <div className="bg-[#242B3D] rounded-lg p-8 flex-1 overflow-y-auto">
        zzzs
        {showLikedSongs ? (
          <LikedSongs
            onBack={() => setShowLikedSongs(false)}
            likedTracks={likedSongs}
            toggleLikedSong={toggleLikedSong}
          />
        ) : selectedMood ? (
          <PlaylistView
            mood={selectedMood}
            onBack={() => setSelectedMood(null)}
            likedSongs={likedSongs}
            toggleLikedSong={toggleLikedSong}
          />
        ) : (
          <>
            <div className="mb-12">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  {translate("music.likedSongs")}
                </h2>
                <button
                  onClick={() => setShowLikedSongs(true)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {translate("music.viewAllLikedSongs")}
                </button>
              </div>
              <div className="grid grid-cols-1 gap-1">
                {likedSongs.slice(0, 2).map((track) => (
                  <TrackRow
                    key={track.id}
                    track={track}
                    isLiked={true}
                    onLikeToggle={() => toggleLikedSong(track)}
                  />
                ))}
              </div>
            </div>
            <MoodSection onMoodSelect={setSelectedMood} />
          </>
        )}
      </div>
    </div>
  );
};

export default MusicComponent;
