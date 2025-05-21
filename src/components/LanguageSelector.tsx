import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { ChevronDown, ChevronUp, Globe } from 'lucide-react';

interface LanguageSelectorProps {
  onLanguageChange?: (languageCode: string) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ onLanguageChange }) => {
  const { currentLanguage, setLanguage, languages, translate } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Toggle dropdown
  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsOpen(!isOpen);
  };

  // Handle language selection
  const handleLanguageSelect = (e: React.MouseEvent, code: string) => {
    e.stopPropagation();
    e.preventDefault();

    // Update language in context
    setLanguage(code);

    // Notify parent component about language change (to update user profile)
    if (onLanguageChange) {
      onLanguageChange(code);
    }

    setIsOpen(false);
  };

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    // Close when pressing escape
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscKey);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen]);

  // Prevent propagation for all interactions
  const preventPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  return (
      <div
          className="flex items-center justify-between w-full"
          onClick={preventPropagation}
          ref={dropdownRef}
      >
        <span className="text-slate-400 text-sm">{translate('language')}</span>
        <div className="relative">
          <button
              className="flex items-center bg-slate-700 text-white rounded-md pl-2.5 pr-3 py-1 text-sm border border-indigo-500/20 hover:border-indigo-500/40 transition-colors"
              onClick={toggleDropdown}
              aria-expanded={isOpen}
              aria-haspopup="listbox"
          >
            <Globe className="h-3.5 w-3.5 mr-1.5 text-indigo-300" />
            <span className="text-sm mr-1 flex items-center">
            <span className="mr-1.5">{currentLanguage.flag}</span>
            <span>{currentLanguage.code.toUpperCase()}</span>
          </span>
            {isOpen ? (
                <ChevronUp className="h-3 w-3 text-indigo-300" />
            ) : (
                <ChevronDown className="h-3 w-3 text-indigo-300" />
            )}
          </button>

          {isOpen && (
              <div
                  className="absolute right-0 mt-1.5 w-52 bg-slate-800 rounded-lg shadow-xl z-50 py-1 overflow-y-auto border border-indigo-500/20"
                  role="listbox"
                  style={{
                    maxHeight: '200px',
                    zIndex: 9999,
                  }}
                  onClick={preventPropagation}
              >
                {languages.map((language) => (
                    <div
                        key={language.code}
                        className={`flex items-center px-3 py-2 hover:bg-indigo-500/10 cursor-pointer transition-colors duration-150 ${
                            currentLanguage.code === language.code ? 'bg-indigo-500/20' : ''
                        }`}
                        onClick={(e) => handleLanguageSelect(e, language.code)}
                        role="option"
                        aria-selected={currentLanguage.code === language.code}
                    >
                      <span className="text-lg mr-2.5">{language.flag}</span>
                      <span className="text-white text-sm">{language.name}</span>
                    </div>
                ))}
                <div className="px-3 py-2 text-xs text-indigo-300/80 text-center border-t border-slate-700/50 mt-1">
                  {translate('scrollToSeeMore')}
                </div>
              </div>
          )}
        </div>
      </div>
  );
};

export default LanguageSelector;