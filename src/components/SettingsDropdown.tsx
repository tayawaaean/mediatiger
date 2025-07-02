import React, { useEffect, useRef } from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { SupabaseClient } from "@supabase/supabase-js";
import { SettingsContainer } from "./settings/SettingsContainer";
import { ProfileSection } from "./settings/sections/ProfileSection";
import { SecuritySection } from "./settings/sections/SecuritySection";
import { PreferencesSection } from "./settings/sections/PreferencesSection";
import { SignOutButton } from "./ui/SignOutButton";
import { LogOut } from "lucide-react";
import { SettingsHeader } from "./settings/SettingsHeader.tsx";

interface SettingsDropdownProps {
  user: SupabaseUser | null;
  handleSignOut: (
    supabase: SupabaseClient,
    isRejected: boolean,
    userId: string | undefined,
    signOut: () => Promise<void>
  ) => Promise<void>;
  supabase: SupabaseClient;
  isRejected: boolean;
  signOut: () => Promise<void>;
}

export const SettingsDropdown: React.FC<SettingsDropdownProps> = ({
  user,
  handleSignOut,
  supabase,
  isRejected,
  signOut,
}) => {
  // Reference to the dropdown element
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Apply anti-zoom CSS on mount
  useEffect(() => {
    // Remove zoom effects and animation from all elements
    const applyNoZoomEffect = () => {
      if (dropdownRef.current) {
        const allElements = dropdownRef.current.querySelectorAll("*");
        allElements.forEach((el) => {
          if (el instanceof HTMLElement) {
            // Apply no-zoom styles
            el.style.transform = "none";
            el.style.transition = "background-color 0.2s, color 0.2s";
            el.style.animation = "none";

            // Override any potential hover effects
            const originalTransform = el.style.transform;
            el.addEventListener("mouseenter", () => {
              el.style.transform = "none";
            });
            el.addEventListener("mouseleave", () => {
              el.style.transform = originalTransform;
            });
          }
        });
      }
    };

    // Apply immediately
    applyNoZoomEffect();

    // Re-apply after delays to catch any dynamic elements
    const timeoutId1 = setTimeout(applyNoZoomEffect, 100);
    const timeoutId2 = setTimeout(applyNoZoomEffect, 300);
    const timeoutId3 = setTimeout(applyNoZoomEffect, 500);

    return () => {
      clearTimeout(timeoutId1);
      clearTimeout(timeoutId2);
      clearTimeout(timeoutId3);
    };
  }, []);

  // Helper function to prevent event propagation
  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault(); // Also prevent default to be extra safe
  };

  // Custom SignOut button that's guaranteed to be visible
  const CustomSignOutButton = ({
    onClick,
  }: {
    onClick: (e: React.MouseEvent) => void;
  }) => (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white rounded-lg py-3 px-4"
      style={{ transform: "none", transition: "background-color 0.2s" }}
    >
      <LogOut className="h-5 w-5" />
      <span className="font-medium">Sign Out</span>
    </button>
  );

  return (
    <div
      ref={dropdownRef}
      className="settings-dropdown absolute right-0 top-full mt-2 w-[380px] max-h-[90vh] overflow-y-auto z-[999]"
      onClick={stopPropagation}
      style={{
        transform: "none",
        transition: "none",
        animation: "none",
      }}
    >
      <SettingsContainer>
        <SettingsHeader />
        <ProfileSection
          initialName={user?.user_metadata?.full_name || ""}
          initialEmail={user?.email || ""}
          onSaveName={(name) => {
            supabase.auth.updateUser({
              data: { full_name: name },
            });
          }}
        />

        {/* Security Section */}
        <SecuritySection />
        {/* Preferences Section */}
        <PreferencesSection
          initialLanguage={user?.user_metadata?.preferred_language || "en"}
          onLanguageChange={(code) => {
            supabase.auth.updateUser({
              data: { preferred_language: code },
            });
          }}
        />

        <SignOutButton
          onClick={(e) => {
            stopPropagation(e);
            handleSignOut(supabase, isRejected, user?.id, signOut);
          }}
        />
      </SettingsContainer>
    </div>
  );
};
