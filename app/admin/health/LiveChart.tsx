import { useLiveChart } from '@/hooks/useLiveChart';

export default function LiveChart({ data, errorData, labels }: any) {
  const chart = useLiveChart();
  return (
    <div>
      <h2>Live Chart</h2>
      <pre>{JSON.stringify(chart, null, 2)}</pre>
    </div>
  );
} 