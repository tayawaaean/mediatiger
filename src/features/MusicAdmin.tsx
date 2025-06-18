import React from 'react';
import { Music } from 'lucide-react';
import { useRequests } from './admin/hooks/useRequests';
import { useRequestFilter } from './admin/hooks/useRequestFilter';
import { useRequestSelection } from './admin/hooks/useRequestSelection';
import { RequestList } from './admin/components/RequestList';
import { RequestDetails } from './admin/components/RequestDetails';
import { RequestFilters } from './admin/components/RequestFilters';

export const MusicManager = () => {
  const { requests, updateRequestStatus, addNote } = useRequests();
  const { filterStatus, setFilterStatus, filteredRequests } = useRequestFilter(requests);
  const { selectedRequest, setSelectedRequest, clearSelection } = useRequestSelection();

  const handleRequestUpdated = () => {
    clearSelection();
  };

  return (
    <div className="p-4 bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700/50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Music className="w-6 h-6 text-purple-400" />
          <h2 className="text-xl font-semibold text-white">Custom Music Requests</h2>
          <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm font-medium">
            {requests.length} Total
          </span>
        </div>
        <RequestFilters activeFilter={filterStatus} onFilterChange={setFilterStatus} />
      </div>

      {filteredRequests.length === 0 ? (
        <p className="text-slate-400 text-center py-8">No requests found.</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RequestList
            requests={filteredRequests}
            selectedRequest={selectedRequest}
            onSelectRequest={setSelectedRequest}
          />
          <RequestDetails
            request={selectedRequest}
            onUpdateStatus={updateRequestStatus}
            onAddNote={addNote}
            onRequestUpdated={handleRequestUpdated}
          />
        </div>
      )}
    </div>
  );
};