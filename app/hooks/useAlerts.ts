import { useState } from 'react';

export function useAlerts() {
  // Mock data for demonstration
  const [alerts] = useState([
    { id: 1, type: 'error', message: 'Agent failed to execute.' },
    { id: 2, type: 'warning', message: 'High latency detected.' },
  ]);
  return alerts;
} 