import React, { useEffect, useRef, useState } from 'react';
import { MusicItem } from '../../../utils/data';
import { Play, Pause } from 'lucide-react';

interface MusicPlayerProps {
  currentTrack: MusicItem | null;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({ currentTrack }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const totalDuration = 225; // 3:45 in seconds

  const togglePlayState = () => {
    setIsPlaying(prev => !prev);
  };

  const startProgressSimulation = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    progressIntervalRef.current = setInterval(() => {
      setCurrentProgress(prev => {
        const newProgress = prev + 0.5;
        
        if (newProgress >= 100) {
          // Reset when reached 100%
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
          }
          setIsPlaying(false);
          return 0;
        }
        
        return newProgress;
      });
    }, 100);
  };

  const stopProgressSimulation = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const progressBar = e.currentTarget;
    const clickPosition = e.nativeEvent.offsetX;
    const progressBarWidth = progressBar.clientWidth;
    const progressPercentage = (clickPosition / progressBarWidth) * 100;
    
    setCurrentProgress(progressPercentage);
    
    if (!isPlaying) {
      setIsPlaying(true);
    }
  };

  // Format time in mm:ss
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Handle play state changes
  useEffect(() => {
    if (isPlaying) {
      startProgressSimulation();
    } else {
      stopProgressSimulation();
    }

    return () => {
      stopProgressSimulation();
    };
  }, [isPlaying]);

  // Reset progress when track changes
  useEffect(() => {
    setCurrentProgress(0);
    setIsPlaying(false);
  }, [currentTrack]);

  const currentTime = Math.floor((currentProgress / 100) * totalDuration);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-800/95 backdrop-blur-sm border-t border-slate-700/50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center gap-4">
          {/* Album art and track info */}
          <div className="flex items-center gap-4 flex-1">
            {currentTrack && (
              <>
                <div className="w-12 h-12 rounded-lg overflow-hidden">
                  <img 
                    src={currentTrack.cover} 
                    alt={currentTrack.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white">{currentTrack.title}</h3>
                  <p className="text-xs text-slate-400">{currentTrack.artist}</p>
                </div>
              </>
            )}
          </div>

          {/* Player controls */}
          <div className="flex flex-col items-center gap-2 flex-1">
            {/* Play button */}
            <button
              className={`play-button w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white transition-transform hover:scale-105 ${isPlaying ? 'playing animate-pulse' : ''}`}
              onClick={togglePlayState}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-1" />
              )}
            </button>

            {/* Progress bar */}
            <div className="w-full flex items-center gap-2 text-xs text-slate-400">
              <span className="current-time">{formatTime(currentTime)}</span>
              <div 
                className="progress-bar flex-1 h-1 bg-white/10 rounded-full cursor-pointer"
                onClick={handleProgressBarClick}
              >                <div 
                  className="music-player-progress"
                  style={{ '--progress-width': `${currentProgress}%` } as React.CSSProperties}
                />
              </div>
              <span className="duration">{formatTime(totalDuration)}</span>
            </div>
          </div>

          {/* Volume control (placeholder for future implementation) */}          <div className="flex-1"></div>
        </div>
      </div>
    </div>
  );
};
