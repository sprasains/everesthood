import React from 'react';

export default function RunProgress({ progress }: { progress: number }) {
  return <div style={{ width: '100%', background: '#eee', borderRadius: 8 }}>
    <div style={{ width: `${progress}%`, background: '#6366f1', height: 8, borderRadius: 8 }} />
  </div>;
}
