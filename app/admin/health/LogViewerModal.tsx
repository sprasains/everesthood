import { useLogViewerModal } from '../../../src/hooks/useLogViewerModal';

export default function LogViewerModal({ log, onClose }: any) {
  const { selectedLog, setSelectedLog } = useLogViewerModal();
  if (!log && !selectedLog) return null;
  const displayLog = log || selectedLog;
  return (
    <div style={{ border: '1px solid #ccc', padding: 16, background: '#fff' }}>
      <h2>Log Viewer</h2>
      <pre>{JSON.stringify(displayLog, null, 2)}</pre>
      <button onClick={() => { setSelectedLog(null); onClose && onClose(); }}>Close</button>
    </div>
  );
} 