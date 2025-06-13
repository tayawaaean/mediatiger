import { MusicItem } from '../../../utils/data';
import React from 'react';

interface MusicListProps {
  items: MusicItem[];
  onPlay: (item: MusicItem) => void;
  onFavorite: (id: number) => void;
  onCopyISRC: (id: number) => void;
}

export const MusicList: React.FC<MusicListProps> = ({ items, onPlay, onFavorite, onCopyISRC }) => {
  return (
    <div className="mt-8">
      <div className="grid grid-cols-[80px_1fr_200px_100px] gap-4 px-4 py-2 text-slate-400 text-sm font-medium">
        <div>Cover</div>
        <div>Title</div>
        <div className="text-right pr-8">ISRC</div>
        <div className="flex justify-center">Music File</div>
      </div>
      <div className="space-y-2 mt-4" id="musicList">
        {items.map((item) => (
          <div
            key={item.id}
            className="grid grid-cols-[80px_1fr_200px_100px] gap-4 items-center px-4 py-3 hover:bg-slate-700/30 rounded-lg transition-colors cursor-pointer group"
            onClick={() => onPlay(item)}
          >
            <img src={item.cover} alt={item.title} className="w-12 h-12 rounded-lg object-cover" />
            <div>
              <h3 className="text-white text-sm font-medium truncate">{item.title}</h3>
              <div className="flex gap-2 mt-1.5">
                {item.category.map((tag) => (
                  <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-slate-400 first:bg-white/10">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div
              className="text-sm text-slate-400 font-mono tracking-wider text-right pr-8 cursor-pointer hover:text-white transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onCopyISRC(item.id);
              }}
              title="Click to copy"
            >
              {item.id}
            </div>
            <div className="flex gap-2 justify-center">
              <button
                className="favorite-btn p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onFavorite(item.id);
                }}
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill={item.favorite ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </button>
              <button
                className="download-btn p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                title="Download"
                onClick={(e) => e.stopPropagation()}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};