import React, { useEffect, useState } from 'react';

export default function AgentRunsPage({ params }: { params: { id: string } }) {
  const [runs, setRuns] = useState<any[]>([]);
  const [selectedRun, setSelectedRun] = useState<string | null>(null);
  const [steps, setSteps] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/agents/${params.id}/runs`).then(r => r.json()).then(setRuns);
  }, [params.id]);

  useEffect(() => {
    if (!selectedRun) return;
    const evtSource = new EventSource(`/api/agents/${params.id}/runs/${selectedRun}/stream`);
    evtSource.onmessage = e => {
      const step = JSON.parse(e.data);
      setSteps(s => [...s, step]);
    };
    return () => evtSource.close();
  }, [selectedRun, params.id]);

  return (
    <div style={{ maxWidth: 700, margin: '2rem auto', padding: 32, background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px #0002' }}>
      <h2>Agent Runs</h2>
      <div style={{ marginBottom: 24 }}>
        <b>Runs:</b>
        <ul>
          {runs.map(run => (
            <li key={run.id}>
              <button onClick={() => { setSelectedRun(run.id); setSteps([]); }} style={{ fontWeight: run.id === selectedRun ? 700 : 400 }}>
                {run.id} ({run.status})
              </button>
            </li>
          ))}
        </ul>
      </div>
      {selectedRun && (
        <div>
          <h3>Live Progress</h3>
          <ul>
            {steps.map((step, i) => (
              <li key={i}>
                <b>Step {step.index}:</b> {step.name} <br />
                <span style={{ color: step.error ? 'red' : '#059669' }}>{step.error ? `Error: ${step.error}` : 'Success'}</span>
                <pre style={{ background: '#f8fafc', padding: 8, borderRadius: 6 }}>{JSON.stringify(step.output, null, 2)}</pre>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
