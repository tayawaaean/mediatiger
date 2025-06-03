import React from 'react';
import { Cpu, Home, Music, Youtube, User } from 'lucide-react';

const BottomNav: React.FC = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 shadow-lg">
      <div className="flex justify-around items-center h-16 px-2">
        <NavItem icon={<Cpu />} label="AI Studio" active={false} />
        <NavItem icon={<Home />} label="Dashboard" active={true} />
        <NavItem icon={<Music />} label="Music List" active={false} />
        <NavItem icon={<Youtube />} label="Channels" active={false} />
        <NavItem icon={<User />} label="My Page" active={false} />
      </div>
      <div className="w-1/3 h-1 mx-auto bg-slate-800 rounded-t-xl"></div>
    </div>
  );
};

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active }) => {
  return (
    <button 
      className={`flex flex-col items-center justify-center p-1 rounded-lg transition-all duration-200 ${
        active ? 'text-slate-200' : 'text-slate-500'
      }`}
    >
      <div className="w-6 h-6 mb-1">{icon}</div>
      <span className="text-xs">{label}</span>
    </button>
  );
};

export default BottomNav;