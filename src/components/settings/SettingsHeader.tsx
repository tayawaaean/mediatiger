import React from "react";
import { Settings } from "lucide-react";

export const SettingsHeader: React.FC = () => {
  return (
    <div className="flex items-center gap-3 mb-4 px-2">
      <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full shadow-lg shadow-indigo-500/20">
        <Settings size={20} className="text-white" />
      </div>
      <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
        Settings
      </h1>
    </div>
  );
};
