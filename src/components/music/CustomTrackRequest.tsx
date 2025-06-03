import React from 'react';

export const CustomTrackRequest: React.FC = () => {
  return (
    <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-8 animate-section">
      <h2 className="text-xl font-semibold mb-6 text-white">Custom Track Request</h2>
      <p className="text-slate-400 mb-8">
        Request a custom track for your content. Please provide at least one reference track and/or a detailed description of
        the track you want. You can also include example videos where you plan to use the track.
      </p>

      <div className="space-y-8">
        <div>
          <label className="block text-white mb-4">Reference Track(s)</label>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Enter URL"
              className="w-full px-6 py-4 bg-slate-800 text-white rounded-xl border border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-200 placeholder-slate-400"
            />
            <button className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 bg-slate-800 text-white hover:bg-slate-700 border border-slate-700/50">
              <span className="text-lg">+</span> Add Reference Track
            </button>
          </div>
        </div>

        <div>
          <label className="block text-white mb-4">Track Description (If No References)</label>
          <textarea
            placeholder="Describe the track you want (style, mood, tempo, instruments, etc.)"
            className="w-full h-32 px-6 py-4 bg-slate-800 text-white rounded-xl border border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-200 placeholder-slate-400 resize-none"
          />
        </div>

        <div>
          <label className="block text-white mb-4">Example Videos (Optional)</label>
          <button className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 bg-slate-800 text-white hover:bg-slate-700 border border-slate-700/50">
            <span className="text-lg">+</span> Add Example Video
          </button>
        </div>

        <button className="px-8 py-4 rounded-lg font-medium transition-all duration-200 bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40">
          Submit Request
        </button>
      </div>
    </div>
  );
};