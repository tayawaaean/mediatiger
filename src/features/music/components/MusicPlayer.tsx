import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MusicItem } from '../../../utils/data';

interface MusicPlayerProps {
  currentTrack: MusicItem | null;
  onFavoriteToggle?: (id: string, isFavorite: boolean) => void;
  onUpdateDuration?: (id: string, duration: string) => void;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = React.memo(
  ({ currentTrack, onFavoriteToggle, onUpdateDuration }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentProgress, setCurrentProgress] = useState(0);
    const [isFavorite, setIsFavorite] = useState(false);
    const [totalDuration, setTotalDuration] = useState(0);
    const audioRef = useRef<HTMLAudioElement>(null);
    const lastTrackId = useRef<string | null>(null);

    const formatTime = (seconds: number) => {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.floor(seconds % 60);
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const parseDuration = (durationStr: string): number => {
      const [minutes, seconds] = durationStr.split(':').map(Number);
      return (minutes || 0) * 60 + (seconds || 0);
    };

    const togglePlayState = useCallback(() => {
      if (audioRef.current) {
        if (isPlaying) {
          audioRef.current.pause();
          setIsPlaying(false);
        } else {
          audioRef.current.play().catch((err) => {
            console.error('Playback error:', err);
            setIsPlaying(false);
          });
          setIsPlaying(true);
        }
      }
    }, [isPlaying]);

    const handleProgressBarClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
      if (!audioRef.current) return;
      const progressBar = e.currentTarget;
      const clickPosition = e.nativeEvent.offsetX;
      const progressBarWidth = progressBar.clientWidth;
      const progressPercentage = (clickPosition / progressBarWidth) * 100;
      const newTime = (progressPercentage / 100) * audioRef.current.duration;
      audioRef.current.currentTime = newTime;
      setCurrentProgress(progressPercentage);
      if (!isPlaying) {
        audioRef.current.play().catch((err) => console.error('Playback error:', err));
        setIsPlaying(true);
      }
    }, [isPlaying]);

    useEffect(() => {
      if (!currentTrack || !audioRef.current) return;

      if (currentTrack.id !== lastTrackId.current) {
        audioRef.current.src = currentTrack.music || '';
        audioRef.current.load();
        setCurrentProgress(0);
        setIsPlaying(false);
        setTotalDuration(parseDuration(currentTrack.duration));
        lastTrackId.current = currentTrack.id;
        setIsFavorite(currentTrack.favorite);

        setTimeout(() => {
          audioRef.current?.play().then(() => {
            setIsPlaying(true);
          }).catch((err) => {
            console.error('Auto-play error:', err);
            setIsPlaying(false);
          });
        }, 100);
      }
    }, [currentTrack]);

    useEffect(() => {
      const audio = audioRef.current;
      if (!audio) return;

      const updateProgress = () => {
        const progress = (audio.currentTime / audio.duration) * 100 || 0;
        setCurrentProgress(progress);
      };

      const handleEnded = () => {
        setIsPlaying(false);
        setCurrentProgress(0);
      };

      const handleLoadedMetadata = () => {
        if (currentTrack && onUpdateDuration && audio.duration && !isNaN(audio.duration)) {
          setTimeout(() => {
            const duration = formatTime(audio.duration);
            setTotalDuration(audio.duration);
            onUpdateDuration(currentTrack.id, duration);
          }, 100);
        }
      };

      audio.addEventListener('timeupdate', updateProgress);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);

      return () => {
        audio.removeEventListener('timeupdate', updateProgress);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
    }, [currentTrack, onUpdateDuration]);

    const currentTime = Math.floor((currentProgress / 100) * totalDuration);

    const handleFavoriteToggle = useCallback(() => {
      if (currentTrack && onFavoriteToggle) {
        const newFavorite = !isFavorite;
        setIsFavorite(newFavorite);
        onFavoriteToggle(currentTrack.id, newFavorite);
      }
    }, [currentTrack, isFavorite, onFavoriteToggle]);

    return (
      <div
        className={`fixed bottom-0 left-0 right-0 bg-slate-800/95 backdrop-blur-lg border-t border-slate-700/50 transition-transform duration-300 ${
          currentTrack ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <audio ref={audioRef} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {currentTrack && (
                <>
                  <img
                    src={currentTrack.cover}
                    alt={currentTrack.title}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="text-left">
                    <h3 className="text-white text-sm font-medium">{currentTrack.title}</h3>
                    <div className="flex gap-2 mt-1.5">
                      {currentTrack.category.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-slate-400 first:bg-white/10"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center gap-4">
              <button
                className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                onClick={handleFavoriteToggle}
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill={isFavorite ? 'currentColor' : 'none'}
                  stroke={isFavorite ? 'white' : 'currentColor'}
                  strokeWidth="2"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </button>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400">{formatTime(currentTime)}</span>
                <div
                  className="w-96 h-1 bg-slate-700 rounded-full overflow-hidden cursor-pointer"
                  onClick={handleProgressBarClick}
                >
                  <div
                    className="h-full bg-white/90 transition-all duration-100"
                    style={{ width: `${currentProgress}%` }}
                  />
                </div>
                <span className="text-sm text-slate-400">{formatTime(totalDuration)}</span>
              </div>
              <button
                className="p-2 rounded-full bg-white/90 hover:bg-white transition-colors"
                onClick={togglePlayState}
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <svg className="w-6 h-6 text-black" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-black" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => prevProps.currentTrack?.id === nextProps.currentTrack?.id
);