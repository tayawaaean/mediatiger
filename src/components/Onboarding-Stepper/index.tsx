import React from "react";
import toast from "react-hot-toast";
import { supabase } from "../../lib/supabase";

const shownToasts = new Set<string>();

export const showUniqueToast = (
  message: string,
  type: "success" | "error",
  id?: string
): void => {
  const toastId = id || message;
  if (!shownToasts.has(toastId)) {
    shownToasts.add(toastId);

    if (type === "success") {
      toast.success(message, { id: toastId });
    } else {
      toast.error(message, { id: toastId });
    }

    // Remove from tracking after some time
    setTimeout(() => {
      shownToasts.delete(toastId);
    }, 3000);
  }
};

export const handleSignOut = async (
  signOut: () => Promise<void>,
  navigate: (path: string) => void
): Promise<void> => {
  try {
    await signOut();
    navigate("/login");
  } catch (error) {
    console.error("Error signing out:", error);
    showUniqueToast("Failed to sign out", "error", "signout-error");
  }
};

export const handleFinalSubmit = async (
  setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>,
  interests: { [key: string]: boolean },
  userId: string,
  otherInterest: string,
  digitalRightsInfo: { website: string; youtubeChannels: string[] } | null,
  channelInfo: {
    youtubeLinks: string[];
    verifiedChannels?: Record<string, boolean>;
    name?: string;
    email?: string;
  },
  user: {
    id?: string;
    email?: string;
    user_metadata?: { full_name: string };
  } | null,
  userEmail: string | undefined,
  onClose: () => void
): Promise<void> => {
  setIsSubmitting(true);
  try {
    // Simplified submission - no complex interest logic needed anymore
    const { error } = await supabase.from("user_requests").insert([
      {
        user_id: userId,
        interests: [], // Always empty now since we removed interest selection
        other_interest: null,
        website: null,
        youtube_channel: null,
        name: channelInfo.name || user?.user_metadata?.full_name || "",
        email: channelInfo.email || userEmail,
        youtube_links: channelInfo.youtubeLinks.filter(
          (link) => link.trim() !== ""
        ),
        status: "pending",
      },
    ]);

    if (error) {
      console.error("Error submitting request:", error);
      throw new Error(error.message);
    }

    // Update profiles table to mark onboarding as complete
    try {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ onboarding_completed: true })
        .eq("id", userId);

      if (profileError) {
        console.error("Error updating profile:", profileError);
        // Don't throw here to allow the process to continue even if profile update fails
      }
    } catch (profileUpdateError) {
      console.error("Exception during profile update:", profileUpdateError);
    }

    // Show submission popup
    const popup = document.createElement("div");
    popup.className =
      "fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900";
    popup.innerHTML = `
        <div class="bg-slate-800 rounded-xl p-12 max-w-xl w-full text-center shadow-2xl border-2 border-indigo-500/20">
          <div class="w-20 h-20 mx-auto mb-8 rounded-full bg-indigo-600/20 flex items-center justify-center">
            <svg class="w-10 h-10 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 class="text-3xl font-bold text-white mb-6">Application Submitted</h3>
          <div class="mb-8">
            <div class="inline-flex items-center px-4 py-2 rounded-full text-base font-medium bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white relative overflow-hidden shadow-lg" style="background-size: 200% 100%; animation: gradient-wave 3s ease infinite;">
              Pending
            </div>
          </div>
          <p class="text-slate-300 text-lg mb-4">Your application is under review.</p>
          <p class="text-slate-400">You will be automatically redirected to your dashboard once your application is approved.</p>
        </div>
      `;
    document.body.appendChild(popup);

    // Close the onboarding popup after a short delay
    setTimeout(() => {
      onClose();
    }, 500);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    showUniqueToast(
      errorMessage || "Failed to submit your information. Please try again.",
      "error",
      "onboarding-error"
    );
    console.log(
      "[Onboarding] -> handleFinalSubmit -> Error submitting request:",
      errorMessage
    );
  } finally {
    setIsSubmitting(false);
  }
};