export interface CustomRequest {
  id: string;
  submittedBy: string;
  submittedAt: string;
  status: 'pending' | 'in-progress' | 'completed' | 'rejected';
  referenceTracks: string[];
  description: string;
  exampleVideos: string[];
  priority: 'low' | 'medium' | 'high';
  estimatedCompletion?: string;
  completedTrack?: string;
  notes?: string;
}

export type RequestStatus = CustomRequest['status'];
export type RequestPriority = CustomRequest['priority'];