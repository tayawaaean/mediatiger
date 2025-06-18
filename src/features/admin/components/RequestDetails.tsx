import React, { useState } from 'react';
import { Music, Play, MessageSquare, CheckCircle, Download } from 'lucide-react';
import { CustomRequest, RequestStatus } from '../../music/types';
import toast from 'react-hot-toast'; // Import toast for notifications

interface RequestDetailsProps {
  request: CustomRequest | null;
  onUpdateStatus: (requestId: string, status: RequestStatus) => Promise<{ success: boolean; message?: string } | void>;
  onAddNote: (requestId: string, note: string) => Promise<{ success: boolean; message?: string }>;
  onRequestUpdated?: () => void;
}

export const RequestDetails: React.FC<RequestDetailsProps> = ({
  request,
  onUpdateStatus,
  onAddNote,
  onRequestUpdated
}) => {
  const [noteText, setNoteText] = useState('');
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);

  const handleAddNote = async () => {
    if (request && noteText.trim()) {
      const response = await onAddNote(request.id, noteText.trim());
      if (response && response.success) {
        toast.success('Note added successfully'); // Show toast on success
        setNoteText(''); // Clear input on success
      } else {
        toast.error(response?.message || 'Failed to add note'); // Show error if applicable
      }
    }
  };

  const handleStatusUpdate = async (requestId: string, status: RequestStatus) => {
    if (request) {
      const response = await onUpdateStatus(requestId, status);
      if (response && response.success) {
        if (status === 'completed' || status === 'rejected') {
          toast.success('Updated successfully'); // Show toast on status change
          if (onRequestUpdated) {
            onRequestUpdated();
          }
        }
      } else {
        toast.error(response?.message || 'Failed to update status'); // Handle undefined response
      }
    }
    if (status === 'rejected') {
      setShowRejectConfirm(false); // Hide confirmation after rejection
    }
  };

  const confirmReject = () => {
    if (request) {
      handleStatusUpdate(request.id, 'rejected');
    }
  };

  const cancelReject = () => {
    setShowRejectConfirm(false);
  };

  if (!request) {
    return (
      <div className="bg-slate-700/30 rounded-xl p-6">
        <div className="flex items-center justify-center h-48 text-slate-400">
          <div className="text-center">
            <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Select a request to view details</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-700/30 rounded-xl p-6">
      <div className="space-y-6">
        {/* Status Identifier and Action Buttons on the Right */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Request Details</h3>
          <div className="flex items-center gap-2">
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              request.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
              request.status === 'completed' ? 'bg-green-500/20 text-green-300' :
              'bg-red-500/20 text-red-300'
            }`}>
              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
            </div>
            {request.status === 'pending' && (
              <>
                <button
                  onClick={() => handleStatusUpdate(request.id, 'completed')}
                  className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
                >
                  Mark Completed
                </button>
                <button
                  onClick={() => setShowRejectConfirm(true)}
                  className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
                >
                  Reject
                </button>
              </>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Submitted By</label>
            <p className="text-white">@{request.submitted_by}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
            <p className="text-slate-200 bg-slate-800/50 p-4 rounded-lg">
              {request.description}
            </p>
          </div>

          {request.reference_tracks.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Reference Tracks</label>
              <div className="space-y-2">
                {request.reference_tracks.map((track, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                    <Play className="w-4 h-4 text-purple-400" />
                    <span className="text-slate-300 text-sm flex-1">{track}</span>
                    <button className="text-purple-400 hover:text-purple-300 transition-colors">
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {request.example_videos.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Example Videos</label>
              <div className="space-y-2">
                {request.example_videos.map((video, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                    <Play className="w-4 h-4 text-blue-400" />
                    <span className="text-slate-300 text-sm flex-1">{video}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {request.completed_track && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Completed Track</label>
              <div className="flex items-center gap-3 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-300 text-sm flex-1">{request.completed_track}</span>
                <button className="text-green-400 hover:text-green-300 transition-colors">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {request.notes && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Notes</label>
              <p className="text-slate-200 bg-slate-800/50 p-4 rounded-lg">
                {request.notes}
              </p>
            </div>
          )}

          <div className="pt-4 border-t border-slate-600/50">
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Add notes or updates..."
              className="w-full h-24 px-4 py-3 bg-slate-800 text-white rounded-lg border border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all duration-200 placeholder-slate-400 resize-none text-sm"
            />
            <button 
              onClick={handleAddNote}
              disabled={!noteText.trim()}
              className="mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Note
            </button>
          </div>
        </div>

        {/* Reject Confirmation Dialog */}
        {showRejectConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">Confirm Rejection</h3>
              <p className="text-slate-300 mb-4">Are you sure you want to reject this request?</p>
              <div className="flex gap-4">
                <button
                  onClick={confirmReject}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Yes, Reject
                </button>
                <button
                  onClick={cancelReject}
                  className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};