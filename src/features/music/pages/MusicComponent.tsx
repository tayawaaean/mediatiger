import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { CustomTrackRequest } from "../components/CustomTrackRequest";
import { FavoritesList } from "../components/FavoritesList";
import { MusicList } from "../components/MusicList";
import { NoResults } from "../components/NoResults";
import { MusicPlayer } from "../components/MusicPlayer";
import { animatePageLoad } from "../utils/musicAnimations";
import { SearchBar } from "../components/SearchBar";
import { MusicItem } from "../../../utils/data";
import "../../../styles/music.css";

interface MusicResponse {
  success: boolean;
  tracks: MusicItem[];
  hasMore: boolean;
  error?: string;
  searchInfo?: {
    totalFound: number;
    searchComplete: boolean;
    totalAvailable?: number;
    searchedThrough?: number;
  };
}

const MusicComponent = () => {
  const [sortBy, setSortBy] = useState<"recent" | "mood">("recent");
  const [selectedMood, setSelectedMood] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [allMusic, setAllMusic] = useState<MusicItem[]>([]);
  const [filteredMusic, setFilteredMusic] = useState<MusicItem[]>([]);
  const [searchResults, setSearchResults] = useState<MusicItem[]>([]);
  const [displayedItems, setDisplayedItems] = useState<number>(15);
  const [nowPlaying, setNowPlaying] = useState<MusicItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isSearchMode, setIsSearchMode] = useState<boolean>(false);
  const [searchStatus, setSearchStatus] = useState<string>("");
  const [searchPage, setSearchPage] = useState<number>(1);
  const contentRef = useRef<HTMLDivElement>(null);
  const musicListRef = useRef<HTMLDivElement>(null);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  const API_URL_MUSIC_LIST = import.meta.env.VITE_MUSIC_API_URL || "/api/music";

  const fetchMusicData = async (newPage = 1, append = false, search = "") => {
    setLoading(true);
    try {
      const requestData: any = {
        page: newPage,
        size: 15,
      };
      
      // Add search parameter if provided
      if (search) {
        requestData.search = search;
      }
      
      const response = await axios.post<MusicResponse>(API_URL_MUSIC_LIST, requestData);

      if (response.data.success) {
        const tracks = response.data.tracks;
        
        // Handle search info if present
        if (response.data.searchInfo) {
          const { totalFound, searchComplete, totalAvailable } = response.data.searchInfo;
          if (newPage === 1) {
            setSearchStatus(`Found ${totalFound} results`);
            if (!searchComplete) {
              toast.loading(`Searching... Found ${totalFound} results so far`, { id: 'search-progress' });
            } else {
              toast.success(`Search complete! Found ${totalFound} results`, { id: 'search-progress' });
            }
          }
        }
        
        setAllMusic((prev) => {
          const newAllMusic = append ? [...prev, ...tracks] : tracks;
          return newAllMusic;
        });
        setHasMore(response.data.hasMore);

        if (append && musicListRef.current) {
          setTimeout(() => {
            const scrollHeight = document.body.scrollHeight;
            window.scrollTo({ top: scrollHeight, behavior: "smooth" });
          }, 200);
        }
      } else {
        setError(
          `Failed to fetch music tracks: ${
            response.data.error || "Unknown error"
          }`
        );
      }
    } catch (err) {
      setError("Failed to fetch music from backend");
      if (axios.isAxiosError(err)) {
        switch (err.response?.status) {
          case 429:
            setError("Rate limit exceeded. Please try again later.");
            break;
          case 403:
            setError(
              "Access denied. Contact support to check IP whitelisting."
            );
            break;
          default:
            setError("Network error. Check configuration or contact support.");
        }
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterMusic = () => {
    // When in search mode, don't apply client-side filtering
    if (isSearchMode) {
      setFilteredMusic(allMusic);
      return;
    }
    
    let filtered = [...allMusic];
    
    if (selectedMood) {
      filtered = filtered.filter((item) =>
        item.category.some(
          (cat) => cat.toLowerCase() === selectedMood.toLowerCase()
        )
      );
    }
    if (sortBy === "recent") {
      filtered.sort((a, b) => a.id.localeCompare(b.id));
    }
    setFilteredMusic(filtered.length > 0 ? filtered : allMusic);
  };

  useEffect(() => {
    fetchMusicData();
    animatePageLoad();
  }, []);

  useEffect(() => {
    filterMusic();
  }, [allMusic, sortBy, selectedMood, isSearchMode]);

  // Handle search input changes with debouncing
  useEffect(() => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }
    
    if (searchTerm.length >= 2) {
      // Start search mode
      setIsSearchMode(true);
      setSearchPage(1);
      setPage(1);
      setAllMusic([]);
      setSearchStatus("Searching...");
      
      searchDebounceRef.current = setTimeout(() => {
        fetchMusicData(1, false, searchTerm);
      }, 500); // Debounce for 500ms
    } else if (searchTerm.length === 0 && isSearchMode) {
      // Exit search mode
      setIsSearchMode(false);
      setSearchStatus("");
      setPage(1);
      fetchMusicData(1, false);
    }
    
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [searchTerm]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handlePlay = (item: MusicItem) => {
    setNowPlaying(item);
  };

  const handleFavorite = (id: string, isFavorite: boolean) => {
    if (isFavorite) {
      const favoriteCount = allMusic.filter((item) => item.favorite).length;
      if (favoriteCount >= 15) {
        toast.error(
          "You can only favorite up to 15 songs. Please unfavorite some songs to add new ones."
        );
        return;
      }
    }

    const updatedAllMusic = allMusic.map((item) =>
      item.id === id
        ? {
            ...item,
            favorite: isFavorite,
            category: isFavorite
              ? [...item.category, "favorited"]
              : item.category.filter((cat) => cat !== "favorited"),
          }
        : item
    );
    setAllMusic(updatedAllMusic);
    if (nowPlaying?.id === id) {
      setNowPlaying({ ...nowPlaying, favorite: isFavorite });
    }
  };

  const handleCopyISRC = (id: string) => {
    const item = filteredMusic.find((m) => m.id === id);
    if (item) navigator.clipboard.writeText(item.id);
  };

  const handleUpdateDuration = (id: string, duration: string) => {
    setAllMusic((prev) =>
      prev.map((item) => (item.id === id ? { ...item, duration } : item))
    );
    if (nowPlaying?.id === id) {
      setNowPlaying((prev) => (prev ? { ...prev, duration } : null));
    }
  };

  const handleSeeMore = () => {
    if (isSearchMode) {
      const nextPage = searchPage + 1;
      setSearchPage(nextPage);
      fetchMusicData(nextPage, true, searchTerm);
    } else {
      setPage((prev) => prev + 1);
      setDisplayedItems((prev) => prev + 15);
      fetchMusicData(page + 1, true);
    }
  };

  const renderContent = () => {
    if (loading && ((isSearchMode && searchPage === 1) || (!isSearchMode && page === 1))) {
      return (
        <div className="py-16 text-center text-slate-400">
          {isSearchMode ? `Searching for "${searchTerm}"...` : "Loading music tracks..."}
        </div>
      );
    }
    if (error) {
      return (
        <div className="py-16 text-center text-red-400">
          {error}
          {error.includes("network") && (
            <p className="mt-2 text-sm">
              This may be due to configuration issues. Contact support.
            </p>
          )}
        </div>
      );
    }
    
    // In search mode, display all results; otherwise use filtered/paginated results
    const itemsToDisplay = isSearchMode 
      ? allMusic 
      : filteredMusic.slice(0, displayedItems);
      
    if (itemsToDisplay.length === 0) {
      return isSearchMode ? (
        <NoResults searchTerm={searchTerm} />
      ) : (
        <div className="py-16 text-center text-slate-400">
          <p>No tracks found for this mood.</p>
          <p className="mt-2 text-sm">
            Try a different mood or sort by recent.
          </p>
        </div>
      );
    }
    return (
      <div ref={musicListRef}>
        <MusicList
          items={itemsToDisplay}
          onPlay={handlePlay}
          onFavorite={handleFavorite}
          onCopyISRC={handleCopyISRC}
        />
        {/* Show See More button for both search and normal mode */}
        {hasMore && (
          <div className="mt-8 text-center">
            <button
              onClick={handleSeeMore}
              className="px-6 py-2 text-white transition-colors bg-purple-600 rounded-full hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Loading..." : "See More"}
            </button>
          </div>
        )}
        
        {/* Show search status */}
        {isSearchMode && searchStatus && (
          <div className="mt-4 text-center text-sm text-slate-400">
            {searchStatus}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className="pb-32 font-sans text-white bg-slate-900 md:pb-24"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <div
        className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8 md:py-8 header"
        id="main-content"
      >
        <h1 className="mb-6 text-2xl font-bold text-white md:text-3xl md:mb-8">
          Background Music List
        </h1>

        <div className="space-y-6 lg:grid lg:grid-cols-7 lg:gap-6 lg:space-y-0">
          {/* Main Content */}
          <div
            id="music-background-list"
            ref={contentRef}
            className="lg:col-span-4 bg-slate-800/50 rounded-2xl border border-slate-700/50 p-4 md:p-6 lg:p-8 min-h-[500px] md:min-h-[600px] main-content"
          >
            {/* Search and Filter Controls */}
            <div className="flex flex-col gap-4 mb-6 search-container">
              {/* Sort and Mood Selection Row - Disable during search */}
              <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                <div className="relative flex-shrink-0">
                  <select
                    value={sortBy}
                    onChange={(e) =>
                      setSortBy(e.target.value as "recent" | "mood")
                    }
                    disabled={isSearchMode}
                    className="appearance-none bg-white/5 text-slate-300 pl-4 pr-10 py-2 rounded-full border border-slate-700/50 cursor-pointer hover:bg-white/10 transition-colors w-full sm:w-auto min-w-[140px] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="recent">Sort by Recent</option>
                    <option value="mood">Sort by Mood</option>
                  </select>
                  <div className="absolute -translate-y-1/2 pointer-events-none right-3 top-1/2">
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
                  <div className="relative flex-1 sm:flex-initial">
                    <select
                      value={selectedMood}
                      onChange={(e) => setSelectedMood(e.target.value)}
                      disabled={isSearchMode}
                      className="appearance-none bg-white/5 text-slate-300 pl-4 pr-10 py-2 rounded-full border border-slate-700/50 cursor-pointer hover:bg-white/10 transition-colors w-full sm:w-auto min-w-[140px] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">Select Mood</option>
                      <option value="cheerful">Cheerful</option>
                      <option value="horror">Horror</option>
                      <option value="lovely">Lovely</option>
                      <option value="groovy">Groovy</option>
                      <option value="tense">Tense</option>
                      <option value="simple">Simple</option>
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
                      <option value="comic">Comic</option>
                      <option value="peaceful">Peaceful</option>
                      <option value="happy">Happy</option>
                      <option value="hopeful">Hopeful</option>
                    </select>
                    <div className="absolute -translate-y-1/2 pointer-events-none right-3 top-1/2">
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
                )}
              </div>

              {/* Search Bar Row */}
              <div className="w-full">
                <SearchBar searchTerm={searchTerm} onSearch={handleSearch} />
                {isSearchMode && searchStatus && (
                  <p className="mt-2 text-sm text-slate-400 text-center">
                    {searchStatus}
                  </p>
                )}
              </div>
            </div>

            {renderContent()}
          </div>

          {/* Sidebar */}
          <div className="space-y-6 lg:col-span-3">
            <FavoritesList
              items={allMusic.filter((item) => item.favorite)}
            />
            <CustomTrackRequest />
          </div>
        </div>
      </div>
      <MusicPlayer
        currentTrack={nowPlaying}
        onFavoriteToggle={handleFavorite}
        onUpdateDuration={handleUpdateDuration}
      />
    </div>
  );
};

export default MusicComponent;
