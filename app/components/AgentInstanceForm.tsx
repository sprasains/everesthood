// app/components/AgentInstanceForm.tsx
import React, { useState } from 'react';
import { AgentCredentialForm } from './AgentCredentialForm';

export function AgentInstanceForm({ template, userId, onCreated }: {
  template: any;
  userId: string;
  onCreated?: () => void;
}) {
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);
  const [agentId, setAgentId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      // Replace with your API call to create the agent instance
      const res = await fetch('/api/agent-instance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, templateId: template.id, userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create agent');
      setAgentId(data.agentId);
      if (!template.credentials && onCreated) onCreated();
    } catch (err: any) {
      setError(err.message || 'Failed to create agent');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleCreate}>
        <label>Agent Name</label>
        <input value={name} onChange={e => setName(e.target.value)} required />
        <button type="submit" disabled={creating}>{creating ? 'Creating...' : 'Create Agent'}</button>
        {error && <div style={{ color: 'red' }}>{error}</div>}
      </form>
      {/* Show credential form if needed and agent instance is created */}
      {template.credentials && agentId && (
        <AgentCredentialForm
          template={template}
          agentId={agentId}
          userId={userId}
          onSuccess={onCreated}
        />
      )}
    </div>
  );
}
