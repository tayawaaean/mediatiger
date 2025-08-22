import React from "react";
import { Link } from "react-router-dom";
import { Menu, X, ArrowRight } from "lucide-react";
import { NavigationProps, LoadingState } from "../types";

interface NavigationItemProps {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const NavigationItem: React.FC<NavigationItemProps> = ({
  href,
  children,
  onClick,
  className = "relative text-slate-300 hover:text-white transition-all duration-300 font-medium tracking-wide group",
}) => (
  <a href={href} className={className} onClick={onClick}>
    {children}
    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 group-hover:w-full transition-all duration-300"></span>
  </a>
);

const Navigation: React.FC<
  NavigationProps & { loadingState: LoadingState }
> = ({ isMobileMenuOpen, setIsMobileMenuOpen, loadingState }) => {
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav
      className={`fixed w-full top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/50 shadow-lg shadow-slate-900/20 transition-all duration-1000 ease-out ${
        loadingState.isNavigationLoaded
          ? "translate-y-0 opacity-100"
          : "-translate-y-full opacity-0"
      }`}
    >
      {/* Premium gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 transition-opacity duration-1000"></div>

      {/* Subtle animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="h-full w-full bg-[linear-gradient(45deg,transparent_25%,rgba(99,102,241,0.1)_25%,rgba(99,102,241,0.1)_50%,transparent_50%,transparent_75%,rgba(99,102,241,0.1)_75%)] bg-[length:20px_20px] animate-pulse"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo section with premium styling */}
          <div
            className={`flex items-center group transition-all duration-700 ease-out ${
              loadingState.isNavigationLoaded
                ? "translate-x-0 opacity-100"
                : "-translate-x-8 opacity-0"
            }`}
            style={{ transitionDelay: "200ms" }}
          >
            <div className="relative">
              {/* Logo background glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-indigo-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500"></div>

              {/* Logo container */}
              <div className="relative flex items-center space-x-3 px-4 py-2 rounded-xl bg-gradient-to-r from-slate-800/50 to-slate-700/50 border border-slate-700/50 shadow-lg backdrop-blur-sm group-hover:shadow-xl transition-all duration-300">
                <img
                  src="https://vaeuvecjtnvismnobvyy.supabase.co/storage/v1/object/public/images//39888c2f-22d0-4a95-85ae-dfa6dc1aae7b.png"
                  alt="MediaTiger Logo"
                  className="w-7 h-7 object-contain group-hover:scale-110 transition-transform duration-300"
                />
                <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-white tracking-tight">
                  MediaTiger
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div
            className={`hidden md:flex items-center space-x-12 transition-all duration-700 ease-out ${
              loadingState.isNavigationLoaded
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            }`}
            style={{ transitionDelay: "400ms" }}
          >
            <div className="flex items-center space-x-10">
              <NavigationItem
                href="#features"
                className="relative text-slate-300 hover:text-white transition-all duration-300 font-medium tracking-wide group"
              >
                Features
              </NavigationItem>
              <NavigationItem
                href="#our-mission"
                className="relative text-slate-300 hover:text-white transition-all duration-300 font-medium tracking-wide group"
              >
                About
              </NavigationItem>
              <NavigationItem
                href="#faq"
                className="relative text-slate-300 hover:text-white transition-all duration-300 font-medium tracking-wide group"
              >
                FAQ
              </NavigationItem>
            </div>

            {/* Premium CTA Button */}
            <Link
              to="/signup?referal=true"
              className="relative group overflow-hidden"
            >
              {/* Button background with multiple layers */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 rounded-xl"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              {/* Animated shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>

              {/* Button glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 rounded-xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>

              {/* Button content */}
              <div className="relative px-8 py-3 text-white font-bold text-lg tracking-wide flex items-center space-x-2 rounded-xl border border-white/20 shadow-2xl backdrop-blur-sm">
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </Link>
          </div>

          {/* Mobile menu button with premium styling */}
          <div
            className={`md:hidden flex items-center transition-all duration-700 ease-out ${
              loadingState.isNavigationLoaded
                ? "translate-x-0 opacity-100"
                : "translate-x-8 opacity-0"
            }`}
            style={{ transitionDelay: "600ms" }}
          >
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="relative p-3 rounded-xl bg-gradient-to-r from-slate-800/80 to-slate-700/80 border border-slate-700/50 shadow-lg backdrop-blur-sm hover:shadow-xl transition-all duration-300 group"
              aria-label="Toggle mobile menu"
            >
              {/* Button glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <div className="relative text-slate-300 group-hover:text-white transition-colors">
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Mobile menu with premium styling */}
        <div
          className={`md:hidden transition-all duration-300 ease-out ${
            isMobileMenuOpen
              ? "max-h-96 opacity-100 translate-y-0"
              : "max-h-0 opacity-0 -translate-y-4 overflow-hidden"
          }`}
        >
          <div className="relative px-2 pt-4 pb-6 space-y-2">
            {/* Mobile menu background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800/95 to-slate-700/95 rounded-2xl border border-slate-700/50 shadow-2xl backdrop-blur-xl"></div>

            <div className="relative space-y-1">
              <NavigationItem
                href="#features"
                onClick={closeMobileMenu}
                className="block px-6 py-4 rounded-xl text-lg font-semibold text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-300 group"
              >
                <span className="flex items-center justify-between">
                  Features
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all duration-300" />
                </span>
              </NavigationItem>

              <NavigationItem
                href="#about"
                onClick={closeMobileMenu}
                className="block px-6 py-4 rounded-xl text-lg font-semibold text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-300 group"
              >
                <span className="flex items-center justify-between">
                  About
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all duration-300" />
                </span>
              </NavigationItem>

              <NavigationItem
                href="#faq"
                onClick={closeMobileMenu}
                className="block px-6 py-4 rounded-xl text-lg font-semibold text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-300 group"
              >
                <span className="flex items-center justify-between">
                  FAQ
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all duration-300" />
                </span>
              </NavigationItem>
            </div>

            {/* Mobile CTA */}
            <div className="relative pt-4 border-t border-slate-700/50">
              <Link
                to="/signup?referal=true"
                className="relative block group overflow-hidden"
                onClick={closeMobileMenu}
              >
                {/* Mobile button background */}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 rounded-xl"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                {/* Mobile button glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 rounded-xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>

                {/* Mobile button content */}
                <div className="relative px-6 py-4 text-white font-bold text-lg text-center rounded-xl border border-white/20 shadow-2xl backdrop-blur-sm">
                  <span className="flex items-center justify-center space-x-2">
                    <span>Get Started</span>
                    <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
