export function useRecentFailuresTable() {
  return [
    { id: 2, status: 'ERROR', message: 'Job failed', timestamp: Date.now() - 5000 },
  ];
} 