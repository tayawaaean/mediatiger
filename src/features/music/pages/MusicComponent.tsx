import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { CustomTrackRequest } from '../components/CustomTrackRequest';
import { FavoritesList } from '../components/FavoritesList';
import { MusicList } from '../components/MusicList';
import { NoResults } from '../components/NoResults';
import { MusicPlayer } from '../components/MusicPlayer';
import { animatePageLoad } from '../utils/musicAnimations';
import { SearchBar } from '../components/SearchBar';
import { MusicItem } from '../../../utils/data';
import '../../../styles/music.css';

interface MusicResponse {
  success: boolean;
  tracks: MusicItem[];
  hasMore: boolean;
  error?: string;
}

const MusicComponent = () => {
  const [sortBy, setSortBy] = useState<'recent' | 'mood'>('recent');
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [allMusic, setAllMusic] = useState<MusicItem[]>([]);
  const [filteredMusic, setFilteredMusic] = useState<MusicItem[]>([]);
  const [searchResults, setSearchResults] = useState<MusicItem[]>([]);
  const [displayedItems, setDisplayedItems] = useState<number>(15);
  const [nowPlaying, setNowPlaying] = useState<MusicItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const contentRef = useRef<HTMLDivElement>(null);
  const musicListRef = useRef<HTMLDivElement>(null);

  const API_URL_MUSIC_LIST = import.meta.env.VITE_MUSIC_API_URL || '/api/music';

  const fetchMusicData = async (newPage = 1, append = false) => {
    setLoading(true);
    try {
      const response = await axios.post<MusicResponse>(API_URL_MUSIC_LIST, {
        page: newPage,
        size: 15,
      });

      if (response.data.success) {
        const tracks = response.data.tracks;
        setAllMusic((prev) => {
          const newAllMusic = append ? [...prev, ...tracks] : tracks;
          return newAllMusic;
        });
        setHasMore(response.data.hasMore);

        if (append && musicListRef.current) {
          setTimeout(() => {
            const scrollHeight = document.body.scrollHeight;
            window.scrollTo({ top: scrollHeight, behavior: 'smooth' });
          }, 200);
        }
      } else {
        setError(`Failed to fetch music tracks: ${response.data.error || 'Unknown error'}`);
      }
    } catch (err) {
      setError('Failed to fetch music from backend');
      if (axios.isAxiosError(err)) {
        switch (err.response?.status) {
          case 429:
            setError('Rate limit exceeded. Please try again later.');
            break;
          case 403:
            setError('Access denied. Contact support to check IP whitelisting.');
            break;
          default:
            setError('Network error. Check configuration or contact support.');
        }
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterMusic = () => {
    let filtered = [...allMusic];

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.artist && item.artist.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
      if (selectedMood) {
        filtered = filtered.filter((item) =>
          item.category.some((cat) => cat.toLowerCase() === selectedMood.toLowerCase())
        );
      }
      if (sortBy === 'recent') {
        filtered.sort((a, b) => a.id.localeCompare(b.id));
      }
      setFilteredMusic(filtered.length > 0 ? filtered : allMusic);
    }
  };

  useEffect(() => {
    fetchMusicData();
    animatePageLoad();
  }, []);

  useEffect(() => {
    filterMusic();
  }, [allMusic, searchTerm, sortBy, selectedMood]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleApplyMood = () => {
    filterMusic();
  };

  const handlePlay = (item: MusicItem) => {
    setNowPlaying(item);
  };

  const handleFavorite = (id: string, isFavorite: boolean) => {
    if (isFavorite) {
      const favoriteCount = allMusic.filter((item) => item.favorite).length;
      if (favoriteCount >= 15) {
        toast.error('You can only favorite up to 15 songs. Please unfavorite some songs to add new ones.');
        return;
      }
    }

    const updatedAllMusic = allMusic.map((item) =>
      item.id === id
        ? {
            ...item,
            favorite: isFavorite,
            category: isFavorite
              ? [...item.category, 'favorited']
              : item.category.filter((cat) => cat !== 'favorited'),
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
    setPage((prev) => prev + 1);
    setDisplayedItems((prev) => prev + 15);
    fetchMusicData(page + 1, true);
  };

  const renderContent = () => {
    if (loading && page === 1) {
      return <div className="text-center py-16 text-slate-400">Loading music tracks...</div>;
    }
    if (error) {
      return (
        <div className="text-center py-16 text-red-400">
          {error}
          {error.includes('network') && (
            <p className="text-sm mt-2">This may be due to configuration issues. Contact support.</p>
          )}
        </div>
      );
    }
    const itemsToDisplay = searchTerm ? searchResults : filteredMusic.slice(0, displayedItems);
    if (itemsToDisplay.length === 0) {
      return searchTerm ? (
        <NoResults searchTerm={searchTerm} />
      ) : (
        <div className="text-center py-16 text-slate-400">
          <p>No tracks found for this mood.</p>
          <p className="text-sm mt-2">Try a different mood or sort by recent.</p>
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
        {!searchTerm && hasMore && filteredMusic.length >= displayedItems && (
          <div className="text-center mt-8">
            <button
              onClick={handleSeeMore}
              className="px-6 py-2 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'See More'}
            </button>
          </div>
        )}
      </div>
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
                    onChange={(e) => setSortBy(e.target.value as 'recent' | 'mood')}
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

                {sortBy === 'mood' && (
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
                  </div>
                )}

                <SearchBar searchTerm={searchTerm} onSearch={handleSearch} />
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
        onUpdateDuration={handleUpdateDuration}
      />
    </div>
  );
};

export default MusicComponent;