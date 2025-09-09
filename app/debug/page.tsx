'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Box, 
  Container, 
  Typography, 
  Tabs, 
  Tab, 
  Paper,
  Alert,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip,
  Snackbar
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Clear as ClearIcon,
  BugReport as BugReportIcon,
  Storage as StorageIcon,
  HealthAndSafety as HealthIcon,
  Assessment as AssessmentIcon,
  Code as CodeIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`debug-tabpanel-${index}`}
      aria-labelledby={`debug-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface HealthData {
  status: string;
  services: Record<string, any>;
  system: Record<string, any>;
  environment: Record<string, any>;
  metrics: Record<string, any>;
}

interface LogEntry {
  level: string;
  time: string;
  msg: string;
  [key: string]: any;
}

interface RequestLog {
  id: string;
  method: string;
  url: string;
  status: number;
  duration: number;
  timestamp: string;
  error?: string;
}

export default function DebugPage() {
  const { data: session } = useSession();
  const [tabValue, setTabValue] = useState(0);
  const [health, setHealth] = useState<HealthData | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [requests, setRequests] = useState<RequestLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' as 'success' | 'error' | 'warning' | 'info' });
  
  // Filter states
  const [logLevel, setLogLevel] = useState('error');
  const [logLimit, setLogLimit] = useState(50);
  const [dbModel, setDbModel] = useState('');
  const [dbQuery, setDbQuery] = useState('');
  const [envVars, setEnvVars] = useState<Record<string, string>>({});

  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      loadHealthData();
      loadEnvVars();
    }
  }, [session]);

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const loadHealthData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/debug/health');
      const data = await response.json();
      setHealth(data);
      showSnackbar('Health data loaded successfully', 'success');
    } catch (error) {
      console.error('Failed to load health data:', error);
      showSnackbar('Failed to load health data', 'error');
    }
    setLoading(false);
  };

  const loadLogs = async (level: string = logLevel, limit: number = logLimit) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/debug/logs?level=${level}&limit=${limit}`);
      const data = await response.json();
      setLogs(data.logs);
      showSnackbar(`Loaded ${data.logs.length} log entries`, 'success');
    } catch (error) {
      console.error('Failed to load logs:', error);
      showSnackbar('Failed to load logs', 'error');
    }
    setLoading(false);
  };

  const loadRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/debug/requests?limit=20');
      const data = await response.json();
      setRequests(data.requests);
      showSnackbar(`Loaded ${data.requests.length} requests`, 'success');
    } catch (error) {
      console.error('Failed to load requests:', error);
      showSnackbar('Failed to load requests', 'error');
    }
    setLoading(false);
  };

  const loadEnvVars = async () => {
    try {
      const response = await fetch('/api/debug/env');
      const data = await response.json();
      setEnvVars(data.environment);
    } catch (error) {
      console.error('Failed to load environment variables:', error);
    }
  };

  const executeDbQuery = async () => {
    if (!dbQuery.trim()) {
      showSnackbar('Please enter a query', 'warning');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/debug/database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: dbQuery, type: 'raw' })
      });
      const data = await response.json();
      
      if (data.error) {
        showSnackbar(`Query error: ${data.error}`, 'error');
      } else {
        showSnackbar(`Query executed successfully (${data.metrics.duration}ms)`, 'success');
        console.log('Query result:', data.result);
      }
    } catch (error) {
      console.error('Failed to execute query:', error);
      showSnackbar('Failed to execute query', 'error');
    }
    setLoading(false);
  };

  const clearLogs = async () => {
    try {
      const response = await fetch('/api/debug/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear', level: logLevel })
      });
      const data = await response.json();
      
      if (data.success) {
        showSnackbar(data.message, 'success');
        loadLogs();
      } else {
        showSnackbar('Failed to clear logs', 'error');
      }
    } catch (error) {
      console.error('Failed to clear logs:', error);
      showSnackbar('Failed to clear logs', 'error');
    }
  };

  const downloadLogs = async () => {
    try {
      const response = await fetch('/api/debug/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'download' })
      });
      const data = await response.json();
      
      if (data.success) {
        const blob = new Blob([data.content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `logs-${new Date().toISOString().split('T')[0]}.log`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        showSnackbar('Logs downloaded successfully', 'success');
      }
    } catch (error) {
      console.error('Failed to download logs:', error);
      showSnackbar('Failed to download logs', 'error');
    }
  };

  if (!session || session.user.role !== 'ADMIN') {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          Access denied. Admin privileges required.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <BugReportIcon sx={{ mr: 2, fontSize: 32 }} />
        <Typography variant="h4" component="h1">
          🔧 Debug & Troubleshooting Panel
        </Typography>
      </Box>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab icon={<HealthIcon />} label="System Health" />
          <Tab icon={<BugReportIcon />} label="Error Logs" />
          <Tab icon={<AssessmentIcon />} label="API Requests" />
          <Tab icon={<StorageIcon />} label="Database" />
          <Tab icon={<SettingsIcon />} label="Environment" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            System Health Status
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<RefreshIcon />}
            onClick={loadHealthData}
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Refresh'}
          </Button>
        </Box>
        
        {health && (
          <Grid container spacing={2}>
            {Object.entries(health.services).map(([service, status]: [string, any]) => (
              <Grid item xs={12} md={6} key={service}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {service.toUpperCase()}
                    </Typography>
                    <Chip 
                      label={status.status} 
                      color={status.status === 'healthy' ? 'success' : 
                             status.status === 'degraded' ? 'warning' : 'error'}
                      sx={{ mb: 1 }}
                    />
                    {status.latency && (
                      <Typography variant="body2" color="text.secondary">
                        Latency: {status.latency}ms
                      </Typography>
                    )}
                    {status.error && (
                      <Typography variant="body2" color="error">
                        {status.error}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {health && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              System Metrics
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Memory Usage
                    </Typography>
                    <Typography variant="body2">
                      Used: {(health.system.memory.heapUsed / 1024 / 1024).toFixed(2)} MB
                    </Typography>
                    <Typography variant="body2">
                      Total: {(health.system.memory.heapTotal / 1024 / 1024).toFixed(2)} MB
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Request Metrics
                    </Typography>
                    <Typography variant="body2">
                      Total Requests: {health.metrics.requestCount}
                    </Typography>
                    <Typography variant="body2">
                      Errors: {health.metrics.errorCount}
                    </Typography>
                    <Typography variant="body2">
                      Avg Response Time: {health.metrics.averageResponseTime}ms
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Error Logs
          </Typography>
          <FormControl sx={{ minWidth: 120, mr: 1 }}>
            <InputLabel>Level</InputLabel>
            <Select
              value={logLevel}
              label="Level"
              onChange={(e) => setLogLevel(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="error">Error</MenuItem>
              <MenuItem value="warn">Warning</MenuItem>
              <MenuItem value="info">Info</MenuItem>
              <MenuItem value="debug">Debug</MenuItem>
            </Select>
          </FormControl>
          <TextField
            type="number"
            label="Limit"
            value={logLimit}
            onChange={(e) => setLogLimit(parseInt(e.target.value))}
            sx={{ width: 100, mr: 1 }}
          />
          <Button 
            variant="outlined" 
            onClick={() => loadLogs()}
            disabled={loading}
            sx={{ mr: 1 }}
          >
            Load
          </Button>
          <Tooltip title="Download Logs">
            <IconButton onClick={downloadLogs}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Clear Logs">
            <IconButton onClick={clearLogs}>
              <ClearIcon />
            </IconButton>
          </Tooltip>
        </Box>
        
        <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Time</TableCell>
                <TableCell>Level</TableCell>
                <TableCell>Message</TableCell>
                <TableCell>Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map((log, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {new Date(log.time).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={log.level} 
                      color={log.level === 'error' ? 'error' : 
                             log.level === 'warn' ? 'warning' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{log.msg}</TableCell>
                  <TableCell>
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="caption">View Details</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <pre style={{ fontSize: '12px', overflow: 'auto' }}>
                          {JSON.stringify(log, null, 2)}
                        </pre>
                      </AccordionDetails>
                    </Accordion>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Recent API Requests
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<RefreshIcon />}
            onClick={loadRequests}
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Load Requests'}
          </Button>
        </Box>
        
        <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Time</TableCell>
                <TableCell>Method</TableCell>
                <TableCell>URL</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Error</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    {new Date(request.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={request.method} 
                      color={request.method === 'GET' ? 'success' : 
                             request.method === 'POST' ? 'primary' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{request.url}</TableCell>
                  <TableCell>
                    <Chip 
                      label={request.status} 
                      color={request.status >= 400 ? 'error' : 
                             request.status >= 300 ? 'warning' : 'success'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{request.duration}ms</TableCell>
                  <TableCell>
                    {request.error && (
                      <Typography variant="body2" color="error">
                        {request.error}
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Typography variant="h6" gutterBottom>
          Database Query Tool
        </Typography>
        <Box sx={{ mb: 2 }}>
          <FormControl sx={{ minWidth: 200, mr: 2 }}>
            <InputLabel>Model</InputLabel>
            <Select
              value={dbModel}
              label="Model"
              onChange={(e) => setDbModel(e.target.value)}
            >
              <MenuItem value="">Select Model</MenuItem>
              <MenuItem value="User">User</MenuItem>
              <MenuItem value="Post">Post</MenuItem>
              <MenuItem value="Comment">Comment</MenuItem>
              <MenuItem value="AgentTemplate">AgentTemplate</MenuItem>
              <MenuItem value="AgentInstance">AgentInstance</MenuItem>
            </Select>
          </FormControl>
          <Button 
            variant="outlined" 
            onClick={() => {
              if (dbModel) {
                setDbQuery(`SELECT * FROM "${dbModel}" LIMIT 10`);
              }
            }}
          >
            Generate Query
          </Button>
        </Box>
        <TextField
          fullWidth
          multiline
          rows={4}
          placeholder="Enter SQL query..."
          value={dbQuery}
          onChange={(e) => setDbQuery(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Button 
          variant="contained" 
          startIcon={<CodeIcon />}
          onClick={executeDbQuery}
          disabled={loading || !dbQuery.trim()}
        >
          {loading ? <CircularProgress size={20} /> : 'Execute Query'}
        </Button>
      </TabPanel>

      <TabPanel value={tabValue} index={4}>
        <Typography variant="h6" gutterBottom>
          Environment Variables
        </Typography>
        <Grid container spacing={2}>
          {Object.entries(envVars).map(([key, value]) => (
            <Grid item xs={12} md={6} key={key}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    {key}
                  </Typography>
                  <Chip 
                    label={value} 
                    color={value.includes('✅') ? 'success' : 
                           value.includes('❌') ? 'error' : 'default'}
                    sx={{ wordBreak: 'break-all' }}
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Container>
  );
}
