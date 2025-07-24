import React from "react";

interface DashboardLayoutProps {
  sidebar: React.ReactNode;
  header: React.ReactNode;
  children: React.ReactNode;
}

export function DashboardLayout({
  sidebar,
  header,
  children,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-slate-500/5 pointer-events-none"></div>
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500/10 rounded-full filter blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full filter blur-3xl pointer-events-none"></div>

      {/* Sidebar */}
      {sidebar}

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1 h-screen">
        {/* Mobile header */}
        <div className="sticky top-0 z-10 pl-1 pt-1 sm:pl-3 sm:pt-3 md:hidden">
          {header}
        </div>

        {/* Desktop header */}
        <div
          className="hidden md:block sticky top-0 z-10 pl-1 pt-1 sm:pl-3 sm:pt-3"
          id="dashboard-header"
        >
          {header}
        </div>

        <main className="flex-1 flex flex-col overflow-auto scrollbar-hide m-2">
          <div className="flex-1 w-full h-full">{children}</div>
        </main>
      </div>
    </div>
  );
}

/* CSS to hide scrollbar but keep functionality */
const styles = `
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  
  .scrollbar-hide {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
`;

// Add the styles to the document head
if (typeof document !== "undefined") {
  const styleElement = document.createElement("style");
  styleElement.innerHTML = styles;
  document.head.appendChild(styleElement);
}
