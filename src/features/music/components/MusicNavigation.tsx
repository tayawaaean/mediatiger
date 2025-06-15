import React from 'react';

interface MusicNavigationProps {
  currentTab: string;
  onTabChange: (tabId: string) => void;
}

export const MusicNavigation: React.FC<MusicNavigationProps> = ({ currentTab, onTabChange }) => {
  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'mood', label: 'All Moods' },
    { id: 'new', label: 'New' },
    { id: 'favorited', label: 'Favorites' }
  ];

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, tabId: string) => {
    e.preventDefault();
    if (currentTab !== tabId) {
      onTabChange(tabId);
    }
  };

  return (
    <nav className="navigation mb-6">
      <ul className="flex space-x-4">
        {navItems.map(item => (
          <li key={item.id} className={`nav-item ${currentTab === item.id ? 'active' : ''}`}>
            <a
              href={`#${item.id}`}
              className={`nav-link px-4 py-2 rounded-full transition-colors
                ${currentTab === item.id 
                  ? 'bg-white/10 text-white' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              onClick={(e) => handleClick(e, item.id)}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};