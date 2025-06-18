import { useState } from 'react';
import { CustomRequest } from '../types';

export const useRequestSelection = () => {
  const [selectedRequest, setSelectedRequest] = useState<CustomRequest | null>(null);

  const clearSelection = () => {
    setSelectedRequest(null);
  };

  return {
    selectedRequest,
    setSelectedRequest,
    clearSelection,
  };
};