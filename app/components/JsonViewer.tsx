import React from 'react';

export default function JsonViewer({ value }: { value: any }) {
  return <pre style={{ background: '#f4f4f4', padding: 12, borderRadius: 8 }}>{JSON.stringify(value, null, 2)}</pre>;
}
