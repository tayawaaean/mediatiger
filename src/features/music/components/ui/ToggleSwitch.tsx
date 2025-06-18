import React from 'react';

interface ToggleSwitchProps {
  isActive: boolean;
  onToggle: () => void;
  label: string;
  className?: string;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  isActive,
  onToggle,
  label,
  className = ""
}) => {
  return (
    <div className={`flex items-center cursor-pointer ${className}`} onClick={onToggle}>
      <span className="mr-3 text-sm text-slate-400">{label}</span>
      <div className={`toggle-switch ${isActive ? 'active' : ''}`}>
        <div className="toggle-handle"></div>
      </div>
    </div>
  );
};