"use client";
import React, { useState } from 'react';
import { saveCredential } from '../../../../lib/credentials/store';

const providers = [
  { id: 'openai', label: 'OpenAI API Key', placeholder: 'sk-...' },
  { id: 'google', label: 'Google OAuth Token', placeholder: 'ya29....' },
  { id: 'github', label: 'GitHub Token', placeholder: 'ghp_...' },
  { id: 'slack', label: 'Slack Token', placeholder: 'xoxb-...' },
];

export default function AgentCredentialsPage({ params, user }: { params: { id: string }, user: any }) {
  const [form, setForm] = useState<{ [provider: string]: string }>({});
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      for (const provider of providers) {
        if (form[provider.id]) {
          await saveCredential({
            userId: user.id,
            agentInstanceId: params.id,
            provider: provider.id,
            payload: form[provider.id],
          });
        }
      }
      setStatus('Credentials saved securely.');
    } catch (err) {
      setStatus('Error saving credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: '2rem auto', padding: 32, background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px #0002' }}>
      <h2>Agent Credentials</h2>
      <p style={{ color: '#64748b', fontSize: 15, marginBottom: 16 }}>
        Enter credentials for each provider. <b>Only you and workers at runtime can read these credentials.</b> Credentials are encrypted at rest and never sent back to the client.
      </p>
      <form onSubmit={handleSubmit}>
        {providers.map(p => (
          <div key={p.id} style={{ marginBottom: 18 }}>
            <label htmlFor={p.id} style={{ fontWeight: 500 }}>{p.label}</label>
            <input
              id={p.id}
              type="password"
              placeholder={p.placeholder}
              value={form[p.id] || ''}
              onChange={e => setForm(f => ({ ...f, [p.id]: e.target.value }))}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #c7d2fe', fontSize: 16, marginTop: 6 }}
              autoComplete="off"
            />
          </div>
        ))}
        <button type="submit" disabled={loading} style={{ padding: '10px 24px', borderRadius: 8, background: '#6366f1', color: '#fff', fontWeight: 600, fontSize: 16, border: 'none', cursor: 'pointer' }}>
          {loading ? 'Saving...' : 'Save Credentials'}
        </button>
      </form>
      {status && <div style={{ marginTop: 18, color: status.startsWith('Error') ? 'red' : '#059669' }}>{status}</div>}
    </div>
  );
}
