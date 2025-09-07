"use client";
import React, { useEffect, useState } from 'react';

type DlqItem = { id: string; name: string; data: any; attemptsMade: number; failedReason?: string; timestamp: number };

export default function DLQPage() {
  const [items, setItems] = useState<DlqItem[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/queue/dlq')
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) setItems(j.items);
        else setItems([]);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading DLQ...</div>;
  if (!items || items.length === 0) return <div>No DLQ items</div>;

  return (
    <div>
      <h2>Dead Letter Queue (DLQ)</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Attempts</th>
            <th>Failed Reason</th>
            <th>Data</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.id} style={{ borderTop: '1px solid #eee' }}>
              <td>{it.id}</td>
              <td>{it.name}</td>
              <td>{it.attemptsMade}</td>
              <td>{it.failedReason}</td>
              <td style={{ maxWidth: 400, overflow: 'auto' }}>
                <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(it.data, null, 2)}</pre>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
