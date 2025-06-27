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
      <div className="bg-slate-800/60 rounded-xl shadow-xl border border-slate-700/50 w-full max-w-full h-full min-h-0 flex-1 mx-auto overflow-hidden flex flex-col md:max-w-4xl md:h-[700px]">
        {children}
      </div>
    );
  }
  return (
    <div className="bg-slate-800/60 rounded-xl shadow-xl border border-slate-700/50 w-full max-w-full h-full min-h-0 flex-1 mx-auto overflow-hidden flex flex-col md:max-w-2xl md:h-[700px]">
      {children}
    </div>
  );
};
