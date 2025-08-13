// app/components/AgentCredentialForm.tsx
import React, { useState } from 'react';

export function AgentCredentialForm({ template, agentId, userId, onSuccess }: {
  template: { credentials: Record<string, { label: string, type: string }> };
  agentId: number;
  userId: string;
  onSuccess?: () => void;
}) {
  const [form, setForm] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!template.credentials) return null;

  const handleChange = (key: string, value: string) => {
    setForm(f => ({ ...f, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      for (const [provider, { label }] of Object.entries(template.credentials)) {
        const key = form[provider + '_key'];
        const secret = form[provider + '_secret'];
        if (!key || !secret) throw new Error('All fields required');
        await fetch('/api/agent-credential', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, agentId, provider, key, secret }),
        });
      }
      setLoading(false);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to save credentials');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {Object.entries(template.credentials).map(([provider, { label, type }]) => (
        <div key={provider}>
          <label>{label} Key</label>
          <input
            type={type === 'password' ? 'password' : 'text'}
            value={form[provider + '_key'] || ''}
            onChange={e => handleChange(provider + '_key', e.target.value)}
            required
          />
          <label>{label} Secret</label>
          <input
            type={type === 'password' ? 'password' : 'text'}
            value={form[provider + '_secret'] || ''}
            onChange={e => handleChange(provider + '_secret', e.target.value)}
            required
          />
        </div>
      ))}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Credentials'}</button>
    </form>
  );
}
