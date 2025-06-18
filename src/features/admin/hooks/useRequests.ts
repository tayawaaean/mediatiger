import { useState, useEffect } from 'react';
import { CustomRequest, RequestStatus } from '../../music/types';
import { fetchAllRequests, addRequestNote, updateRequestStatus } from '../../music/services/api';

export const useRequests = () => {
  const [requests, setRequests] = useState<CustomRequest[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRequests = async () => {
      const response = await fetchAllRequests();
      if (response.success) {
        setRequests(response.data);
      } else {
        setError(response.message ?? null);
      }
    };
    loadRequests();
  }, []);

  const wrappedUpdateRequestStatus = async (requestId: string, newStatus: RequestStatus): Promise<{ success: boolean; message?: string }> => {
    const response = await updateRequestStatus(requestId, newStatus);
    if (response.success) {
      const updatedRequests = await fetchAllRequests();
      if (updatedRequests.success) {
        setRequests(updatedRequests.data);
      }
    } else {
      setError(response.message ?? null);
    }
    return response; // Ensure response is returned
  };

  const addNote = async (requestId: string, note: string): Promise<{ success: boolean; message?: string }> => {
    const response = await addRequestNote(requestId, note);
    if (response.success) {
      const updatedRequests = await fetchAllRequests();
      if (updatedRequests.success) {
        setRequests(updatedRequests.data);
      }
    }
    return response; // Return the API response
  };

  return {
    requests,
    updateRequestStatus: wrappedUpdateRequestStatus,
    addNote,
    error
  };
};