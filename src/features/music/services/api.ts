export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface SubmitRequestPayload {
  referenceTracks: string[];
  description: string;
  exampleVideos: string[];
}

export const submitCustomTrackRequest = async (
  payload: SubmitRequestPayload
): Promise<ApiResponse<{ id: string }>> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    data: { id: Date.now().toString() },
    success: true,
    message: 'Request submitted successfully'
  };
};

export const fetchUserRequests = async (): Promise<ApiResponse<any[]>> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
    data: [],
    success: true
  };
};

export const updateRequestStatus = async (
  requestId: string,
  status: string
): Promise<ApiResponse<void>> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
    success: true,
    message: 'Status updated successfully'
  };
};