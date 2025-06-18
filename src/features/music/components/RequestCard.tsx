import React from 'react';
import { Clock, Music, FileText, Video } from 'lucide-react';
import { CustomRequest } from '../types';
import { formatDate, getStatusColor } from '../utils/formatters';

interface RequestCardProps {
  request: CustomRequest;
}

export const RequestCard: React.FC<RequestCardProps> = ({ request }) => {
  return (
    <div className="p-6 bg-slate-700/30 rounded-xl border border-slate-600/50 hover:bg-slate-700/40 transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <Clock className="w-4 h-4" />
          {formatDate(request.submittedAt)}
        </div>
      </div>

      <p className="text-slate-300 text-sm mb-4 leading-relaxed">
        {request.description}
      </p>

      <div className="flex items-center gap-6 text-xs text-slate-400">
        {request.referenceTracks.length > 0 && (
          <div className="flex items-center gap-1">
            <Music className="w-4 h-4" />
            <span>{request.referenceTracks.length} reference{request.referenceTracks.length !== 1 ? 's' : ''}</span>
          </div>
        )}
        {request.exampleVideos.length > 0 && (
          <div className="flex items-center gap-1">
            <Video className="w-4 h-4" />
            <span>{request.exampleVideos.length} video{request.exampleVideos.length !== 1 ? 's' : ''}</span>
          </div>
        )}
        {request.description && (
          <div className="flex items-center gap-1">
            <FileText className="w-4 h-4" />
            <span>Description provided</span>
          </div>
        )}
      </div>

      {request.notes && (
        <div className="mt-4 p-3 bg-slate-800/50 rounded-lg">
          <p className="text-slate-300 text-sm">
            <span className="font-medium text-slate-200">Note:</span> {request.notes}
          </p>
        </div>
      )}

      {request.completedTrack && (
        <div className="mt-4 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
          <div className="flex items-center gap-2">
            <Music className="w-4 h-4 text-green-400" />
            <span className="text-green-300 text-sm font-medium">Track completed!</span>
          </div>
          <p className="text-green-200 text-sm mt-1">{request.completedTrack}</p>
        </div>
      )}
    </div>
  );
};