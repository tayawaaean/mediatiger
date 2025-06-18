import React from 'react';

interface DescriptionSectionProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const DescriptionSection: React.FC<DescriptionSectionProps> = ({
  value,
  onChange,
  placeholder = "Describe the track you want (style, mood, tempo, instruments, etc.)"
}) => {
  return (
    <div>
      <label className="block text-white mb-4">Track Description (If No References)</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-32 px-6 py-4 bg-slate-800 text-white rounded-xl border border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-200 placeholder-slate-400 resize-none"
      />
    </div>
  );
};