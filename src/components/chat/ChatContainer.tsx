import React from 'react';

interface ChatContainerProps {
  children: React.ReactNode;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({ children }) => {
  return (
    <div className="bg-slate-800/60  rounded-xl shadow-xl border border-slate-700/50 max-w-2xl mx-auto overflow-hidden h-[700px] flex flex-col">
      {children}
    </div>
  );
};