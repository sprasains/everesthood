"use client";
import { useState } from "react";
import { useAdminRealtimeHealth } from '@/hooks/useAdminRealtimeHealth';
import { useExecutionLogs } from '@/hooks/useExecutionLogs';
import { useAlerts } from '@/hooks/useAlerts';
import HealthSummaryCards from './HealthSummaryCards';
import LiveChart from './LiveChart';
import BreakdownTable from './BreakdownTable';
import RecentFailuresTable from './RecentFailuresTable';
import ExportButtons from './ExportButtons';
import FilterBar from './FilterBar';
import LogViewerModal from './LogViewerModal';
import AlertBanner from './AlertBanner';

export default function HealthDashboard() {
  const [filters, setFilters] = useState({});
  const metrics = useAdminRealtimeHealth();
  const logs = useExecutionLogs(filters);
  const alerts = useAlerts();
  const [selectedLog, setSelectedLog] = useState<any>(null);

  return (
    <div className="container mx-auto py-8 px-2 md:px-8 max-w-7xl">
      <h1 className="text-3xl md:text-4xl font-extrabold mb-6 text-gradient bg-gradient-to-r from-teal-400 to-blue-600 bg-clip-text text-transparent">Agent Health Dashboard</h1>
      <AlertBanner alerts={alerts} />
      <HealthSummaryCards {...metrics} />
      <div className="flex flex-col md:flex-row md:items-end gap-4 mb-6">
        <FilterBar filters={filters} setFilters={setFilters} />
        <ExportButtons data={logs} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <LiveChart data={metrics.timeline} errorData={metrics.errorTimeline} labels={metrics.timelineLabels} />
        <BreakdownTable data={metrics.perAgent} onRowClick={agent => setFilters(f => ({ ...f, agent }))} />
      </div>
      <RecentFailuresTable data={logs.filter(l => l.status === 'ERROR')} onRowClick={setSelectedLog} />
      <LogViewerModal log={selectedLog} onClose={() => setSelectedLog(null)} />
    </div>
  );
} 