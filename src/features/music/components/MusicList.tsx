import { MusicItem } from "../../../utils/data";
import React from "react";
import FadeInUp from "../../../components/FadeInUp";

interface MusicListProps {
  items: MusicItem[];
  onPlay: (item: MusicItem) => void;
  onFavorite: (id: string, isFavorite: boolean) => void;
  onCopyISRC: (id: string) => void;
}

export const MusicList: React.FC<MusicListProps> = ({
  items,
  onPlay,
  onFavorite,
  onCopyISRC,
}) => {
  return (
    <div className="mt-8">
      <div className="grid grid-cols-[60px_1fr_120px_80px] gap-2 px-2 py-2 text-slate-400 text-xs font-medium sm:grid-cols-[80px_1fr_200px_100px] sm:gap-4 sm:px-4 sm:text-sm">
        <div>Cover</div>
        <div>Title</div>
        <div className="text-right pr-4 sm:pr-8">ISRC</div>
        <div className="flex justify-center">Music File</div>
      </div>
      <div className="space-y-2 mt-4" id="musicList">
        {items.map((item, index) => (
          <FadeInUp key={item.id} delay={index * 80}>
            <div
              className="grid grid-cols-[60px_1fr_120px_80px] gap-2 items-center px-2 py-2 hover:bg-slate-700/30 rounded-lg transition-colors cursor-pointer group sm:grid-cols-[80px_1fr_200px_100px] sm:gap-4 sm:px-4 sm:py-3"
              onClick={() => onPlay(item)}
            >
              <img
                src={item.cover}
                alt={item.title}
                className="w-10 h-10 rounded-lg object-cover sm:w-12 sm:h-12"
              />
              <div className="flex flex-col min-w-0">
                <h3 className="text-white text-xs font-medium truncate sm:text-sm">
                  {item.title}
                </h3>
                <div className="flex flex-wrap gap-1 mt-1 max-h-10 overflow-hidden sm:gap-2 sm:mt-1.5 sm:max-h-12">
                  {item.category.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 text-slate-400 first:bg-white/10 whitespace-nowrap truncate max-w-[100px] sm:text-xs sm:px-2 sm:max-w-[120px]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <button
                type="button"
                className="text-xs text-slate-400 font-mono tracking-wider text-right pr-4 cursor-pointer hover:text-white transition-colors bg-transparent border-none outline-none sm:text-sm sm:pr-8"
                onClick={(e) => {
                  e.stopPropagation();
                  onCopyISRC(item.id);
                }}
                title="Click to copy"
                tabIndex={0}
              >
                {item.id}
              </button>
              <div className="flex gap-1 justify-center sm:gap-2">
                <button
                  className="favorite-btn p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors sm:p-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    onFavorite(item.id, !item.favorite);
                  }}
                >
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    viewBox="0 0 24 24"
                    fill={item.favorite ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </button>
                <button
                  className="download-btn p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors sm:p-2"
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
                    className="w-4 h-4 sm:w-5 sm:h-5"
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
            </div>
          </FadeInUp>
        ))}
      </div>
    </div>
  );
};

export default MusicList;
