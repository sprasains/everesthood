"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@mui/material'; // Use MUI Button for 'contained' variant
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Box, Paper, Stack, Typography, Chip, Collapse, IconButton } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useExecutionLogs } from '@/hooks/useExecutionLogs';
import CircularProgress from '@mui/material/CircularProgress';

interface AgentInstance {
  id: string;
  name: string;
  templateId: string;
  template: { // Assuming template details are included
    name: string;
    defaultPrompt: string;
    defaultModel: string;
    defaultTools: string[];
  };
  configOverride: Record<string, any> | null;
  webhookUrl?: string | null;
  nextAgentInstanceId?: string | null;
  cronSchedule?: string | null;
}

interface AgentInstanceListItem {
  id: string;
  name: string;
  template: { name: string };
}

export default function AgentInstanceDetailPage() {
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : '';
  const { toast } = useToast();
  const [agentInstance, setAgentInstance] = useState<AgentInstance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [instanceName, setInstanceName] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [nextAgent, setNextAgent] = useState<string | null>(null);
  const [customConfig, setCustomConfig] = useState<string>('{}'); // For JSON string input
  const [availableAgents, setAvailableAgents] = useState<AgentInstanceListItem[]>([]);
  const [cronSchedule, setCronSchedule] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [runStatus, setRunStatus] = useState<'IDLE' | 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED'>('IDLE');
  const [runOutput, setRunOutput] = useState<any>(null);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [runHistory, setRunHistory] = useState<any[]>([]);

  // Fetch run history for this agent instance
  useEffect(() => {
    if (!agentInstance?.id) return;
    (async () => {
      const res = await fetch(`/api/v1/agents/instances/${agentInstance.id}/runs`);
      if (res.ok) {
        const data = await res.json();
        setRunHistory(data);
      }
    })();
  }, [agentInstance?.id, jobId]);

  // Use logs for selected run or current job
  const logs = useExecutionLogs(selectedRunId || jobId);
  const logEndRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Collapsible error log line
  function CollapsibleError({ log }: { log: any }) {
    const [open, setOpen] = useState(false);
    return (
      <div>
        <Typography color="error.main" sx={{ fontFamily: 'monospace', fontSize: 14, cursor: 'pointer' }} onClick={() => setOpen(o => !o)}>
          [{log.created_at ? new Date(log.created_at).toLocaleTimeString() : ''}] [ERROR] {log.message?.split('\n')[0]} {open ? '▲' : '▼'}
        </Typography>
        {open && (
          <Box sx={{ pl: 2 }}>
            <Typography color="error.main" sx={{ fontFamily: 'monospace', fontSize: 13, whiteSpace: 'pre-wrap' }}>{log.message}</Typography>
            {log.stack && <Typography color="error.main" sx={{ fontFamily: 'monospace', fontSize: 12, whiteSpace: 'pre-wrap' }}>{log.stack}</Typography>}
          </Box>
        )}
      </div>
    );
  }

  useEffect(() => {
    if (id) {
      const fetchAgentData = async () => {
        try {
          // Fetch current agent instance details
          const instanceResponse = await fetch(`/api/v1/agents/instances/${id}`);
          if (!instanceResponse.ok) {
            throw new Error(`HTTP error! status: ${instanceResponse.status}`);
          }
          const instanceData: AgentInstance = await instanceResponse.json();
          setAgentInstance(instanceData);
          setInstanceName(instanceData.name);
          setCustomPrompt(instanceData.configOverride?.prompt || instanceData.template.defaultPrompt);
          setSelectedModel(instanceData.configOverride?.model || instanceData.template.defaultModel);
          setWebhookUrl(instanceData.webhookUrl || '');
          setNextAgent(instanceData.nextAgentInstanceId || null);
          setCustomConfig(JSON.stringify(instanceData.configOverride || {}, null, 2));
          setCronSchedule(instanceData.cronSchedule || '');

          // Fetch all available agent instances for chaining
          const agentsResponse = await fetch('/api/v1/agents/instances');
          if (!agentsResponse.ok) {
            throw new Error(`HTTP error! status: ${agentsResponse.status}`);
          }
          const agentsData: AgentInstanceListItem[] = await agentsResponse.json();
          // Filter out the current agent instance from the list of available agents for chaining
          setAvailableAgents(agentsData.filter(agent => agent.id !== id));

        } catch (e: any) {
          setError(e.message);
        } finally {
          setLoading(false);
        }
      };
      fetchAgentData();
    }
  }, [id]);

  // Simulate polling for job status/logs (replace with real-time logic later)
  useEffect(() => {
    let interval: any;
    if (jobId && isRunning) {
      setRunStatus('RUNNING');
      interval = setInterval(async () => {
        // Simulate polling job status
        const res = await fetch(`/api/agents/jobs/${jobId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'SUCCESS' || data.status === 'FAILED') {
            setRunStatus(data.status);
            setRunOutput(data.result || data.output || data.error || null);
            setIsRunning(false);
            clearInterval(interval);
          }
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [jobId, isRunning]);

  // Run Agent handler
  const handleRunAgent = async () => {
    setIsRunning(true);
    setRunError(null);
    setRunStatus('PENDING');
    setRunOutput(null);
    try {
      const res = await fetch('/api/v1/ai/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentInstanceId: agentInstance?.id,
          input: customPrompt, // or other input as needed
          mode: 'MANUAL',
        }),
      });
      if (!res.ok) throw new Error('Failed to start agent run');
      const data = await res.json();
      setJobId(data.jobId);
      setRunStatus('RUNNING');
    } catch (e: any) {
      setRunError(e.message);
      setIsRunning(false);
      setRunStatus('FAILED');
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const parsedCustomConfig = JSON.parse(customConfig);
      const configOverride = {
        ...parsedCustomConfig,
        prompt: customPrompt,
        model: selectedModel,
      };

      const response = await fetch(`/api/v1/agents/instances/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: instanceName,
          configOverride: configOverride,
          webhookUrl: webhookUrl,
          nextAgentInstanceId: nextAgent,
          cronSchedule: cronSchedule || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save agent configuration');
      }

      const updatedInstance: AgentInstance = await response.json();
      setAgentInstance(updatedInstance);
      toast({
        title: "Agent configuration saved successfully.",
      });
    } catch (e: any) {
      setError(e.message);
      toast({
        title: `Failed to save configuration: ${e.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Clear logs handler
  const handleClearLogs = () => {
    setSelectedRunId(null);
    // Optionally, clear logs from UI (not backend)
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><Typography>Loading agent configuration...</Typography></Box>;
  }

  if (error) {
    return <Box sx={{ color: 'red', textAlign: 'center', mt: 8 }}><Typography>Error: {error}</Typography></Box>;
  }

  if (!agentInstance) {
    return <Box sx={{ textAlign: 'center', mt: 8 }}><Typography>Agent instance not found.</Typography></Box>;
  }

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', py: 6 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems="flex-start">
        {/* Left: Configuration & Run Panel */}
        <Box flex={1} minWidth={0}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3, mb: 4 }}>
            <Typography variant="h5" fontWeight="bold" mb={2}>Configuration & Run</Typography>
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2">Template</Typography>
                <Typography variant="body1">{agentInstance.template.name}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2">Custom Prompt</Typography>
                <Textarea
                  id="customPrompt"
                  value={customPrompt}
                  onChange={e => setCustomPrompt(e.target.value)}
                  rows={3}
                  style={{ width: '100%' }}
                />
              </Box>
              <Box>
                <Typography variant="subtitle2">LLM Model</Typography>
                <Input
                  value={selectedModel}
                  onChange={e => setSelectedModel(e.target.value)}
                  style={{ width: '100%' }}
                />
              </Box>
              {runError && <Typography color="error">{runError}</Typography>}
              <Button
                variant="contained"
                color="primary"
                sx={{ mt: 2, fontWeight: 600 }}
                onClick={handleRunAgent}
                disabled={isRunning}
                startIcon={isRunning ? <CircularProgress size={18} color="inherit" /> : null}
              >
                {isRunning ? 'Running...' : 'Run Agent'}
              </Button>
            </Stack>
          </Paper>
        </Box>
        {/* Right: Execution History & Logs Panel */}
        <Box flex={1.2} minWidth={0}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3, mb: 4, minHeight: 400 }}>
            <Typography variant="h5" fontWeight="bold" mb={2}>Execution History & Logs</Typography>
            <Stack direction="row" spacing={2} alignItems="center" mb={2}>
              <Typography variant="subtitle2">Status: <b>{runStatus}</b></Typography>
              <Button size="small" variant="outlined" onClick={handleClearLogs}>Clear Logs</Button>
            </Stack>
            {/* Run History */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" mb={1}>Run History</Typography>
              <Box sx={{ maxHeight: 100, overflowY: 'auto', mb: 1 }}>
                {runHistory.length === 0 && <Typography color="text.secondary">No previous runs.</Typography>}
                {runHistory.map(run => (
                  <Button
                    key={run.id}
                    size="small"
                    variant={selectedRunId === run.id ? 'contained' : 'outlined'}
                    color={run.status === 'SUCCESS' ? 'success' : run.status === 'FAILED' ? 'error' : 'primary'}
                    sx={{ mr: 1, mb: 1, fontSize: 12 }}
                    onClick={() => setSelectedRunId(run.id)}
                  >
                    {new Date(run.created_at).toLocaleTimeString()} [{run.status}]
                  </Button>
                ))}
              </Box>
            </Box>
            {/* Real-time log viewer */}
            <Box sx={{ maxHeight: 260, overflowY: 'auto', mb: 2, bgcolor: '#18181b', borderRadius: 2, p: 2 }}>
              {logs.length === 0 && (
                <Typography color="text.secondary">No logs yet.</Typography>
              )}
              {logs.map((log, idx) => {
                const ts = log.created_at ? new Date(log.created_at).toLocaleTimeString() : '';
                let color = 'text.primary';
                if (log.level === 'ERROR' || log.level === 'FAILED') {
                  return <CollapsibleError key={log.id || idx} log={log} />;
                }
                else if (log.level === 'SUCCESS') color = 'success.main';
                else if (log.level === 'WARNING') color = 'warning.main';
                else if (log.level === 'INFO') color = 'info.main';
                // Multi-line logs
                const lines = (log.message || log.content || JSON.stringify(log)).split('\n');
                return lines.map((line: string, i: number) => (
                  <Typography key={log.id + '-' + i} color={color} sx={{ fontFamily: 'monospace', fontSize: 14 }}>
                    [{ts}] [{log.level || log.status || 'INFO'}] {line}
                  </Typography>
                ));
              })}
              <div ref={logEndRef} />
            </Box>
            <Typography variant="subtitle2" mb={1}>Output</Typography>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: '#23232b', color: 'white', borderRadius: 2 }}>
              {/* Output visualization logic */}
              {runOutput ? (
                Array.isArray(runOutput) ? (
                  <table className="min-w-full text-sm text-left">
                    <thead>
                      <tr>
                        {Object.keys(runOutput[0] || {}).map((key) => (
                          <th key={key} className="px-2 py-1 border-b border-gray-700">{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {runOutput.map((row: any, i: number) => (
                        <tr key={i}>
                          {Object.values(row).map((val, j) => (
                            <td key={j} className="px-2 py-1 border-b border-gray-800">{String(val)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : typeof runOutput === 'string' ? (
                  <Typography sx={{ whiteSpace: 'pre-wrap' }}>{runOutput}</Typography>
                ) : (
                  <pre style={{ margin: 0, fontSize: 14 }}>{JSON.stringify(runOutput, null, 2)}</pre>
                )
              ) : (
                <Typography color="text.secondary">No output yet.</Typography>
              )}
            </Paper>
          </Paper>
        </Box>
      </Stack>
    </Box>
  );
}
