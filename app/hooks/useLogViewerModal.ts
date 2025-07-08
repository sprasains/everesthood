import { useState } from 'react';

export function useLogViewerModal() {
  const [selectedLog, setSelectedLog] = useState<any>(null);
  return { selectedLog, setSelectedLog };
} 