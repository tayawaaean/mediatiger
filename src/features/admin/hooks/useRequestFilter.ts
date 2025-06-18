import { useState, useMemo } from 'react';
import { CustomRequest, RequestStatus } from '../types';

type FilterStatus = RequestStatus | 'all';

export const useRequestFilter = (requests: CustomRequest[]) => {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('in-progress');

  const filteredRequests = useMemo(() => {
    return filterStatus === 'all'
      ? requests
      : requests.filter((req) => req.status === filterStatus);
  }, [requests, filterStatus]);

  return {
    filterStatus,
    setFilterStatus,
    filteredRequests,
  };
};