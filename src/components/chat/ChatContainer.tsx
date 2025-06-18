import React from "react";

interface ChatContainerProps {
  children: React.ReactNode;
  isAdmin?: boolean;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({
  children,
  isAdmin = false,
}) => {
  if (isAdmin) {
    return (
      <div className="bg-slate-800/60 rounded-xl shadow-xl border border-slate-700/50 max-w-4xl mx-auto overflow-hidden h-[700px] flex flex-col">
        {children}
      </div>
    );
  }
  return (
    <div className="bg-slate-800/60 rounded-xl shadow-xl border border-slate-700/50 max-w-2xl mx-auto overflow-hidden h-[700px] flex flex-col">
      {children}
    </div>
  );
};
