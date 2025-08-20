"use client";
import React, { useEffect, useState } from 'react';

export default function BillingPage({ user }: { user: any }) {
  const [usage, setUsage] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [plan, setPlan] = useState<string>('');

  useEffect(() => {
    fetch('/api/billing/usage').then(r => r.json()).then(setUsage);
    fetch('/api/billing/invoices').then(r => r.json()).then(setInvoices);
    fetch('/api/billing/plan').then(r => r.json()).then(d => setPlan(d.plan));
  }, []);

  return (
    <div style={{ maxWidth: 700, margin: '2rem auto', padding: 32, background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px #0002' }}>
      <h2>Billing & Usage</h2>
      <div style={{ marginBottom: 24 }}>
        <b>Current Plan:</b> {plan}
        <button style={{ marginLeft: 16, padding: '6px 18px', borderRadius: 8, background: '#6366f1', color: '#fff', fontWeight: 600, border: 'none', cursor: 'pointer' }}>Upgrade</button>
      </div>
      <div style={{ marginBottom: 24 }}>
        <b>Usage (last 30 days):</b>
        <ul>
          {usage.map((u, i) => (
            <li key={i}>{u.date}: {u.count} units (${u.cost})</li>
          ))}
        </ul>
      </div>
      <div>
        <b>Invoices:</b>
        <ul>
          {invoices.map(inv => (
            <li key={inv.id}>{inv.issuedAt}: ${inv.amount} ({inv.status})</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
