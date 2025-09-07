"use client";
import { useState, useEffect, useRef } from 'react';
import { Box, Typography, Card, CardContent, Stack, Chip, Button, LinearProgress, Alert, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface AgentRun {
  id: string;
  agentId: string;
  agentName: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  startedAt: string;
  completedAt?: string;
  duration?: number;
  input: any;
  output?: any;
  error?: string;
  logs: LogEntry[];
}

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  data?: any;
}

interface AgentMonitorProps {
  agentId: string;
  agentName: string;
  onRunComplete?: (run: AgentRun) => void;
}

export default function AgentMonitor({ agentId, agentName, onRunComplete }: AgentMonitorProps) {
  const [runs, setRuns] = useState<AgentRun[]>([]);
  const [currentRun, setCurrentRun] = useState<AgentRun | null>(null);
  const [loading, setLoading] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [selectedRun, setSelectedRun] = useState<AgentRun | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  const wsRef = useRef<WebSocket | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchRuns();
    connectWebSocket();
    
    if (autoRefresh) {
      intervalRef.current = setInterval(fetchRuns, 5000);
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [agentId, autoRefresh]);

  const connectWebSocket = () => {
    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'}/agents/${agentId}/monitor`;
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log('WebSocket connected');
    };

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleWebSocketMessage(data);
    };

    wsRef.current.onclose = () => {
      console.log('WebSocket disconnected');
      // Reconnect after 3 seconds
      setTimeout(connectWebSocket, 3000);
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  };

  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case 'run_started':
        setCurrentRun(data.run);
        setRuns(prev => [data.run, ...prev]);
        break;
      case 'run_progress':
        setCurrentRun(prev => prev ? { ...prev, progress: data.progress } : null);
        setRuns(prev => prev.map(run => 
          run.id === data.runId ? { ...run, progress: data.progress } : run
        ));
        break;
      case 'run_completed':
        setCurrentRun(null);
        setRuns(prev => prev.map(run => 
          run.id === data.runId ? { ...run, ...data.run } : run
        ));
        if (onRunComplete) {
          onRunComplete(data.run);
        }
        break;
      case 'log_entry':
        setRuns(prev => prev.map(run => 
          run.id === data.runId ? { 
            ...run, 
            logs: [...(run.logs || []), data.log] 
          } : run
        ));
        break;
    }
  };

  const fetchRuns = async () => {
    try {
      const response = await fetch(`/api/agents/${agentId}/runs`);
      if (!response.ok) throw new Error('Failed to fetch runs');
      const data = await response.json();
      setRuns(data.runs || []);
    } catch (error) {
      console.error('Error fetching runs:', error);
    }
  };

  const startRun = async (input: any) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/agents/${agentId}/runs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input })
      });

      if (!response.ok) throw new Error('Failed to start run');
      
      const data = await response.json();
      toast.success('Agent run started successfully!');
    } catch (error) {
      console.error('Error starting run:', error);
      toast.error('Failed to start agent run');
    } finally {
      setLoading(false);
    }
  };

  const stopRun = async (runId: string) => {
    try {
      const response = await fetch(`/api/agents/${agentId}/runs/${runId}/stop`, {
        method: 'POST'
      });

      if (!response.ok) throw new Error('Failed to stop run');
      
      toast.success('Agent run stopped');
    } catch (error) {
      console.error('Error stopping run:', error);
      toast.error('Failed to stop agent run');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'running': return 'primary';
      case 'failed': return 'error';
      case 'cancelled': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return '🔄';
      case 'completed': return '✅';
      case 'failed': return '❌';
      case 'cancelled': return '⏹️';
      default: return '⏳';
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const exportLogs = (run: AgentRun) => {
    const logData = {
      runId: run.id,
      agentName: run.agentName,
      status: run.status,
      startedAt: run.startedAt,
      completedAt: run.completedAt,
      duration: run.duration,
      logs: run.logs
    };

    const blob = new Blob([JSON.stringify(logData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agent-run-${run.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          🔍 {agentName} Monitor
        </Typography>
        
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchRuns}
            size="small"
          >
            Refresh
          </Button>
          
          <Button
            variant={autoRefresh ? "contained" : "outlined"}
            onClick={() => setAutoRefresh(!autoRefresh)}
            size="small"
          >
            Auto Refresh
          </Button>
        </Stack>
      </Box>

      {/* Current Run Status */}
      {currentRun && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <Card sx={{ mb: 3, border: '2px solid', borderColor: 'primary.main' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {getStatusIcon(currentRun.status)} Currently Running
                </Typography>
                <Chip 
                  label={currentRun.status.toUpperCase()} 
                  color={getStatusColor(currentRun.status) as any}
                  size="small"
                />
              </Box>
              
              <LinearProgress 
                variant="determinate" 
                value={currentRun.progress} 
                sx={{ mb: 2, height: 8, borderRadius: 4 }}
              />
              
              <Typography variant="body2" color="text.secondary">
                Progress: {currentRun.progress}% • Started: {new Date(currentRun.startedAt).toLocaleTimeString()}
              </Typography>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Runs List */}
      <Stack spacing={2}>
        <Typography variant="h6">Recent Runs</Typography>
        
        <AnimatePresence>
          {runs.map((run, index) => (
            <motion.div
              key={run.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card sx={{ 
                '&:hover': { 
                  boxShadow: 4,
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s ease'
                }
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getStatusIcon(run.status)} Run #{run.id.slice(-8)}
                      </Typography>
                      <Chip 
                        label={run.status.toUpperCase()} 
                        color={getStatusColor(run.status) as any}
                        size="small"
                      />
                    </Box>
                    
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="View Logs">
                        <IconButton 
                          size="small"
                          onClick={() => {
                            setSelectedRun(run);
                            setShowLogs(true);
                          }}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Export Logs">
                        <IconButton 
                          size="small"
                          onClick={() => exportLogs(run)}
                        >
                          <DownloadIcon />
                        </IconButton>
                      </Tooltip>
                      
                      {run.status === 'running' && (
                        <Tooltip title="Stop Run">
                          <IconButton 
                            size="small"
                            color="error"
                            onClick={() => stopRun(run.id)}
                          >
                            <StopIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Started: {new Date(run.startedAt).toLocaleString()}
                    </Typography>
                    
                    {run.duration && (
                      <Typography variant="body2" color="text.secondary">
                        Duration: {formatDuration(run.duration)}
                      </Typography>
                    )}
                  </Box>

                  {run.status === 'running' && (
                    <Box sx={{ mt: 2 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={run.progress} 
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        {run.progress}% complete
                      </Typography>
                    </Box>
                  )}

                  {run.error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      {run.error}
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </Stack>

      {runs.length === 0 && (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No runs yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Start a run to see monitoring data here
          </Typography>
        </Card>
      )}

      {/* Logs Dialog */}
      <Dialog 
        open={showLogs} 
        onClose={() => setShowLogs(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          Run Logs - {selectedRun?.id.slice(-8)}
        </DialogTitle>
        <DialogContent>
          {selectedRun && (
            <Box>
              <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>Run Details</Typography>
                <Typography variant="body2">
                  <strong>Status:</strong> {selectedRun.status} • 
                  <strong> Started:</strong> {new Date(selectedRun.startedAt).toLocaleString()} • 
                  <strong> Duration:</strong> {selectedRun.duration ? formatDuration(selectedRun.duration) : 'N/A'}
                </Typography>
              </Box>

              <Typography variant="h6" gutterBottom>Execution Logs</Typography>
              <Box sx={{ 
                maxHeight: 400, 
                overflow: 'auto', 
                bgcolor: 'black', 
                color: 'white', 
                p: 2, 
                borderRadius: 1,
                fontFamily: 'monospace',
                fontSize: '0.875rem'
              }}>
                {selectedRun.logs?.map((log, index) => (
                  <Box key={index} sx={{ mb: 1 }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: log.level === 'error' ? 'red' : 
                              log.level === 'warning' ? 'orange' : 
                              log.level === 'debug' ? 'grey' : 'white'
                      }}
                    >
                      [{new Date(log.timestamp).toLocaleTimeString()}] {log.level.toUpperCase()}: {log.message}
                    </Typography>
                  </Box>
                )) || (
                  <Typography variant="body2" color="grey">
                    No logs available
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowLogs(false)}>Close</Button>
          {selectedRun && (
            <Button 
              startIcon={<DownloadIcon />}
              onClick={() => exportLogs(selectedRun)}
            >
              Export Logs
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}

