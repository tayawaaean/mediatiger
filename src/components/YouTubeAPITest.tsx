import React, { useState } from 'react';
import { fetchYouTubeChannelMetadata } from '../utils/channelValidation';

export default function YouTubeAPITest() {
  const [channelUrl, setChannelUrl] = useState('');
  const [metadata, setMetadata] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTest = async () => {
    if (!channelUrl.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setMetadata(null);

    try {
      const result = await fetchYouTubeChannelMetadata(channelUrl);
      if (result) {
        setMetadata(result);
      } else {
        setError('API call failed or returned no data. Channel name and thumbnail will be set to null in database.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6 max-w-2xl mx-auto">
      <h3 className="text-lg font-semibold text-white mb-4">
        YouTube API Test
      </h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-300 mb-2">
          YouTube Channel URL:
        </label>
        <input
          type="text"
          value={channelUrl}
          onChange={(e) => setChannelUrl(e.target.value)}
          placeholder="https://www.youtube.com/@AeanTayawa"
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        onClick={handleTest}
        disabled={isLoading || !channelUrl.trim()}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-medium py-2 px-4 rounded-lg transition-colors mb-4"
      >
        {isLoading ? 'Testing...' : 'Test API'}
      </button>

      {metadata && (
        <div className="bg-green-600/20 border border-green-600/30 rounded-lg p-4">
          <h4 className="text-green-400 font-medium mb-2">API Response:</h4>
          <div className="space-y-2">
            <div>
              <span className="text-slate-300">Channel Name:</span>
              <span className="text-white ml-2">{metadata.name}</span>
            </div>
            <div>
              <span className="text-slate-300">Thumbnail URL:</span>
              <div className="text-white ml-2 break-all">{metadata.thumbnail}</div>
            </div>
            <div className="mt-3">
              <span className="text-slate-300">Thumbnail Preview:</span>
              <div className="mt-2">
                <img 
                  src={metadata.thumbnail} 
                  alt={metadata.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-slate-600"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-600/20 border border-red-600/30 rounded-lg p-4">
          <h4 className="text-red-400 font-medium mb-2">Error:</h4>
          <p className="text-red-300">{error}</p>
        </div>
      )}

      <div className="mt-4 text-xs text-slate-400">
        <p>This component tests the YouTube API integration and shows the exact data that will be stored in your database.</p>
        <p>Make sure you have VITE_YOUTUBE_API_KEY set in your .env file.</p>
      </div>
    </div>
  );
}
