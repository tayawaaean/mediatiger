import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Language } from '../types';
import { getLanguageByCode, languages } from '../data/languages';
import { translations } from '../data/translations';

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (code: string) => void;
  translate: (key: string) => string;
  languages: Language[];
}

const defaultLanguage = getLanguageByCode('en');

const LanguageContext = createContext<LanguageContextType>({
  currentLanguage: defaultLanguage,
  setLanguage: () => {},
  translate: () => '',
  languages: [],
});

export const useLanguage = () => useContext(LanguageContext);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(defaultLanguage);

  useEffect(() => {
    // Load saved language preference from localStorage
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      setCurrentLanguage(getLanguageByCode(savedLanguage));
    }
  }, []);

  useEffect(() => {
    // Update document direction based on language direction
    document.documentElement.dir = currentLanguage.direction || 'ltr';
    document.documentElement.lang = currentLanguage.code;
  }, [currentLanguage]);

  const setLanguage = (code: string) => {
    const language = getLanguageByCode(code);
    setCurrentLanguage(language);
    localStorage.setItem('language', code);
  };

  const translate = (key: string): string => {
    if (!translations[key]) {
      console.warn(`Translation key "${key}" not found.`);
      return key;
    }
    
    if (!translations[key][currentLanguage.code]) {
      console.warn(`Translation for key "${key}" in language "${currentLanguage.code}" not found.`);
      return translations[key]['en'] || key;
    }
    
    return translations[key][currentLanguage.code];
  };

  const value = {
    currentLanguage,
    setLanguage,
    translate,
    languages,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};