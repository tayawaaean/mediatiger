import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { ExtendedUser } from "../types/user";

// Create a simple event emitter for profile updates
export const profileUpdateEvents = {
  listeners: new Set<() => void>(),

  // Notify all listeners when profile is updated
  emit() {
    this.listeners.forEach(listener => listener());
  },

  // Add a listener
  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
};

export interface UserProfileState {
  uploadingImage: boolean;
  profileImage: string | null;
  username: string | null;
  setUsername: (value: string) => void;
  showUsernameModal: boolean;
  setShowUsernameModal: (value: boolean) => void;
  showTutorial: boolean;
  setShowTutorial: (value: boolean) => void;
  handleImageUpload: (
      event: React.ChangeEvent<HTMLInputElement>
  ) => Promise<void>;
}

export function useUserProfile(user: ExtendedUser | null): UserProfileState {
  const [uploadingImage, setUploadingImage] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(
      user?.user_metadata?.avatar_url || null
  );
  const [username, setUsername] = useState<string | null>(
      user?.user_metadata?.username || null
  );
  const [showUsernameModal, setShowUsernameModal] = useState(
      username === "" || username === null
  );
  const [showTutorial, setShowTutorial] = useState(false);

  // Subscribe to profile update events
  useEffect(() => {
    // Only set up the listener if we have a user
    if (!user) return;

    const unsubscribe = profileUpdateEvents.subscribe(async () => {
      try {
        // Fetch latest user data when profile is updated
        const { data, error } = await supabase.auth.getUser();

        if (error) {
          console.error("Error fetching updated user data:", error);
          return;
        }

        if (data?.user) {
          // Update local state with the latest user data
          setProfileImage(data.user.user_metadata?.avatar_url || null);
          setUsername(data.user.user_metadata?.username || null);
        }
      } catch (error) {
        console.error("Error in profile update listener:", error);
      }
    });

    // Clean up the listener when the component unmounts or user changes
    return unsubscribe;
  }, [user?.id]); // Only re-subscribe if the user ID changes

  const handleImageUpload = async (
      event: React.ChangeEvent<HTMLInputElement>
  ) => {
    try {
      const file = event.target.files?.[0];
      if (!file || !user) return;

      setUploadingImage(true);

      // Upload image to Supabase Storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `/${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
          .from("profile-pictures")
          .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("profile-pictures").getPublicUrl(filePath);

      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
      });

      if (updateError) throw updateError;

      // Update local state
      setProfileImage(publicUrl);

      // Notify all components that use this hook about the update
      profileUpdateEvents.emit();

    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setUploadingImage(false);
      // Clear the file input
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  return {
    uploadingImage,
    profileImage,
    username,
    setUsername,
    showUsernameModal,
    setShowUsernameModal,
    showTutorial,
    setShowTutorial,
    handleImageUpload,
  };
}