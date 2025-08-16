import React from 'react';
export default function JsonViewer({ data }: { data: any }) {
  return <pre style={{ fontSize: 12, background: '#eee', padding: 8, borderRadius: 4 }}>{JSON.stringify(data, null, 2)}</pre>;
}
