export const formatDate = (isoString: string): string => {
  return new Date(isoString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-500/20 text-yellow-300';
    case 'in-progress':
      return 'bg-blue-500/20 text-blue-300';
    case 'completed':
      return 'bg-green-500/20 text-green-300';
    case 'rejected':
      return 'bg-red-500/20 text-red-300';
    default:
      return 'bg-gray-500/20 text-gray-300';
  }
};