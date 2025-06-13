import { MusicItem } from '../../../utils/data';
import React from 'react';

interface FavoritesListProps {
  items: MusicItem[];
}

export const FavoritesList: React.FC<FavoritesListProps> = ({ items }) => {
  const favorites = items.filter((item) => item.favorite);

  return (
    <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-8 max-h-[400px] animate-section">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">Favorites</h2>
        <span className="text-sm text-slate-400">You can save up to 15 favorite music.</span>
      </div>
      <div id="favoritesList" className="space-y-3 overflow-y-auto max-h-[300px] pr-2">
        {favorites.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <p>No favorites yet</p>
            <p className="text-sm mt-2">Click the star icon to add tracks to your favorites</p>
          </div>
        ) : (
          favorites.map((item) => (
            <div key={item.id} className="flex items-center gap-4 p-3 hover:bg-slate-700/30 rounded-lg transition-colors">
              <img src={item.cover} alt={item.title} className="w-12 h-12 rounded-lg object-cover" />
              <div className="flex-1">
                <h3 className="text-white text-sm font-medium truncate">{item.title}</h3>
                <div className="flex gap-2 mt-1.5">
                  {item.category.map((tag) => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-slate-400 first:bg-white/10">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};