export function useAlertBanner() {
  return [
    { id: 1, type: 'error', message: 'Agent failed to execute.' },
    { id: 2, type: 'warning', message: 'High latency detected.' },
  ];
} 