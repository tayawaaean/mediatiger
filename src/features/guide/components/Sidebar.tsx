import React from 'react';
import { GuideType } from '../../../types/guide';

interface SidebarProps {
  guides: GuideType[];
  activeGuide: string;
  onGuideClick: (guideId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ guides, activeGuide, onGuideClick }) => {
  return (
    <aside className="w-full md:w-96 bg-slate-800/90 rounded-2xl p-6 border border-indigo-500/20 h-fit">
      <nav>
        <ul className="space-y-3">
          {guides.map((guide) => (
            <li key={guide.id}>
              <button
                className={`nav-item w-full text-left border ${
                  activeGuide === guide.id
                    ? 'active'
                    : 'border-transparent'
                }`}
                onClick={() => onGuideClick(guide.id)}
              >
                {guide.hasIcon && (
                  guide.id === 'upload' ? (
                    <img 
                      src="https://vaeuvecjtnvismnobvyy.supabase.co/storage/v1/object/public/images//416c9dfd-03ad-4e5b-b87c-c56228305b89.png"
                      alt="Upload Guide Icon"
                      className="w-12 h-12 object-contain flex-shrink-0"
                    />
                  ) : guide.id === 'music' ? (
                    <img 
                      src="https://vaeuvecjtnvismnobvyy.supabase.co/storage/v1/object/public/images//music%20-%20Edited.png"
                      alt="Music Guide Icon"
                      className="w-12 h-12 object-contain flex-shrink-0"
                    />
                  ) : guide.id === 'payments' ? (
                    <img 
                      src="https://vaeuvecjtnvismnobvyy.supabase.co/storage/v1/object/public/guide//Untitled%20design%20(1).png"
                      alt="Payments Guide Icon"
                      className="w-12 h-12 object-contain flex-shrink-0"
                    />
                  ) : (
                    <img 
                      src="https://vaeuvecjtnvismnobvyy.supabase.co/storage/v1/object/public/images//979647a0-3ec7-4fb7-8fb4-e37ecc00bd87.png"
                      alt="Quick Start Guide Icon"
                      className="w-12 h-12 object-contain flex-shrink-0"
                    />
                  )
                )}
                <span className="font-medium flex-1 text-lg">{guide.title}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;