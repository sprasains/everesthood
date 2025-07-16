"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoCircledIcon } from '@radix-ui/react-icons';

interface AgentPerformanceData {
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  awaitingInputRuns: number;
  successRate: number;
  averageRunTimeSeconds: number;
  performanceByAgent: { [key: string]: { total: number; successful: number; failed: number; avgDurationMs: number; } };
}

export default function AgentPerformancePage() {
  const [performanceData, setPerformanceData] = useState<AgentPerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPerformanceData = async () => {
      try {
        const response = await fetch('/api/v1/agent-performance');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: AgentPerformanceData = await response.json();
        setPerformanceData(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformanceData();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading performance data...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <InfoCircledIcon className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load performance data: {error}</AlertDescription>
      </Alert>
    );
  }

  if (!performanceData) {
    return <div className="text-center mt-8">No performance data available.</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Agent Performance Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Runs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{performanceData.totalRuns}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Successful Runs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{performanceData.successfulRuns}</p>
            <Progress value={performanceData.successRate} className="mt-2" />
            <p className="text-sm text-gray-500 mt-1">{performanceData.successRate.toFixed(1)}% Success Rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Run Time</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{performanceData.averageRunTimeSeconds.toFixed(2)}s</p>
            <p className="text-sm text-gray-500 mt-1">Across successful runs</p>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-2xl font-bold mb-4">Performance by Agent Template</h2>
      {Object.keys(performanceData.performanceByAgent).length === 0 ? (
        <p className="text-gray-500">No runs recorded for any agent templates yet.</p>
      ) : (
        <div className="space-y-4">
          {Object.entries(performanceData.performanceByAgent).map(([templateId, data]) => (
            <Card key={templateId}>
              <CardHeader>
                <CardTitle>{templateId}</CardTitle> {/* Ideally, fetch template name here */}
              </CardHeader>
              <CardContent className="space-y-2">
                <p>Total Runs: {data.total}</p>
                <p>Successful: {data.successful}</p>
                <p>Failed: {data.failed}</p>
                <p>Avg. Duration: {(data.avgDurationMs / 1000).toFixed(2)}s</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
