import React from 'react';
import { User, Clock } from 'lucide-react';
import { CustomRequest } from '../../music/types';
import { formatDate, getStatusColor } from '../../music/utils/formatters';

interface RequestListProps {
  requests: CustomRequest[];
  selectedRequest: CustomRequest | null;
  onSelectRequest: (request: CustomRequest) => void;
}

export const RequestList: React.FC<RequestListProps> = ({
  requests,
  selectedRequest,
  onSelectRequest
}) => {
  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <div
          key={request.id}
          onClick={() => onSelectRequest(request)}
          className={`p-6 rounded-xl border transition-all duration-200 cursor-pointer ${
            selectedRequest?.id === request.id
              ? 'bg-slate-700/50 border-purple-500/50'
              : 'bg-slate-700/30 border-slate-600/50 hover:bg-slate-700/40'
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-slate-400" />
              <span className="font-medium text-white">@{request.submitted_by}</span>
            </div>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
            </div>
          </div>
          
          <p className="text-slate-300 text-sm mb-3 line-clamp-2">
            {request.description}
          </p>
          
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {formatDate(request.submitted_at)}
            </div>
            <div className="flex items-center gap-3">
              {request.reference_tracks.length > 0 && (
                <span>{request.reference_tracks.length} refs</span>
              )}
              {request.example_videos.length > 0 && (
                <span>{request.example_videos.length} videos</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};