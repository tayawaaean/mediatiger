
// SignOutButton.tsxsetLanguage,
import React from 'react';
import { LogOut } from 'lucide-react';
import { useLanguage } from "../../contexts/LanguageContext";
interface SignOutButtonProps {
  onClick: (e: React.MouseEvent) => void;
}

export const SignOutButton: React.FC<SignOutButtonProps> = ({ onClick }) => {
    const { translate } = useLanguage();
  return (
      <button
          onClick={onClick}
          className="flex items-center justify-center gap-2 w-full bg-red-600 hover:bg-red-700 text-white rounded-lg py-3 px-4"
      >
        <LogOut size={20} />
        <span>{translate('signOut')}</span>
      </button>
  );
};