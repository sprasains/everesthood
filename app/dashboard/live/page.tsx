"use client";
export const dynamic = "force-dynamic";
import { useRealtimeMetrics } from '@/hooks/useRealtimeMetrics';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Chip from '@mui/material/Chip';
import Input from '@mui/material/Input';
import Button from '@mui/material/Button';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { useSession } from 'next-auth/react';
import { useState, useMemo, ChangeEvent } from 'react';
import * as XLSX from 'xlsx'; // Excel export
import jsPDF from 'jspdf'; // PDF export
import 'jspdf-autotable';

interface AgentRunLog {
  id: string;
  agent_name: string;
  status: string;
  input: any;
  output: any;
  created_at: string;
}

// CSV Export
function exportToCSV(rows: AgentRunLog[]) {
  const header = ['Agent', 'Status', 'Input', 'Output', 'Started'];
  const csv = [
    header.join(','),
    ...rows.map((log: AgentRunLog) => [
      log.agent_name,
      log.status,
      JSON.stringify(log.input).replace(/\n|\r|,/g, ' '),
      log.output ? JSON.stringify(log.output).replace(/\n|\r|,/g, ' ') : '-',
      new Date(log.created_at).toLocaleString()
    ].join(','))
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'agent_runs.csv';
  a.click();
  URL.revokeObjectURL(url);
}

// Excel Export
function exportToExcel(rows: AgentRunLog[]) {
  const ws = XLSX.utils.json_to_sheet(
    rows.map(log => ({
      Agent: log.agent_name,
      Status: log.status,
      Input: JSON.stringify(log.input),
      Output: log.output ? JSON.stringify(log.output) : '-',
      Started: new Date(log.created_at).toLocaleString(),
    }))
  );
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'AgentRuns');
  XLSX.writeFile(wb, 'agent_runs.xlsx');
}

// PDF Export
function exportToPDF(rows: AgentRunLog[]) {
  const doc = new jsPDF();
  const tableData = rows.map(log => [
    log.agent_name,
    log.status,
    JSON.stringify(log.input),
    log.output ? JSON.stringify(log.output) : '-',
    new Date(log.created_at).toLocaleString()
  ]);
  (doc as any).autoTable({
    head: [['Agent', 'Status', 'Input', 'Output', 'Started']],
    body: tableData,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [22, 160, 133] },
  });
  doc.save('agent_runs.pdf');
}

export default function LiveDashboard() {
  const { data: session } = useSession();
  const logs: AgentRunLog[] = useRealtimeMetrics(session?.user?.id);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');

  const filtered: AgentRunLog[] = useMemo(() => logs.filter((log: AgentRunLog) => {
    const matchesStatus = status === 'ALL' || log.status === status;
    const matchesSearch =
      log.agent_name.toLowerCase().includes(search.toLowerCase()) ||
      log.status.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  }), [logs, search, status]);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value);
  const handleStatusChange = (e: SelectChangeEvent) => setStatus(e.target.value);

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-4">Live Agent Executions</h1>
      <div className="flex gap-4 mb-4 items-end">
        <div>
          <label className="block text-sm font-medium mb-1">Search</label>
          <Input
            placeholder="Agent name or status..."
            value={search}
            onChange={handleSearchChange}
            className="w-48"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <Select value={status} onChange={handleStatusChange} className="w-32">
            <MenuItem value="ALL">All</MenuItem>
            <MenuItem value="RUNNING">Running</MenuItem>
            <MenuItem value="SUCCESS">Success</MenuItem>
            <MenuItem value="ERROR">Error</MenuItem>
          </Select>
        </div>
        <Button onClick={() => exportToCSV(filtered)} className="ml-auto">Export CSV</Button>
        <Button onClick={() => exportToExcel(filtered)} className="ml-2">Export Excel</Button>
        <Button onClick={() => exportToPDF(filtered)} className="ml-2">Export PDF</Button>
      </div>
      <Table>
        <thead>
          <tr>
            <th>Agent</th>
            <th>Status</th>
            <th>Input</th>
            <th>Output</th>
            <th>Started</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((log: AgentRunLog) => (
            <tr key={log.id}>
              <td>{log.agent_name}</td>
              <td>
                <Chip label={log.status} variant={log.status === 'SUCCESS' ? 'filled' : log.status === 'ERROR' ? 'filled' : 'outlined'} />
              </td>
              <td><pre>{JSON.stringify(log.input, null, 2)}</pre></td>
              <td><pre>{log.output ? JSON.stringify(log.output, null, 2) : '-'}</pre></td>
              <td>{new Date(log.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
} 