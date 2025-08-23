import React, { useEffect, useState, useRef, useCallback } from "react";
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
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../contexts/AuthContext";
import "../../../styles/music.css";

interface MusicResponse {
  success: boolean;
  tracks: MusicItem[];
  hasMore: boolean;
  error?: string;
  totalAvailable?: number;
  searchInfo?: {
    totalFound: number;
    searchComplete: boolean;
    totalAvailable?: number;
    searchedThrough?: number;
  };
  moodInfo?: {
    totalFound: number;
    searchComplete: boolean;
    totalAvailable?: number;
    searchedThrough?: number;
  };
}

const MusicComponent = () => {
  const { user } = useAuth();
  const [sortBy, setSortBy] = useState<"recent" | "mood">("recent");
  const [selectedMood, setSelectedMood] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [allMusic, setAllMusic] = useState<MusicItem[]>([]);
  const [filteredMusic, setFilteredMusic] = useState<MusicItem[]>([]);
  const [searchResults, setSearchResults] = useState<MusicItem[]>([]);
  const [displayedItems, setDisplayedItems] = useState<number>(50);
  const [nowPlaying, setNowPlaying] = useState<MusicItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isSearchMode, setIsSearchMode] = useState<boolean>(false);
  const [searchStatus, setSearchStatus] = useState<string>("");
  const [searchPage, setSearchPage] = useState<number>(1);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [rateLimited, setRateLimited] = useState<boolean>(false);
  const [isMoodFilterMode, setIsMoodFilterMode] = useState<boolean>(false);
  const [moodPage, setMoodPage] = useState<number>(1);
  const [userFavorites, setUserFavorites] = useState<Set<string>>(new Set());
  const [loadingFavorites, setLoadingFavorites] = useState<boolean>(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const musicListRef = useRef<HTMLDivElement>(null);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreTriggerRef = useRef<HTMLDivElement>(null);
  const lastRequestTimeRef = useRef<number>(0);
  const requestQueueRef = useRef<boolean>(false);
  const isRequestingRef = useRef<boolean>(false);

  const API_URL_MUSIC_LIST = import.meta.env.VITE_MUSIC_API_URL || "/api/music";
  const MIN_REQUEST_INTERVAL = 1000; // Minimum 1 second between requests

  // Load user favorites from Supabase
  useEffect(() => {
    const loadFavorites = async () => {
      if (!user) {
        setUserFavorites(new Set());
        setLoadingFavorites(false);
        return;
      }

      setLoadingFavorites(true);
      try {
        const { data, error } = await supabase
          .from('user_favorites')
          .select('track_id')
          .eq('user_id', user.id);

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading favorites:', error);
        } else if (data) {
          const favoriteIds = data.map(item => item.track_id);
          setUserFavorites(new Set(favoriteIds));
        }
      } catch (err) {
        console.error('Error loading favorites:', err);
      } finally {
        setLoadingFavorites(false);
      }
    };

    loadFavorites();
  }, [user]);

  const fetchMusicData = useCallback(async (newPage = 1, append = false, search = "", mood = "") => {
    // Prevent multiple simultaneous requests
    if (isRequestingRef.current && append) {
      console.log('Request already in progress, skipping');
      return;
    }
    
    // Rate limiting check
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTimeRef.current;
    
    if (append && timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      // Queue the request for later
      requestQueueRef.current = true;
      setRateLimited(true);
      setTimeout(() => {
        if (requestQueueRef.current && !isRequestingRef.current) {
          requestQueueRef.current = false;
          setRateLimited(false);
          fetchMusicData(newPage, append, search);
        }
      }, MIN_REQUEST_INTERVAL - timeSinceLastRequest);
      return;
    }
    
    // Cancel any queued requests
    requestQueueRef.current = false;
    lastRequestTimeRef.current = now;
    isRequestingRef.current = true;
    if (append) {
      // Don't set loadingMore here as it's already set in handleSeeMore
      if (!loadingMore) {
        setLoadingMore(true);
      }
    } else {
      setLoading(true);
    }
    try {
      const requestData: any = {
        page: newPage,
        size: 50,
      };
      
      // Add search parameter if provided
      if (search) {
        requestData.search = search;
      }
      
      // Add mood parameter if provided
      if (mood) {
        requestData.mood = mood;
      }
      
      const response = await axios.post<MusicResponse>(API_URL_MUSIC_LIST, requestData);

      if (response.data.success) {
        const tracks = response.data.tracks;
        
        // Handle search info if present
        if (response.data.searchInfo) {
          const { totalFound, searchComplete, totalAvailable } = response.data.searchInfo;
          if (newPage === 1) {
            setSearchStatus(`Found ${totalFound} results`);
          }
        }
        
        // Handle mood info if present
        if (response.data.moodInfo) {
          const { totalFound, searchComplete } = response.data.moodInfo;
          if (newPage === 1) {
            setSearchStatus(`Found ${totalFound} tracks for this mood`);
          }
        }
        
        setAllMusic((prev) => {
          const newAllMusic = append ? [...prev, ...tracks] : tracks;
          return newAllMusic;
        });
        setHasMore(response.data.hasMore);
        
        // Debug logging
        if (response.data.totalAvailable) {
          console.log(`Page ${newPage}: Total items loaded: ${append ? allMusic.length + tracks.length : tracks.length} / ${response.data.totalAvailable}`);
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
      setLoadingMore(false);
      setRateLimited(false);
      isRequestingRef.current = false;
    }
  }, [userFavorites]);

  const filterMusic = () => {
    // When in search mode or mood filter mode, use server results directly
    if (isSearchMode || selectedMood) {
      setFilteredMusic(allMusic);
      return;
    }
    
    const filtered = [...allMusic];
    
    if (sortBy === "recent") {
      filtered.sort((a, b) => a.id.localeCompare(b.id));
    }
    setFilteredMusic(filtered);
  };

  useEffect(() => {
    fetchMusicData();
    animatePageLoad();
  }, []);


  useEffect(() => {
    filterMusic();
  }, [allMusic, sortBy, selectedMood, isSearchMode, isMoodFilterMode]);

  const handleSeeMore = useCallback(() => {
    console.log('handleSeeMore called', { loadingMore, hasMore, isSearchMode, isMoodFilterMode, searchPage, moodPage, page });
    if (loadingMore || !hasMore) {
      console.log('handleSeeMore early return', { loadingMore, hasMore });
      return;
    }
    
    // Show loading state immediately
    setLoadingMore(true);
    
    // Add deliberate delay before making the API call
    setTimeout(() => {
      if (isSearchMode) {
        const nextPage = searchPage + 1;
        setSearchPage(nextPage);
        fetchMusicData(nextPage, true, searchTerm, selectedMood);
      } else if (isMoodFilterMode) {
        const nextPage = moodPage + 1;
        setMoodPage(nextPage);
        fetchMusicData(nextPage, true, "", selectedMood);
      } else {
        const nextPage = page + 1;
        setPage(nextPage);
        setDisplayedItems((prev) => prev + 50);
        fetchMusicData(nextPage, true);
      }
    }, 1000); // 1 second delay
  }, [isSearchMode, isMoodFilterMode, searchPage, moodPage, page, searchTerm, selectedMood, hasMore, loadingMore, fetchMusicData]);

  // Infinite scroll effect
  useEffect(() => {
    console.log('Infinite scroll effect running', { hasMore, loading, loadingMore });
    
    const setupObserver = () => {
      if (!hasMore || loading || loadingMore) {
        console.log('Early return from infinite scroll', { hasMore, loading, loadingMore });
        return;
      }

      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      observerRef.current = new IntersectionObserver(
        (entries) => {
          console.log('Intersection observed', entries[0].isIntersecting);
          if (entries[0].isIntersecting && hasMore && !loading && !loadingMore && !isRequestingRef.current) {
            console.log('Triggering handleSeeMore');
            handleSeeMore();
            // Disconnect immediately after triggering to prevent multiple calls
            if (observerRef.current && loadMoreTriggerRef.current) {
              observerRef.current.unobserve(loadMoreTriggerRef.current);
            }
          }
        },
        {
          root: null,
          rootMargin: '50px', // Reduced from 100px to trigger closer to bottom
          threshold: 0.1
        }
      );

      if (loadMoreTriggerRef.current) {
        console.log('Observing trigger element', loadMoreTriggerRef.current);
        observerRef.current.observe(loadMoreTriggerRef.current);
      } else {
        console.log('Trigger element not found!');
        // Try again in a moment
        setTimeout(setupObserver, 100);
      }
    };

    setupObserver();

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loading, loadingMore, handleSeeMore]);

  // Re-observe the trigger element after loading completes
  useEffect(() => {
    if (!loadingMore && !loading && hasMore && observerRef.current && loadMoreTriggerRef.current) {
      console.log('Re-observing trigger element after load');
      observerRef.current.observe(loadMoreTriggerRef.current);
    }
  }, [loadingMore, loading, hasMore]);

  // Handle search input changes with debouncing
  useEffect(() => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }
    
    if (searchTerm.length >= 2) {
      // Start search mode
      setIsSearchMode(true);
      setIsMoodFilterMode(false);
      setSearchPage(1);
      setPage(1);
      setAllMusic([]);
      setSearchStatus("Searching...");
      
      searchDebounceRef.current = setTimeout(() => {
        fetchMusicData(1, false, searchTerm, selectedMood);
      }, 500); // Debounce for 500ms
    } else if (searchTerm.length === 0 && isSearchMode) {
      // Exit search mode
      setIsSearchMode(false);
      setSearchStatus("");
      setPage(1);
      
      // If mood is selected, fetch with mood filter
      if (selectedMood) {
        setIsMoodFilterMode(true);
        fetchMusicData(1, false, "", selectedMood);
      } else {
        fetchMusicData(1, false);
      }
    }
    
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [searchTerm, selectedMood]);

  // Handle mood selection changes
  useEffect(() => {
    if (selectedMood && !searchTerm) {
      // Start mood filter mode
      setIsMoodFilterMode(true);
      setIsSearchMode(false);
      setMoodPage(1);
      setPage(1);
      setAllMusic([]);
      setSearchStatus("Filtering by mood...");
      fetchMusicData(1, false, "", selectedMood);
    } else if (!selectedMood && isMoodFilterMode) {
      // Exit mood filter mode
      setIsMoodFilterMode(false);
      setSearchStatus("");
      setPage(1);
      fetchMusicData(1, false);
    }
  }, [selectedMood]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handlePlay = (item: MusicItem) => {
    setNowPlaying(item);
  };

  const handleFavorite = async (id: string) => {
    if (!user) {
      toast.error('Please sign in to save favorites');
      return;
    }

    try {
      // Use the toggle_favorite function
      const { data, error } = await supabase
        .rpc('toggle_favorite', { p_track_id: id });

      if (error) {
        console.error('Error toggling favorite:', error);
        toast.error('Failed to update favorite');
        return;
      }

      if (data?.success) {
        // Update local state
        setUserFavorites(prev => {
          const newFavorites = new Set(prev);
          if (data.is_favorite) {
            newFavorites.add(id);
          } else {
            newFavorites.delete(id);
          }
          return newFavorites;
        });

        // Show success message
        toast.success(data.is_favorite ? 'Added to favorites' : 'Removed from favorites');
      }
    } catch (err) {
      console.error('Error updating favorite:', err);
      toast.error('Failed to update favorite');
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

  const renderContent = () => {
    if (loading && ((isSearchMode && searchPage === 1) || (isMoodFilterMode && moodPage === 1) || (!isSearchMode && !isMoodFilterMode && page === 1))) {
      return (
        <div className="py-16 text-center text-slate-400">
          {isSearchMode ? `Searching for "${searchTerm}"...` : 
           isMoodFilterMode ? `Filtering by ${selectedMood} mood...` : 
           "Loading music tracks..."}
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
    
    // In search mode or mood filter mode, display all results; otherwise use filtered/paginated results
    const itemsToDisplay = ((isSearchMode || isMoodFilterMode) 
      ? allMusic 
      : filteredMusic.slice(0, displayedItems)).map(item => ({
        ...item,
        favorite: userFavorites.has(item.id)
      }));
      
    if (itemsToDisplay.length === 0) {
      if (isSearchMode) {
        return <NoResults searchTerm={searchTerm} />;
      } else if (isMoodFilterMode) {
        return (
          <div className="py-16 text-center text-slate-400">
            <p>No tracks found for "{selectedMood}" mood.</p>
            <p className="mt-2 text-sm">
              Try a different mood or clear the filter.
            </p>
          </div>
        );
      } else {
        return (
          <div className="py-16 text-center text-slate-400">
            <p>No tracks available.</p>
          </div>
        );
      }
    }
    return (
      <div ref={musicListRef}>
        <MusicList
          items={itemsToDisplay}
          onPlay={handlePlay}
          onFavorite={(id, _) => handleFavorite(id)}
          onCopyISRC={handleCopyISRC}
        />
        
        {/* Infinite scroll trigger */}
        {hasMore && (
          <div ref={loadMoreTriggerRef} className="h-10 mt-4" />
        )}
        
        {/* Loading indicator */}
        {(loadingMore || rateLimited) && (
          <div className="mt-8 text-center">
            <div className="inline-flex items-center px-4 py-2 text-sm text-slate-400">
              {rateLimited ? (
                <>
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  Rate limit reached - waiting to load more...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-3 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Loading more tracks...
                </>
              )}
            </div>
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
                    onChange={(e) => {
                      const newSortBy = e.target.value as "recent" | "mood";
                      setSortBy(newSortBy);
                      // Reset to initial state when switching to recent
                      if (newSortBy === "recent") {
                        setSelectedMood("");
                        setIsMoodFilterMode(false);
                        setSearchStatus("");
                        setPage(1);
                        setMoodPage(1);
                        // Fetch initial data
                        fetchMusicData(1, false);
                      }
                    }}
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
                {(isSearchMode || isMoodFilterMode) && searchStatus && allMusic.length > 0 && (
                  <p className="mt-6 text-sm text-center text-slate-400">
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
              items={allMusic.filter((item) => userFavorites.has(item.id)).map(item => ({ ...item, favorite: true }))}
              loading={loadingFavorites}
            />
            <CustomTrackRequest />
          </div>
        </div>
      </div>
      <MusicPlayer
        currentTrack={nowPlaying ? {...nowPlaying, favorite: userFavorites.has(nowPlaying.id)} : null}
        onFavoriteToggle={(id) => handleFavorite(id)}
        onUpdateDuration={handleUpdateDuration}
      />
    </div>
  );
};

export default MusicComponent;
