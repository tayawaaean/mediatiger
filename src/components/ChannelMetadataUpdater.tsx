import React, { useState } from 'react';
import { refreshAllChannelMetadata } from '../utils/channelValidation';
import { useLanguage } from '../contexts/LanguageContext';

export default function ChannelMetadataUpdater() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateCount, setUpdateCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { translate } = useLanguage();

  const handleUpdateAll = async () => {
    setIsUpdating(true);
    setError(null);
    setUpdateCount(null);

    try {
      const count = await refreshAllChannelMetadata();
      setUpdateCount(count);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6 max-w-md mx-auto">
      <h3 className="text-lg font-semibold text-white mb-4">
        Update Channel Metadata
      </h3>
      
      <p className="text-slate-300 text-sm mb-4">
        This will fetch YouTube channel names and thumbnails for all existing channels 
        that don't have this information.
      </p>

      <button
        onClick={handleUpdateAll}
        disabled={isUpdating}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
      >
        {isUpdating ? 'Updating...' : 'Update All Channels'}
      </button>

      {updateCount !== null && (
        <div className="mt-4 p-3 bg-green-600/20 border border-green-600/30 rounded-lg">
          <p className="text-green-400 text-sm">
            Successfully updated {updateCount} channels with metadata!
          </p>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-600/20 border border-red-600/30 rounded-lg">
          <p className="text-red-400 text-sm">
            Error: {error}
          </p>
        </div>
      )}

      <div className="mt-4 text-xs text-slate-400">
        <p>Note: This process may take several minutes depending on the number of channels.</p>
        <p>YouTube API rate limits apply.</p>
      </div>
    </div>
  );
}
