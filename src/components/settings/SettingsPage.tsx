import React from 'react';
import { SettingsHeader } from './SettingsHeader';
import { SettingsContainer } from './SettingsContainer';
import { ProfileSection } from './sections/ProfileSection';
import { SecuritySection } from './sections/SecuritySection';
import { PreferencesSection } from './sections/PreferencesSection';
import { SignOutButton } from '../ui/SignOutButton';

export const SettingsPage: React.FC = () => {
  return (
    <div className="container mx-auto py-4 px-4">
      <SettingsHeader />
      <SettingsContainer>
        <ProfileSection />
        <div className="h-px bg-gradient-to-r from-transparent via-slate-600/30 to-transparent my-3" />
        <SecuritySection />
        <div className="h-px bg-gradient-to-r from-transparent via-slate-600/30 to-transparent my-3" />
        <PreferencesSection />
        <div className="mt-6 flex justify-center">
          <SignOutButton />
        </div>
      </SettingsContainer>
    </div>
  );
};