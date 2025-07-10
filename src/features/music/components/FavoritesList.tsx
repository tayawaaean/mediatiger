import React from 'react';
import { MusicItem } from '../../../utils/data';

interface FavoritesListProps {
  items: MusicItem[];
  favoriteLoading: boolean;
  onPlay: (item: MusicItem) => void;
}

export const FavoritesList: React.FC<FavoritesListProps> = ({
  items,
  favoriteLoading,
  onPlay,
}) => {
  const favorites = items.filter((item) => item.favorite).slice(0, 15);

  const renderContent = () => {
    if (favoriteLoading) {
      return (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      );
    }

    return (
      <div
        id="favoritesList"
        className="space-y-2 md:space-y-3 overflow-y-auto max-h-[300px] md:max-h-[400px] pr-1 md:pr-2"
      >
        {favorites.length === 0 ? (
          <div className="text-center py-6 md:py-8 text-slate-400">
            <p className="text-sm md:text-base">No favorites yet</p>
            <p className="text-xs md:text-sm mt-2">
              Click the star icon to add tracks to your favorites
            </p>
          </div>
        ) : (
          favorites.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 md:gap-4 p-2 md:p-3 hover:bg-slate-700/30 rounded-lg transition-colors"
              onClick={() => onPlay(item)}
            >
              <img
                src={item.cover}
                alt={item.title}
                className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-white text-sm md:text-base font-medium truncate">
                  {item.title}
                </h3>
                {item.artist && (
                  <p className="text-slate-400 text-xs md:text-sm truncate">
                    {item.artist}
                  </p>
                )}
                <div className="flex flex-wrap gap-1 md:gap-2 mt-1 max-h-8 md:max-h-10 overflow-hidden">
                  {item.category.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 rounded-full bg-white/5 text-slate-400 first:bg-white/10 truncate max-w-[80px] md:max-w-[120px]"
                    >
                      {tag}
                    </span>
                  ))}
                  {item.category.length > 2 && (
                    <span className="text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 rounded-full bg-white/5 text-slate-400">
                      +{item.category.length - 2}
                    </span>
                  )}
                </div>
                {item.duration && (
                  <p className="text-slate-400 text-xs md:text-sm mt-1">
                    {item.duration}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  return (
    <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-4 md:p-6 lg:p-8 animate-section">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 md:mb-6 gap-2">
        <h2 className="text-lg md:text-xl font-semibold text-white">
          Favorites
        </h2>

        <span className="text-xs md:text-sm text-slate-400">
          Save up to 15 songs ({favorites.length}/15)
        </span>
      </div>
      {renderContent()}
    </div>
  );
};

export default FavoritesList;
