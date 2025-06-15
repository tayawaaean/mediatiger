import { musicData, MusicItem } from "../../../utils/data";
import React, { useEffect, useState, useRef } from "react";
import { CustomTrackRequest } from "../components/CustomTrackRequest";
import { FavoritesList } from "../components/FavoritesList";
import { MusicList } from "../components/MusicList";
import { NoResults } from "../components/NoResults";
import { MusicPlayer } from "../components/MusicPlayer";
import { animatePageLoad } from "../utils/musicAnimations";
import { SearchBar } from "../components/SearchBar";
import "../../../styles/music.css";

const MusicComponent = () => {
  const [sortBy, setSortBy] = useState("recent");
  const [selectedMood, setSelectedMood] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredMusic, setFilteredMusic] = useState<MusicItem[]>(musicData);
  const [nowPlaying, setNowPlaying] = useState<MusicItem | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedFavorites = localStorage.getItem("favorites");
    if (savedFavorites) {
      const favoriteIds = new Set(JSON.parse(savedFavorites));
      const updatedMusic = musicData.map((item) => ({
        ...item,
        favorite: favoriteIds.has(item.id),
        category: favoriteIds.has(item.id)
          ? [...item.category, "favorited"]
          : item.category.filter((cat) => cat !== "favorited"),
      }));
      setFilteredMusic(updatedMusic);
    } else {
      setFilteredMusic(musicData);
    }
    animatePageLoad();
    filterMusicByCategory();
  }, []);

  useEffect(() => {
    filterMusicByCategory();
  }, [sortBy, searchTerm]);

  const filterMusicByCategory = () => {
    let filtered = [...filteredMusic];

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.artist && item.artist.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    } else {
      filtered = [...musicData].map((item) => ({
        ...item,
        favorite: filtered.find((f) => f.id === item.id)?.favorite || false,
        category: filtered.find((f) => f.id === item.id)?.category || item.category,
      }));
    }

    if (sortBy === "recent") {
      filtered.sort((a, b) => b.id.localeCompare(a.id));
    }

    setFilteredMusic(filtered);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    filterMusicByCategory();
  };

  const handleApplyMood = () => {
    let filtered = [...filteredMusic];
    if (selectedMood) {
      filtered = filtered.filter((item) =>
        item.category.some((cat) => cat.toLowerCase() === selectedMood.toLowerCase())
      );
    } else if (sortBy === "recent") {
      filtered.sort((a, b) => b.id.localeCompare(a.id));
    }
    setFilteredMusic(filtered);
  };

  const handlePlay = (item: MusicItem) => {
    setNowPlaying(item);
  };

  const handleFavorite = (id: string, isFavorite: boolean) => {
    const updatedMusic = filteredMusic.map((item) =>
      item.id === id ? { ...item, favorite: isFavorite } : item
    );
    setFilteredMusic(updatedMusic);
    const favoriteIds = updatedMusic.filter((item) => item.favorite).map((item) => item.id);
    localStorage.setItem("favorites", JSON.stringify(favoriteIds));
  };

  const handleCopyISRC = (id: string) => {
    const item = filteredMusic.find((m) => m.id === id);
    if (item) navigator.clipboard.writeText(item.id);
  };

  const renderContent = () => {
    if (searchTerm && filteredMusic.length === 0) {
      return <NoResults searchTerm={searchTerm} />;
    }
    return (
      <MusicList
        items={filteredMusic}
        onPlay={handlePlay}
        onFavorite={handleFavorite}
        onCopyISRC={handleCopyISRC}
      />
    );
  };

  return (
    <div className="bg-slate-900 text-white pb-24 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 header" id="main-content">
        <h1 className="text-3xl font-bold text-white mb-8">Background Music List</h1>

        <div className="grid grid-cols-7 gap-6">
          <div ref={contentRef} className="col-span-4 bg-slate-800/50 rounded-2xl border border-slate-700/50 p-8 min-h-[600px] main-content">
            <div className="flex justify-between items-center mb-6 search-container">
              <div className="flex gap-4 w-full">
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-white/5 text-slate-300 pl-4 pr-10 py-2 rounded-full border border-slate-700/50 cursor-pointer hover:bg-white/10 transition-colors"
                  >
                    <option value="recent">Sort by Recent</option>
                    <option value="mood">Sort by Mood</option>
                  </select>
                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                    <svg
                      className="w-4 h-4 text-slate-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                </div>

                {sortBy === "mood" && (
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <select
                        value={selectedMood}
                        onChange={(e) => setSelectedMood(e.target.value)}
                        className="appearance-none bg-white/5 text-slate-300 pl-4 pr-10 py-2 rounded-full border border-slate-700/50 cursor-pointer hover:bg-white/10 transition-colors"
                      >
                        <option value="">Select Mood</option>
                        <option value="cheerful">Cheerful</option>
                        <option value="horror">Horror</option>
                        <option value="lovely">Lovely</option>
                        <option value="groovy">Groovy</option>
                        <option value="tense">Tense</option>
                        <option value="dramatic">Dramatic</option>
                        <option value="romantic">Romantic</option>
                        <option value="dreamy">Dreamy</option>
                        <option value="scary">Scary</option>
                        <option value="bright">Bright</option>
                        <option value="determined">Determined</option>
                        <option value="sad">Sad</option>
                        <option value="exciting">Exciting</option>
                        <option value="mysterious">Mysterious</option>
                        <option value="wistful">Wistful</option>
                        <option value="epic">Epic</option>
                        <option value="relaxing">Relaxing</option>
                        <option value="entertaining">Entertaining</option>
                        <option value="refreshing">Refreshing</option>
                      </select>
                    </div>
                    <button
                      onClick={handleApplyMood}
                      className="ml-2 px-4 py-1 rounded-full bg-purple-600 text-white text-sm hover:bg-purple-700 transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                )}

                <SearchBar
                  searchTerm={searchTerm}
                  onSearch={handleSearch}
                />
              </div>
            </div>

            {renderContent()}
          </div>

          <div className="col-span-3 space-y-6">
            <FavoritesList items={filteredMusic.filter((item) => item.favorite)} />
            <CustomTrackRequest />
          </div>
        </div>
      </div>
     <MusicPlayer
        currentTrack={nowPlaying}
        onFavoriteToggle={handleFavorite}
      />
    </div>
  );
};

export default MusicComponent;