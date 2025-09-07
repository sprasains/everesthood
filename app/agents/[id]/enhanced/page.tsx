"use client";
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Box, Typography, Tabs, Tab, Card, CardContent, Stack, Chip, Button, Alert } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import MonitorIcon from '@mui/icons-material/Monitor';
import HistoryIcon from '@mui/icons-material/History';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AgentConfigBuilder from '@/components/marketplace/AgentConfigBuilder';
import AgentMonitor from '@/components/marketplace/AgentMonitor';
import { toast } from 'react-hot-toast';

interface AgentInstance {
  id: string;
  name: string;
  description: string;
  templateId: string;
  template: {
    name: string;
    description: string;
    defaultPrompt: string;
    defaultModel: string;
    defaultTools: string[];
  };
  config: {
    prompt: string;
    model: string;
    temperature: number;
    maxTokens: number;
    tools: string[];
    schedule?: {
      enabled: boolean;
      cron: string;
      timezone: string;
    };
    webhooks?: {
      enabled: boolean;
      url: string;
      events: string[];
    };
    notifications?: {
      enabled: boolean;
      email: boolean;
      slack: boolean;
      webhook: boolean;
    };
    limits?: {
      maxRunsPerDay: number;
      maxRunsPerHour: number;
      timeoutSeconds: number;
    };
    environment?: Record<string, string>;
  };
  status: 'active' | 'inactive' | 'error';
  createdAt: string;
  updatedAt: string;
}

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
      id={`agent-tabpanel-${index}`}
      aria-labelledby={`agent-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function EnhancedAgentDetailPage() {
  const params = useParams();
  const agentId = typeof params?.id === 'string' ? params.id : '';
  const [agentInstance, setAgentInstance] = useState<AgentInstance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (agentId) {
      fetchAgentInstance();
    }
  }, [agentId]);

  const fetchAgentInstance = async () => {
    try {
      const response = await fetch(`/api/v1/agents/instances/${agentId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setAgentInstance(data);
    } catch (e: any) {
      setError(e.message);
      toast.error('Failed to load agent instance');
    } finally {
      setLoading(false);
    }
  };

  const handleConfigSave = async (config: any) => {
    setSaving(true);
    try {
      const response = await fetch(`/api/v1/agents/instances/${agentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config })
      });

      if (!response.ok) {
        throw new Error('Failed to save configuration');
      }

      toast.success('Configuration saved successfully!');
      fetchAgentInstance(); // Refresh the data
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast.error('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleConfigTest = async (config: any) => {
    setTesting(true);
    try {
      const response = await fetch('/api/v1/agents/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: config.prompt,
          model: config.model,
          temperature: config.temperature,
          maxTokens: config.maxTokens
        })
      });

      if (!response.ok) {
        throw new Error('Test failed');
      }

      const result = await response.json();
      toast.success('Test completed successfully!');
      console.log('Test result:', result);
    } catch (error) {
      console.error('Error testing configuration:', error);
      toast.error('Test failed');
    } finally {
      setTesting(false);
    }
  };

  const handleRunAgent = async () => {
    try {
      const response = await fetch(`/api/agents/${agentId}/runs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { message: 'Run agent with default input' }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to start agent run');
      }

      toast.success('Agent run started successfully!');
    } catch (error) {
      console.error('Error starting agent run:', error);
      toast.error('Failed to start agent run');
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Typography>Loading agent instance...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">
          Error: {error}
        </Alert>
      </Box>
    );
  }

  if (!agentInstance) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="warning">
          Agent instance not found.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Header */}
      <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #e0e0e0', p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {agentInstance.name}
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              {agentInstance.description}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Chip 
                label={agentInstance.status.toUpperCase()} 
                color={agentInstance.status === 'active' ? 'success' : agentInstance.status === 'error' ? 'error' : 'default'}
                size="small"
              />
              <Chip 
                label={`Template: ${agentInstance.template.name}`} 
                variant="outlined"
                size="small"
              />
            </Stack>
          </Box>
          
          <Button
            variant="contained"
            startIcon={<PlayArrowIcon />}
            onClick={handleRunAgent}
            size="large"
            sx={{ minWidth: 150 }}
          >
            Run Agent
          </Button>
        </Box>

        {/* Tabs */}
        <Tabs 
          value={activeTab} 
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            icon={<SettingsIcon />} 
            label="Configuration" 
            id="agent-tab-0"
            aria-controls="agent-tabpanel-0"
          />
          <Tab 
            icon={<MonitorIcon />} 
            label="Monitor" 
            id="agent-tab-1"
            aria-controls="agent-tabpanel-1"
          />
          <Tab 
            icon={<HistoryIcon />} 
            label="History" 
            id="agent-tab-2"
            aria-controls="agent-tabpanel-2"
          />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={activeTab} index={0}>
        <AgentConfigBuilder
          agentId={agentId}
          initialConfig={agentInstance.config}
          onSave={handleConfigSave}
          onTest={handleConfigTest}
        />
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <AgentMonitor
          agentId={agentId}
          agentName={agentInstance.name}
        />
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Agent History
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Created: {new Date(agentInstance.createdAt).toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Last Updated: {new Date(agentInstance.updatedAt).toLocaleString()}
            </Typography>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Recent Activity
              </Typography>
              <Typography variant="body2" color="text.secondary">
                No recent activity to display. Run the agent to see execution history.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </TabPanel>
    </Box>
  );
}

