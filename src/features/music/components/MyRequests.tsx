import React from 'react';
import { Music } from 'lucide-react';
import { CustomRequest } from '../types';
import { RequestCard } from './RequestCard';

interface MyRequestsProps {
  requests: CustomRequest[];
}

export const MyRequests: React.FC<MyRequestsProps> = ({ requests }) => {
  if (requests.length === 0) {
    return null;
  }

  return (
    <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Music className="w-6 h-6 text-purple-400" />
        <h2 className="text-xl font-semibold text-white">My Requests</h2>
        <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm font-medium">
          {requests.length}
        </span>
      </div>

      <div className="space-y-4">
        {requests.map((request) => (
          <RequestCard key={request.id} request={request} />
        ))}
      </div>
    </div>
  );
};