export interface CustomRequest {
  id: string;
  user_id: string;
  submitted_by: string;
  submitted_at: string;
  status: 'pending' | 'completed' | 'rejected';
  reference_tracks: string[];
  description: string;
  example_videos: string[];
  priority: 'low' | 'medium' | 'high';
  estimated_completion?: string;
  completed_track?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type RequestStatus = CustomRequest['status'];
export type RequestPriority = CustomRequest['priority'];