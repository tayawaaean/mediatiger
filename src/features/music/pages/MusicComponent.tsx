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
import "../../../styles/music.css";

const MusicComponent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState("home");
  const [sortBy, setSortBy] = useState("recent");
  const [selectedMood, setSelectedMood] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [musicItems, setMusicItems] = useState<MusicItem[]>(() => {
    const savedFavorites = localStorage.getItem("favoriteTracks");
    if (savedFavorites) {
      const favoriteIds = JSON.parse(savedFavorites) as number[];
      return musicData.map((item) => ({
        ...item,
        favorite: favoriteIds.includes(item.id),
        category: favoriteIds.includes(item.id)
          ? [...item.category, "favorited"].filter((v, i, a) => a.indexOf(v) === i)
          : item.category.filter((cat) => cat !== "favorited"),
      }));
    }
    return musicData;
  });
  const [nowPlaying, setNowPlaying] = useState<MusicItem | null>(null);
  const componentMounted = useRef(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // List of valid mood categories from the mood dropdown
  const validMoods = [
    "cheerful",
    "horror",
    "lovely",
    "groovy",
    "tense",
    "dramatic",
    "romantic",
    "dreamy",
    "scary",
    "bright",
    "determined",
    "sad",
    "exciting",
    "mysterious",
    "wistful",
    "epic",
    "relaxing",
    "entertaining",
    "refreshing",
  ];

  // Filter music based on current tab, search, and sort
  const filteredMusic = React.useMemo(() => {
    let filtered = [...musicItems];

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (validMoods.includes(searchTerm.toLowerCase()) &&
            item.category.includes(searchTerm.toLowerCase()))
      );
    } else if (currentTab === "home") {
      if (sortBy === "mood" && selectedMood) {
        filtered = filtered.filter((item) =>
          item.category.includes(selectedMood.toLowerCase())
        );
      }
    } else if (currentTab === "new") {
      filtered = filtered.filter((item) => item.category.includes("new"));
    } else if (currentTab === "favorited") {
      filtered = filtered.filter((item) => item.favorite);
    }

    return filtered;
  }, [musicItems, currentTab, searchTerm, sortBy, selectedMood]);

  // Handle tab change with animation
  const handleTabChange = (tabId: string) => {
    const content = contentRef.current;
    if (content) {
      content.style.opacity = "0";
      content.style.transition = "opacity 0.15s ease-out";
      setTimeout(() => {
        setCurrentTab(tabId);
        content.classList.add("animate-fade-in");
        content.style.removeProperty("opacity");
        content.style.removeProperty("transition");
      }, 150);
    } else {
      setCurrentTab(tabId);
    }
  };

  // Cleanup animation classes
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

  const handlePlay = (item: MusicItem) => {
    setNowPlaying(item);
    const musicItem = document.querySelector(`[data-id="${item.id}"]`);
    if (musicItem instanceof HTMLElement) {
      animateItemClick(musicItem);
    }
  };

  const handleFavorite = (id: number) => {
    const currentFavorites = musicItems.filter((item) => item.favorite).length;
    const itemIndex = musicItems.findIndex((item) => item.id === id);
    if (itemIndex === -1) return;

    const newFavorite = !musicItems[itemIndex].favorite;
    if (newFavorite && currentFavorites >= 15) {
      alert("You can only favorite up to 15 tracks.");
      return;
    }

    // Update music items
    setMusicItems((prev) => {
      const updated = [...prev];
      updated[itemIndex] = {
        ...updated[itemIndex],
        favorite: newFavorite,
        category: newFavorite
          ? [...updated[itemIndex].category, "favorited"].filter(
              (v, i, a) => a.indexOf(v) === i
            )
          : updated[itemIndex].category.filter((cat) => cat !== "favorited"),
      };
      return updated;
    });

    // Trigger animation after state update
    setTimeout(() => {
      const favoriteBtn = document.querySelector(`[data-favorite-id="${id}"]`);
      if (favoriteBtn instanceof HTMLElement) {
        animateItemClick(favoriteBtn);
      }
    }, 0);

    // Update localStorage
    const favoriteIds = musicItems
      .map((item, index) =>
        index === itemIndex ? { ...item, favorite: newFavorite } : item
      )
      .filter((item) => item.favorite)
      .map((item) => item.id);
    localStorage.setItem("favoriteTracks", JSON.stringify(favoriteIds));
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const renderContent = () => {
    if (searchTerm && filteredMusic.length === 0) {
      return <NoResults searchTerm={searchTerm} />;
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
    // Render only filteredMusic list for search or mood filter
    if (searchTerm || (sortBy === "mood" && selectedMood)) {
      return (
        <MusicList
          items={filteredMusic}
          onPlay={handlePlay}
          onFavorite={handleFavorite}
          onCopyISRC={handleCopyISRC}
        />
      );
    }

    // Render sections when no search or mood filter
    const featuredTracks = musicItems.filter((item) => item.favorite).slice(0, 4);
    const newTracks = musicItems.filter((item) => item.category.includes("new")).slice(0, 4);

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
        <SectionHeader title="All Tracks" />
        <MusicList
          items={filteredMusic}
          onPlay={handlePlay}
          onFavorite={handleFavorite}
          onCopyISRC={handleCopyISRC}
        />
      </>
    );
  };

  const handleCopyISRC = (id: number) => {
    const item = musicItems.find((m) => m.id === id);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 header" id="main-content">
        <h1 className="text-3xl font-bold text-white mb-8">
          Background Music List
          {nowPlaying && (
            <span className="text-sm font-normal ml-4 text-emerald-400">
              Now Playing: {nowPlaying.title} - {nowPlaying.artist}
            </span>
          )}
        </h1>

        <MusicNavigation currentTab={currentTab} onTabChange={handleTabChange} />

        <div className="grid grid-cols-7 gap-6">
          <div
            ref={contentRef}
            className="col-span-4 bg-slate-800/50 rounded-2xl border border-slate-700/50 p-8 min-h-[600px] main-content"
          >
            <div className="flex justify-between items-center mb-6 search-container">
              <div className="flex gap-4 w-full">
                {currentTab === "home" && (
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none bg-white/5 text-slate-300 pl-4 pr-10 py-2 rounded-full border border-slate-700/50 cursor-pointer hover:bg-white/10 transition-colors"
                      aria-label="Sort tracks"
                    >
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
                        aria-label="Select mood"
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
                  </div>
                )}
                <SearchBar searchTerm={searchTerm} onSearch={handleSearch} />
              </div>
            </div>
            {renderContent()}
          </div>
          <div className="col-span-3 space-y-6">
            <FavoritesList items={musicItems.filter((item) => item.favorite)} />
            <CustomTrackRequest />
          </div>
        </div>
      </div>
      <MusicPlayer currentTrack={nowPlaying} />
    </div>
  );
};

export default MusicComponent;