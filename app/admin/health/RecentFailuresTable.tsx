import { useRecentFailuresTable } from '../../../src/hooks/useRecentFailuresTable';

export default function RecentFailuresTable({ data, onRowClick }: any) {
  const failures = useRecentFailuresTable();
  return (
    <div>
      <h2>Recent Failures</h2>
      <ul>
        {failures.map((log, idx) => (
          <li key={idx} onClick={() => onRowClick && onRowClick(log)}>
            {log.message} ({log.status})
          </li>
        ))}
      </ul>
    </div>
  );
} 