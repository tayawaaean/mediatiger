import React, { useEffect, useState } from "react";
import { Music } from "lucide-react";
import { useRequests } from "./admin/hooks/useRequests";
import { useRequestFilter } from "./admin/hooks/useRequestFilter";
import { useRequestSelection } from "./admin/hooks/useRequestSelection";
import { RequestList } from "./admin/components/RequestList";
import { RequestDetails } from "./admin/components/RequestDetails";
import { RequestFilters } from "./admin/components/RequestFilters";
import { supabase } from "./music/services/supabase";

export const MusicManager = () => {
  const { requests, updateRequestStatus, addNote, error } = useRequests();
  const { filterStatus, setFilterStatus, filteredRequests } =
    useRequestFilter(requests);
  const { selectedRequest, setSelectedRequest, clearSelection } =
    useRequestSelection();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Reset filter to 'all' when component mounts or requests change
  useEffect(() => {
    setFilterStatus("all"); // Default to show all requests
  }, [requests, setFilterStatus]);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const role = user.user_metadata?.role;
        if (role === "admin") {
          setIsAuthenticated(true);
        } else {
          setAuthError("You do not have admin privileges.");
        }
      } else {
        setAuthError("Please log in as an admin.");
      }
    };
    checkAuth();
  }, []);

  const handleRequestUpdated = () => {
    clearSelection();
  };

  if (!isAuthenticated) {
    return (
      <div className="p-4 bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700/50">
        <p className="text-red-300 text-center">{authError}</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700/50">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-6">
        <div className="flex flex-col xs:flex-row items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            <Music className="w-6 h-6 text-purple-400" />
            <h2 className="text-lg sm:text-xl font-semibold text-white text-center sm:text-left">
              Custom Music Requests
            </h2>
          </div>
          <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs sm:text-sm font-medium text-center">
            {requests.length} Total
          </span>
        </div>
        <div className="flex justify-center sm:justify-end w-full sm:w-auto">
          <RequestFilters
            activeFilter={filterStatus}
            onFilterChange={setFilterStatus}
          />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg mb-6">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

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
