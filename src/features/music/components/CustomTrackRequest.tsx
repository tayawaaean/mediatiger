import React from 'react';
import { useCustomTrackForm } from '../hooks/useCustomTrackForm';
import { useToggle } from '../hooks/useToggle';
import { MyRequests } from './MyRequests';
import { ReferenceTracksSection } from './form/ReferenceTracksSection';
import { DescriptionSection } from './form/DescriptionSection';
import { ExampleVideosSection } from './form/ExampleVideosSection';
import { ToggleSwitch } from './ui/ToggleSwitch';
import { SubmitButton } from './ui/SubmitButton';

export const CustomTrackRequest: React.FC = () => {
  const { isToggled: showCustomTracks, toggle: toggleCustomTracks } = useToggle(false);
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
    submitForm
  } = useCustomTrackForm();

  return (
    <div className="space-y-8">
      <div className={`bg-slate-800/50 rounded-2xl border border-slate-700/50 p-8 animate-section ${showCustomTracks ? 'invert' : ''}`}>
        <h2 className="text-xl font-semibold mb-6 text-white">Custom Track Request</h2>
        
        <div className="flex items-center justify-end mb-4">
          <ToggleSwitch
            isActive={showCustomTracks}
            onToggle={toggleCustomTracks}
            label="Show Custom Tracks"
          />
        </div>

        {showCustomTracks ? (
          <div className="animate-fade-in">
            <h3 className="text-lg font-medium mb-4 text-white">Your Custom Tracks</h3>
            <div className="space-y-4">
              <div className="p-4 bg-slate-700/30 rounded-lg">
                <p className="text-slate-400 text-center">No custom tracks yet</p>
                <p className="text-sm text-slate-500 text-center mt-1">Submit a request to get started</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <p className="text-slate-400 mb-8">
              Request a custom track for your content. Please provide at least one reference track and/or a detailed description of
              the track you want. You can also include example videos where you plan to use the track.
            </p>

            <div className="space-y-8">
              <ReferenceTracksSection
                tracks={formData.referenceTracks}
                onAddTrack={addReferenceTrack}
                onUpdateTrack={updateReferenceTrack}
                onRemoveTrack={removeReferenceTrack}
              />

              <DescriptionSection
                value={formData.description}
                onChange={updateDescription}
              />

              <ExampleVideosSection
                videos={formData.exampleVideos}
                onAddVideo={addExampleVideo}
                onUpdateVideo={updateExampleVideo}
                onRemoveVideo={removeExampleVideo}
              />

              {submitError && (
                <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                  <p className="text-red-300 text-sm">{submitError}</p>
                  <button
                    onClick={clearError}
                    className="text-red-400 hover:text-red-300 text-xs mt-1"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              <SubmitButton
                onClick={submitForm}
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