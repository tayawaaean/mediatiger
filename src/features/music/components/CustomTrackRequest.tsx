import React from "react";
import { useCustomTrackForm } from "../hooks/useCustomTrackForm";
import { useToggle } from "../hooks/useToggle";
import { MyRequests } from "./MyRequests";
import { ReferenceTracksSection } from "./form/ReferenceTracksSection";
import { DescriptionSection } from "./form/DescriptionSection";
import { ExampleVideosSection } from "./form/ExampleVideosSection";
import { ToggleSwitch } from "./ui/ToggleSwitch";
import { SubmitButton } from "./ui/SubmitButton";
import toast from "react-hot-toast"; // Import toast for notifications

export const CustomTrackRequest: React.FC = () => {
  const { isToggled: showCustomTracks, toggle: toggleCustomTracks } =
    useToggle(false);
  const {
    formData,
    submittedRequests,
    isSubmitting,
    submitError,
    clearError,
    addReferenceTrack,
    updateReferenceTrack,
    removeReferenceTrack,
    updateDescription,
    addExampleVideo,
    updateExampleVideo,
    removeExampleVideo,
    submitForm,
  } = useCustomTrackForm();

  const handleSubmit = async () => {
    await submitForm();
    if (!submitError) {
      toast.success("Request submitted successfully"); // Show toast on success
    } else {
      toast.error(submitError || "Failed to submit request"); // Show error if applicable
    }
  };

  return (
    <div id="music-background-request" className="space-y-6 md:space-y-8">
      <div
        className={`bg-slate-800/50 rounded-2xl border border-slate-700/50 p-4 md:p-6 lg:p-8 animate-section ${
          showCustomTracks ? "invert" : ""
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4 md:mb-6">
          <h2 className="text-lg md:text-xl font-semibold text-white">
            Custom Track Request
          </h2>

          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">Show Custom Tracks</span>
            <ToggleSwitch
              isActive={showCustomTracks}
              onToggle={toggleCustomTracks}
              label=""
            />
          </div>
        </div>

        {showCustomTracks ? (
          <div className="animate-fade-in">
            <h3 className="text-base md:text-lg font-medium mb-4 text-white">
              Your Custom Tracks
            </h3>
            <div className="space-y-4">
              <div className="p-4 md:p-6 bg-slate-700/30 rounded-lg">
                <p className="text-slate-400 text-center text-sm md:text-base">
                  No custom tracks yet
                </p>
                <p className="text-xs md:text-sm text-slate-500 text-center mt-1">
                  Submit a request to get started
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <p className="text-slate-400 mb-6 md:mb-8 text-sm md:text-base leading-relaxed">
              Request a custom track for your content. Please provide at least
              one reference track and/or a detailed description of the track you
              want. You can also include example videos where you plan to use
              the track.
            </p>

            <div className="space-y-6 md:space-y-8">
              <ReferenceTracksSection
                tracks={formData.reference_tracks}
                onAddTrack={addReferenceTrack}
                onUpdateTrack={updateReferenceTrack}
                onRemoveTrack={removeReferenceTrack}
              />

              <DescriptionSection
                value={formData.description}
                onChange={updateDescription}
              />

              <ExampleVideosSection
                videos={formData.example_videos}
                onAddVideo={addExampleVideo}
                onUpdateVideo={updateExampleVideo}
                onRemoveVideo={removeExampleVideo}
              />

              {submitError && (
                <div className="p-3 md:p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                  <p className="text-red-300 text-sm md:text-base">
                    {submitError}
                  </p>
                  <button
                    onClick={clearError}
                    className="text-red-400 hover:text-red-300 text-xs md:text-sm mt-1 underline"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              <SubmitButton
                onClick={handleSubmit}
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                Submit Request
              </SubmitButton>
            </div>
          </>
        )}
      </div>

      <MyRequests requests={submittedRequests} />
    </div>
  );
};
