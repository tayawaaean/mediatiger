import { UserCircle, X } from 'lucide-react';
import React from 'react';
import { useLanguage } from '../../../contexts/LanguageContext'; // Import useLanguage hook
import { ExtendedUser } from '../../../types/user';
interface NavigationItem {
  name: string;
  section: string;
  icon: React.ReactNode;
  count?: number;
  tutorialContent?: string;
}

interface SidebarProps {
  user: ExtendedUser | null;
  username: string;
  profileImage: string | null;
  uploadingImage: boolean;
  showTuto: boolean;
  handleImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  navigationItems: NavigationItem[];
  setActiveSection: (section: string) => void;
  isMobileMenuOpen?: boolean;
  setIsMobileMenuOpen?: (value: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  user,
  username,
  profileImage,
  uploadingImage,
  showTuto,
  handleImageUpload,
  navigationItems,
  setActiveSection,
  isMobileMenuOpen = false,
  setIsMobileMenuOpen = () => {},
}) => {
  const { translate } = useLanguage(); // Get the translate function

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        id="side-bar"
        className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col"
      >
        <div className="flex min-h-0 flex-1 flex-col bg-slate-800">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            {/* User Profile Summary */}
            <div id="profile-section" className="px-6 py-8 text-center">
              <div className="relative group">
                <div className="h-24 w-24 rounded-full bg-indigo-600 mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold relative overflow-hidden">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt={translate('profileAlt')}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    user?.user_metadata?.full_name?.[0]?.toUpperCase() || (
                      <UserCircle className="h-16 w-16" />
                    )
                  )}

                  {/* Upload overlay */}
                  <label className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity duration-200">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                    />
                    {uploadingImage ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
                    ) : (
                      <span className="text-white text-sm">
                        {translate('update')}
                      </span>
                    )}
                  </label>
                </div>
              </div>

              <h2 className="text-xl font-bold text-white mb-1">
                {translate('welcomedashboard')},{' '}
                {user?.user_metadata?.full_name?.split(' ')[0] ||
                  translate('user')}
                !
              </h2>
              <p className="text-sm text-slate-400 mb-4">
                {username && <span>@{username}</span>}
              </p>
            </div>

            {/* NavBar Buttons */}
            <nav className="mt-5 flex-1 space-y-2 px-4">
              {navigationItems.map((item) => (
                <button
                  key={item.name}
                  id={`nav-item-${item.section}`}
                  onClick={() => {
                    setActiveSection(item.section);
                  }}
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-300 relative overflow-hidden hover:shadow-lg hover:shadow-indigo-500/10 hover:scale-[1.02] hover:-translate-y-0.5 w-full justify-between
                  `}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-indigo-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10 flex items-center">
                    <span className="transform transition-transform duration-300 group-hover:scale-110">
                      {item.icon}
                    </span>
                    <span className="ml-3 transform transition-transform duration-300 group-hover:translate-x-1">
                      {item.name}
                    </span>
                  </div>
                  {item.count && (
                    <span className="relative z-10 bg-slate-900 py-0.5 px-2 rounded-full text-xs transform transition-all duration-300 group-hover:bg-indigo-900 group-hover:text-white">
                      {item.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>

            {/* Tutorial Trigger Button */}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          {/* Sidebar panel */}
          <div className="relative flex flex-col w-64 h-full bg-slate-800 shadow-xl transition-transform duration-300 transform translate-x-0">
            {/* Close button */}
            <button
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X size={28} />
            </button>
            {/* Sidebar content (copy from desktop) */}
            <div className="flex-1 flex flex-col overflow-y-auto pt-5 pb-4">
              {/* User Profile Summary */}
              <div id="profile-section" className="px-6 py-8 text-center">
                <div className="relative group">
                  <div className="h-24 w-24 rounded-full bg-indigo-600 mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold relative overflow-hidden">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt={translate('profileAlt')}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      user?.user_metadata?.full_name?.[0]?.toUpperCase() || (
                        <UserCircle className="h-16 w-16" />
                      )
                    )}
                    {/* Upload overlay */}
                    <label className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity duration-200">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                      />
                      {uploadingImage ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
                      ) : (
                        <span className="text-white text-sm">
                          {translate('update')}
                        </span>
                      )}
                    </label>
                  </div>
                </div>
                <h2 className="text-xl font-bold text-white mb-1">
                  {translate('welcomedashboard')},{' '}
                  {user?.user_metadata?.full_name?.split(' ')[0] ||
                    translate('user')}
                  !
                </h2>
                <p className="text-sm text-slate-400 mb-4">
                  {username && <span>@{username}</span>}
                </p>
              </div>
              {/* NavBar Buttons */}
              <nav className="mt-5 flex-1 space-y-2 px-4">
                {navigationItems.map((item) => (
                  <button
                    key={item.name}
                    id={`nav-item-${item.section}`}
                    onClick={() => {
                      setActiveSection(item.section);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-300 relative overflow-hidden hover:shadow-lg hover:shadow-indigo-500/10 hover:scale-[1.02] hover:-translate-y-0.5 w-full justify-between
                       `}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-indigo-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10 flex items-center">
                      <span className="transform transition-transform duration-300 group-hover:scale-110">
                        {item.icon}
                      </span>
                      <span className="ml-3 transform transition-transform duration-300 group-hover:translate-x-1">
                        {item.name}
                      </span>
                    </div>
                    {item.count && (
                      <span className="relative z-10 bg-slate-900 py-0.5 px-2 rounded-full text-xs transform transition-all duration-300 group-hover:bg-indigo-900 group-hover:text-white">
                        {item.count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
