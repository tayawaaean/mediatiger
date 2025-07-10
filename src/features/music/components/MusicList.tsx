import { MusicItem } from "../../../utils/data";
import React from "react";
import FadeInUp from "../../../components/FadeInUp";

interface MusicListProps {
  items: MusicItem[];
  onPlay: (item: MusicItem) => void;
  onFavorite: (id: string, isFavorite: boolean) => void;
  onCopyISRC: (id: string) => void;
  favoritingIds: Set<string>;
}

export const MusicList: React.FC<MusicListProps> = ({
  items,
  onPlay,
  onFavorite,
  onCopyISRC,
  favoritingIds,
}) => {
  return (
    <div className="mt-6 md:mt-8">
      {/* Header - Hidden on very small screens, shown on larger mobile */}
      <div className="hidden xs:grid grid-cols-[50px_1fr_100px_70px] sm:grid-cols-[60px_1fr_120px_80px] md:grid-cols-[80px_1fr_200px_100px] gap-2 md:gap-4 px-2 md:px-4 py-2 text-slate-400 text-xs md:text-sm font-medium">
        <div>Cover</div>
        <div>Title</div>
        <div className="text-right pr-2 sm:pr-4 md:pr-8">ISRC</div>
        <div className="flex justify-center">Actions</div>
      </div>

      <div className="space-y-2 mt-2 md:mt-4" id="musicList">
        {items.map((item, index) => (
          <FadeInUp key={item.id} delay={index * 80}>
            <div
              className="grid grid-cols-[50px_1fr_auto] xs:grid-cols-[50px_1fr_100px_70px] sm:grid-cols-[60px_1fr_120px_80px] md:grid-cols-[80px_1fr_200px_100px] gap-2 md:gap-4 items-center px-2 md:px-4 py-3 hover:bg-slate-700/30 rounded-lg transition-colors cursor-pointer group"
              onClick={() => onPlay(item)}
            >
              {/* Cover Image */}
              <img
                src={item.cover}
                alt={item.title}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover"
              />

              {/* Title and Tags */}
              <div className="flex flex-col min-w-0">
                <h3 className="text-white text-sm md:text-base font-medium truncate">
                  {item.title}
                </h3>
                <div className="flex flex-wrap gap-1 md:gap-2 mt-1">
                  {item.category.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 rounded-full bg-white/5 text-slate-400 first:bg-white/10 whitespace-nowrap truncate max-w-[80px] md:max-w-[120px]"
                    >
                      {tag}
                    </span>
                  ))}
                  {item.category.length > 3 && (
                    <span className="text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 rounded-full bg-white/5 text-slate-400">
                      +{item.category.length - 3}
                    </span>
                  )}
                </div>
              </div>

              {/* ISRC - Hidden on smallest screens */}
              <button
                type="button"
                className="hidden xs:block text-[10px] md:text-sm text-slate-400 font-mono tracking-wider text-right pr-2 md:pr-8 cursor-pointer hover:text-white transition-colors bg-transparent border-none outline-none truncate max-w-[100px] md:max-w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  onCopyISRC(item.id);
                }}
                title="Click to copy ISRC"
                tabIndex={0}
              >
                {item.id}
              </button>

              {/* Actions */}
              <div className="flex gap-1 md:gap-2 justify-center">
                <button
                  className="favorite-btn p-1.5 md:p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors min-w-[32px] min-h-[32px] md:min-w-[36px] md:min-h-[36px] flex items-center justify-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    onFavorite(item.id, !item.favorite);
                  }}
                  disabled={favoritingIds.has(item.id)}
                  title={
                    item.favorite ? "Remove from favorites" : "Add to favorites"
                  }
                  style={{
                    opacity: favoritingIds.has(item.id) ? 0.4 : 1,
                  }}
                >
                  <svg
                    className="w-4 h-4 md:w-5 md:h-5"
                    viewBox="0 0 24 24"
                    fill={item.favorite ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </button>
                <button
                  className="download-btn p-1.5 md:p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors min-w-[32px] min-h-[32px] md:min-w-[36px] md:min-h-[36px] flex items-center justify-center"
                  title="Download"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (item.music) {
                      const link = document.createElement("a");
                      link.href = item.music;
                      link.download = `${item.title}.mp3`;
                      link.click();
                    }
                  }}
                >
                  <svg
                    className="w-4 h-4 md:w-5 md:h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                </button>
              </div>

              {/* Mobile ISRC overlay - shown only on smallest screens */}
              <div className="xs:hidden col-span-3 mt-2 pt-2 border-t border-slate-700/30">
                <button
                  type="button"
                  className="text-[10px] text-slate-400 font-mono tracking-wider cursor-pointer hover:text-white transition-colors bg-transparent border-none outline-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCopyISRC(item.id);
                  }}
                  title="Click to copy ISRC"
                  tabIndex={0}
                >
                  ISRC: {item.id}
                </button>
              </div>
            </div>
          </FadeInUp>
        ))}
      </div>
    </div>
  );
};

export default MusicList;
