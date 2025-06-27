import React from "react";
import {
  FileSpreadsheet,
  Bell,
  LucideYoutube,
  MessageSquare,
  User2,
  FlagIcon,
  ArrowLeft,
  Database,
  Music,
} from "lucide-react";
import { motion } from "framer-motion";
import { NavigateFunction } from "react-router-dom";

interface AdminTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  navigate: NavigateFunction;
}

export const AdminTabs: React.FC<AdminTabsProps> = ({
  activeTab,
  setActiveTab,
  navigate,
}) => {
  const tabs = [
    { id: "applications", icon: FileSpreadsheet, label: "Applications" },
    { id: "notifications", icon: Bell, label: "Notifications" },
    { id: "yt-channels", icon: LucideYoutube, label: "Channels" },
    { id: "messages", icon: MessageSquare, label: "Messages" },
    { id: "users", icon: User2, label: "Users" },
    { id: "announcement", icon: FlagIcon, label: "Announcement" },
    { id: "music", icon: Music, label: "Music" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center mb-4 sm:mb-6 gap-2">
        <div className="flex items-center">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-indigo-500/20 flex items-center justify-center mr-3 sm:mr-4">
            <Database className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400">
            Admin Panel
          </h1>
        </div>

        <div className="ml-auto">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto pb-2 -mx-2 px-2">
        <motion.div
          className="flex flex-nowrap border-b border-slate-700/50 mb-4 sm:mb-6 min-w-max"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {tabs.map(({ id, icon: Icon, label }) => (
            <motion.button
              key={id}
              variants={itemVariants}
              onClick={() => setActiveTab(id)}
              className={`py-2 px-3 md:py-3 md:px-6 font-medium text-sm flex items-center transition-colors relative ${
                activeTab === id
                  ? "text-indigo-400 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-indigo-500 after:to-purple-500"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <div className="flex items-center">
                <Icon className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">{label}</span>
              </div>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </>
  );
};
