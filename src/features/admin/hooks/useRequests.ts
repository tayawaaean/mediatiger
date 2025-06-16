import { useState } from 'react';
import { CustomRequest, RequestStatus } from '../types';

const mockRequests: CustomRequest[] = [
  {
    id: '1',
    user_id: 'user1',
    submitted_by: 'AlexJohnson',
    submitted_at: '2025-06-15T10:30:00Z',
    status: 'in-progress',
    reference_tracks: ['https://example.com/track1'],
    description: 'Calm ambient track for meditation videos, soft piano with nature sounds, minimal and peaceful.',
    example_videos: [],
    priority: 'medium',
    estimated_completion: '2025-06-20T00:00:00Z',
    created_at: '2025-06-15T10:30:00Z',
    updated_at: '2025-06-15T11:00:00Z',
  },
  {
    id: '2',
    user_id: 'user2',
    submitted_by: 'MikeRodriguez',
    submitted_at: '2025-06-13T09:15:00Z',
    status: 'completed',
    reference_tracks: ['https://example.com/track2'],
    description: 'Corporate presentation background music, professional, uplifting, not too distracting.',
    example_videos: ['https://example.com/video1'],
    priority: 'low',
    completed_track: 'https://example.com/completed-track1',
    notes: 'Added subtle strings section as requested.',
    created_at: '2025-06-13T09:15:00Z',
    updated_at: '2025-06-13T12:00:00Z',
  },
];

export const useRequests = () => {
  const [requests, setRequests] = useState<CustomRequest[]>(mockRequests);

  const updateRequestStatus = (requestId: string, newStatus: RequestStatus) => {
    setRequests((prev) =>
      prev.map((req) => (req.id === requestId ? { ...req, status: newStatus } : req))
    );
  };

  const addNote = (requestId: string, note: string) => {
    setRequests((prev) =>
      prev.map((req) => (req.id === requestId ? { ...req, notes: note } : req))
    );
  };

  return {
    requests,
    updateRequestStatus,
    addNote,
  };
};