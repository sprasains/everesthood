// PARITY: implements billing.metered.usage; see PARITY_REPORT.md#billing.metered.usage
"use client";
import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

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
        {/* Usage graph visualizes daily usage */}
        <div style={{ background: '#f9f9f9', borderRadius: 8, padding: 16, marginBottom: 8 }}>
          <Line
            data={{
              labels: usage.map((u: any) => u.date),
              datasets: [
                {
                  label: 'Units',
                  data: usage.map((u: any) => u.count),
                  borderColor: '#6366f1',
                  backgroundColor: 'rgba(99,102,241,0.1)',
                  tension: 0.3,
                  fill: true,
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false },
                title: { display: false },
              },
              scales: {
                y: { beginAtZero: true },
              },
            }}
            height={180}
          />
        </div>
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
