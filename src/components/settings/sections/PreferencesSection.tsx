import React, { useEffect } from "react";
import { SlidersHorizontal, Globe } from "lucide-react";
import { FormField } from "../../ui/FormField";
import { Select } from "../../ui/Select";
import { SectionTitle } from "../SectionTitle";
import { useLanguage } from "../../../contexts/LanguageContext";
import { languages } from "../../../data/languages";

interface PreferencesSectionProps {
  initialLanguage: string;
  onLanguageChange: (code: string) => void;
}

export const PreferencesSection: React.FC<PreferencesSectionProps> = ({
  initialLanguage,
  onLanguageChange,
}) => {
  const { setLanguage, translate } = useLanguage();

  // Set language from props when component mounts or when initialLanguage changes
  useEffect(() => {
    if (initialLanguage) {
      setLanguage(initialLanguage);
    }
  }, [initialLanguage, setLanguage]);

  // Function to handle language change
  const handleLanguageChange = (languageCode: string) => {
    // Update language in context for immediate UI response
    setLanguage(languageCode);

    // Call the prop function to update in Supabase
    onLanguageChange(languageCode);
  };

  // Convert languages array to the format expected by the Select component
  const languageOptions = languages.map((lang) => ({
    value: lang.code,
    label: `${lang.flag} ${lang.name}`,
  }));

  return (
    <section className="pt-2 height-full">
      <SectionTitle
        icon={<SlidersHorizontal size={16} />}
        title={translate ? translate("preferences") : "Preferences"}
      />
      <div className="mt-4 grid grid-cols-1 gap-4">
        <FormField
          label={translate ? translate("language") : "Language"}
          htmlFor="language"
        >
          <select
            id="language"
            value={initialLanguage}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="appearance-none bg-white/5 pl-4 pr-10 py-2 border border-slate-700/50 cursor-pointer hover:bg-white/10 transition-colors w-full sm:w-auto min-w-[140px]"
          >
            {languageOptions.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </FormField>
      </div>
    </section>
  );
};
