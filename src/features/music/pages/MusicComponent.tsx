import { musicData, MusicItem } from "../../../utils/data";
import React, { useEffect, useState, useRef } from "react";
import { CustomTrackRequest } from "../components/CustomTrackRequest";
import { FavoritesList } from "../components/FavoritesList";
import { MusicList } from "../components/MusicList";
import { MusicNavigation } from "../components/MusicNavigation";
import { SearchBar } from "../components/SearchBar";
import { NoResults } from "../components/NoResults";
import { SectionHeader } from "../components/SectionHeader";
import { MusicPlayer } from "../components/MusicPlayer";
import { animatePageLoad, animateItemClick } from "../utils/musicAnimations";
import "../../../styles/music.css"; // Import your custom styles

const MusicComponent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState("home");
  const [sortBy, setSortBy] = useState("recent");
  const [selectedMood, setSelectedMood] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredMusic, setFilteredMusic] = useState(musicData);
  const [nowPlaying, setNowPlaying] = useState<MusicItem | null>(null);
  const componentMounted = useRef(false);
  const contentRef = useRef<HTMLDivElement>(null); // Handle tab changes
  const handleTabChange = (tabId: string) => {
    const content = contentRef.current;
    if (content) {
      // First, remove the animation class and add a class to fade out
      content.style.opacity = "0";
      content.style.transition = "opacity 0.15s ease-out";

      // After fade out, update content and fade back in
      setTimeout(() => {
        setCurrentTab(tabId);
        filterMusicByCategory(tabId);

        if (content) {
          // Add animation class after content update
          content.classList.add("animate-fade-in");
          content.style.removeProperty("opacity");
          content.style.removeProperty("transition");
        }
      }, 150);
    } else {
      setCurrentTab(tabId);
      filterMusicByCategory(tabId);
    }
  };

  // Filter music by category
  const filterMusicByCategory = (category: string) => {
    if (category === "home") {
      // For home tab, we'll keep the current filtering logic
      let filtered = [...musicData];

      if (searchTerm) {
        filtered = filtered.filter(
          (item) =>
            item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.artist.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      if (sortBy === "mood" && selectedMood) {
        filtered = filtered.filter((item) =>
          item.category.includes(selectedMood.toLowerCase())
        );
      }

      setFilteredMusic(filtered);
    } else {
      // For other tabs, filter by category
      const filtered = musicData.filter((item) =>
        item.category.includes(category.toLowerCase())
      );
      setFilteredMusic(filtered);
    }
  };

  // Cleanup animation classes when component unmounts
  useEffect(() => {
    return () => {
      const content = contentRef.current;
      if (content) {
        content.classList.remove("animate-fade-in");
        content.style.removeProperty("opacity");
        content.style.removeProperty("transition");
      }
    };
  }, []);

  // Initialize animations
  useEffect(() => {
    if (!componentMounted.current) {
      animatePageLoad();
      componentMounted.current = true;
    }
  }, []);

  useEffect(() => {
    if (currentTab === "home") {
      filterMusicByCategory("home");
    }
  }, [searchTerm, sortBy, selectedMood]);

  const handlePlay = (item: MusicItem) => {
    setNowPlaying(item);

    // Find and animate the clicked music item
    const musicItem = document.querySelector(`[data-id="${item.id}"]`);
    if (musicItem instanceof HTMLElement) {
      animateItemClick(musicItem);
    }
  };

  const handleFavorite = (id: number) => {
    const updatedMusic = musicData.map((item) => {
      if (item.id === id) {
        // Update categories
        const newCategories = [...item.category];
        if (!item.favorite) {
          newCategories.push("favorited");
        } else {
          const index = newCategories.indexOf("favorited");
          if (index > -1) {
            newCategories.splice(index, 1);
          }
        }

        // Animate favorite button
        const favoriteBtn = document.querySelector(
          `[data-favorite-id="${id}"]`
        );
        if (favoriteBtn instanceof HTMLElement) {
          animateItemClick(favoriteBtn);
        }

        return {
          ...item,
          favorite: !item.favorite,
          category: newCategories,
        };
      }
      return item;
    });

    // Update filtered music to reflect changes
    setFilteredMusic(updatedMusic);

    // If we're on the favorites tab, refilter
    if (currentTab === "favorited") {
      filterMusicByCategory("favorited");
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);

    if (term === "") {
      // If search is cleared, show default view for current tab
      filterMusicByCategory(currentTab);
    } else {
      // Filter music items by search term
      const filtered = musicData.filter(
        (item) =>
          item.title.toLowerCase().includes(term.toLowerCase()) ||
          item.artist.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredMusic(filtered);
    }
  };

  const renderContent = () => {
    if (searchTerm) {
      if (filteredMusic.length === 0) {
        return <NoResults searchTerm={searchTerm} />;
      }

      return (
        <>
          <div className="mb-6">
            <h2 className="text-lg text-slate-300">
              Search results for "{searchTerm}"
            </h2>
          </div>
          <MusicList
            items={filteredMusic}
            onPlay={handlePlay}
            onFavorite={handleFavorite}
            onCopyISRC={handleCopyISRC}
          />
        </>
      );
    }

    return currentTab === "home" ? (
      renderHomeContent()
    ) : (
      <MusicList
        items={filteredMusic}
        onPlay={handlePlay}
        onFavorite={handleFavorite}
        onCopyISRC={handleCopyISRC}
      />
    );
  };

  const renderHomeContent = () => {
    const featuredTracks = filteredMusic
      .filter((item) => item.favorite)
      .slice(0, 4);
    const newTracks = filteredMusic
      .filter((item) => item.category.includes("new"))
      .slice(0, 4);
    const moodTracks = filteredMusic
      .filter((item) => item.category.includes("mood"))
      .slice(0, 4);

    return (
      <>
        {featuredTracks.length > 0 && (
          <>
            <SectionHeader title="Featured Tracks" />
            <MusicList
              items={featuredTracks}
              onPlay={handlePlay}
              onFavorite={handleFavorite}
              onCopyISRC={handleCopyISRC}
            />
          </>
        )}

        {newTracks.length > 0 && (
          <>
            <SectionHeader title="New Releases" />
            <MusicList
              items={newTracks}
              onPlay={handlePlay}
              onFavorite={handleFavorite}
              onCopyISRC={handleCopyISRC}
            />
          </>
        )}

        {moodTracks.length > 0 && (
          <>
            <SectionHeader title="Mood Collection" />
            <MusicList
              items={moodTracks}
              onPlay={handlePlay}
              onFavorite={handleFavorite}
              onCopyISRC={handleCopyISRC}
            />
          </>
        )}
      </>
    );
  };

  const handleCopyISRC = (id: number) => {
    const item = musicData.find((m) => m.id === id);
    if (item) {
      navigator.clipboard.writeText(item.id.toString());
      const copyButton = document.querySelector(`[data-copy-id="${id}"]`);
      if (copyButton instanceof HTMLElement) {
        animateItemClick(copyButton);
      }
    }
  };

  return (
    <div className="bg-slate-900 text-white pb-24">
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 header"
        id="main-content">
        <h1 className="text-3xl font-bold text-white mb-8">
          Background Music List
          {nowPlaying && (
            <span className="text-sm font-normal ml-4 text-emerald-400">
              Now Playing: {nowPlaying.title} - {nowPlaying.artist}
            </span>
          )}
        </h1>

        <MusicNavigation
          currentTab={currentTab}
          onTabChange={handleTabChange}
        />

        <div className="grid grid-cols-7 gap-6">
          {/* Left large section */}
          <div
            ref={contentRef}
            className="col-span-4 bg-slate-800/50 rounded-2xl border border-slate-700/50 p-8 min-h-[600px] main-content">
            <div className="flex justify-between items-center mb-6 search-container">
              <div className="flex gap-4 w-full">
                {currentTab === "home" && (
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none bg-white/5 text-slate-300 pl-4 pr-10 py-2 rounded-full border border-slate-700/50 cursor-pointer hover:bg-white/10 transition-colors"
                      aria-label="Sort tracks">
                      <option value="recent">Sort by Recent</option>
                      <option value="mood">Sort by Mood</option>
                    </select>
                  </div>
                )}

                {currentTab === "home" && sortBy === "mood" && (
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <select
                        value={selectedMood}
                        onChange={(e) => setSelectedMood(e.target.value)}
                        className="appearance-none bg-white/5 text-slate-300 pl-4 pr-10 py-2 rounded-full border border-slate-700/50 cursor-pointer hover:bg-white/10 transition-colors"
                        aria-label="Select mood">
                        <option value="">Select Mood</option>
                        <option value="chill">Chill</option>
                        <option value="energetic">Energetic</option>
                        <option value="focus">Focus</option>
                        <option value="upbeat">Upbeat</option>
                      </select>
                    </div>
                  </div>
                )}

                <SearchBar searchTerm={searchTerm} onSearch={handleSearch} />
              </div>
            </div>

            {renderContent()}
          </div>

          {/* Right sections */}
          <div className="col-span-3 space-y-6">
            <FavoritesList items={musicData} />
            <CustomTrackRequest />
          </div>
        </div>
      </div>
      <MusicPlayer currentTrack={nowPlaying} />
    </div>
  );
};

export default MusicComponent;
