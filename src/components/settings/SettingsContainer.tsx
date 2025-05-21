import React from 'react';

interface SettingsContainerProps {
  children: React.ReactNode;
}

export const SettingsContainer: React.FC<SettingsContainerProps> = ({ children }) => {
  return (
    <div className="bg-slate-800/60 backdrop-blur-lg rounded-xl shadow-xl border border-slate-700/50 p-4 max-w-sm mx-auto overflow-hidden transition-all duration-300 ease-in-out">
      {children}
    </div>
  );
};