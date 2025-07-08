import { useBreakdownTable } from '@/hooks/useBreakdownTable';

export default function BreakdownTable({ data, onRowClick }: any) {
  const { perAgent } = useBreakdownTable();
  return (
    <div>
      <h2>Breakdown Table</h2>
      <ul>
        {perAgent.map((agent, idx) => (
          <li key={idx} onClick={() => onRowClick && onRowClick(agent.agent)}>
            {agent.agent}: {agent.success} success, {agent.error} error
          </li>
        ))}
      </ul>
    </div>
  );
} 