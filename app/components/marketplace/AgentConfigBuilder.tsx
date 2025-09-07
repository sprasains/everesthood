"use client";
import { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Stack, Button, TextField, FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel, Chip, Accordion, AccordionSummary, AccordionDetails, Alert, Divider } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SaveIcon from '@mui/icons-material/Save';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SettingsIcon from '@mui/icons-material/Settings';
import CodeIcon from '@mui/icons-material/Code';
import { toast } from 'react-hot-toast';

interface AgentConfig {
  id?: string;
  name: string;
  description: string;
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
}

interface AgentConfigBuilderProps {
  templateId?: string;
  agentId?: string;
  onSave?: (config: AgentConfig) => void;
  onTest?: (config: AgentConfig) => void;
  initialConfig?: Partial<AgentConfig>;
}

const availableModels = [
  'gpt-4',
  'gpt-4-turbo',
  'gpt-3.5-turbo',
  'claude-3-opus',
  'claude-3-sonnet',
  'claude-3-haiku',
  'gemini-pro',
  'llama-2-70b'
];

const availableTools = [
  'web_search',
  'file_operations',
  'email_sender',
  'calendar_integration',
  'database_query',
  'api_caller',
  'image_generator',
  'code_executor',
  'data_analyzer',
  'pdf_processor',
  'spreadsheet_editor',
  'social_media_poster'
];

const webhookEvents = [
  'run_started',
  'run_completed',
  'run_failed',
  'run_cancelled',
  'schedule_triggered',
  'limit_exceeded'
];

export default function AgentConfigBuilder({ 
  templateId, 
  agentId, 
  onSave, 
  onTest, 
  initialConfig 
}: AgentConfigBuilderProps) {
  const [config, setConfig] = useState<AgentConfig>({
    name: '',
    description: '',
    prompt: '',
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2000,
    tools: [],
    schedule: {
      enabled: false,
      cron: '0 9 * * *',
      timezone: 'UTC'
    },
    webhooks: {
      enabled: false,
      url: '',
      events: []
    },
    notifications: {
      enabled: false,
      email: false,
      slack: false,
      webhook: false
    },
    limits: {
      maxRunsPerDay: 100,
      maxRunsPerHour: 10,
      timeoutSeconds: 300
    },
    environment: {},
    ...initialConfig
  });

  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(['basic', 'model']);

  useEffect(() => {
    if (templateId) {
      loadTemplate();
    } else if (agentId) {
      loadAgent();
    }
  }, [templateId, agentId]);

  const loadTemplate = async () => {
    try {
      const response = await fetch(`/api/v1/agents/templates/${templateId}`);
      if (!response.ok) throw new Error('Failed to load template');
      const template = await response.json();
      
      setConfig(prev => ({
        ...prev,
        name: template.name || '',
        description: template.description || '',
        prompt: template.defaultPrompt || '',
        model: template.defaultModel || 'gpt-4',
        tools: template.defaultTools || []
      }));
    } catch (error) {
      console.error('Error loading template:', error);
      toast.error('Failed to load template');
    }
  };

  const loadAgent = async () => {
    try {
      const response = await fetch(`/api/v1/agents/instances/${agentId}`);
      if (!response.ok) throw new Error('Failed to load agent');
      const agent = await response.json();
      
      setConfig(prev => ({
        ...prev,
        ...agent.config
      }));
    } catch (error) {
      console.error('Error loading agent:', error);
      toast.error('Failed to load agent');
    }
  };

  const handleConfigChange = (key: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleNestedConfigChange = (parentKey: string, childKey: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [parentKey]: {
        ...prev[parentKey as keyof AgentConfig],
        [childKey]: value
      }
    }));
  };

  const handleSave = async () => {
    if (!config.name.trim() || !config.prompt.trim()) {
      toast.error('Please fill in required fields');
      return;
    }

    setLoading(true);
    try {
      if (onSave) {
        onSave(config);
      } else {
        const url = agentId 
          ? `/api/v1/agents/instances/${agentId}`
          : '/api/v1/agents/instances';
        
        const method = agentId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(config)
        });

        if (!response.ok) throw new Error('Failed to save agent');
        
        toast.success('Agent saved successfully!');
      }
    } catch (error) {
      console.error('Error saving agent:', error);
      toast.error('Failed to save agent');
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    if (!config.prompt.trim()) {
      toast.error('Please provide a prompt to test');
      return;
    }

    setTesting(true);
    try {
      if (onTest) {
        onTest(config);
      } else {
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

        if (!response.ok) throw new Error('Test failed');
        
        const result = await response.json();
        toast.success('Test completed successfully!');
        console.log('Test result:', result);
      }
    } catch (error) {
      console.error('Error testing agent:', error);
      toast.error('Test failed');
    } finally {
      setTesting(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <SettingsIcon />
        Agent Configuration
      </Typography>

      <Stack spacing={3}>
        {/* Basic Configuration */}
        <Accordion 
          expanded={expandedSections.includes('basic')}
          onChange={() => toggleSection('basic')}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Basic Configuration</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Agent Name"
                value={config.name}
                onChange={(e) => handleConfigChange('name', e.target.value)}
                required
                helperText="Give your agent a descriptive name"
              />

              <TextField
                fullWidth
                label="Description"
                value={config.description}
                onChange={(e) => handleConfigChange('description', e.target.value)}
                multiline
                rows={2}
                helperText="Brief description of what this agent does"
              />

              <TextField
                fullWidth
                label="System Prompt"
                value={config.prompt}
                onChange={(e) => handleConfigChange('prompt', e.target.value)}
                multiline
                rows={6}
                required
                helperText="Define the agent's behavior, personality, and capabilities"
              />
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* Model Configuration */}
        <Accordion 
          expanded={expandedSections.includes('model')}
          onChange={() => toggleSection('model')}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Model Configuration</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={3}>
              <FormControl fullWidth>
                <InputLabel>AI Model</InputLabel>
                <Select
                  value={config.model}
                  label="AI Model"
                  onChange={(e) => handleConfigChange('model', e.target.value)}
                >
                  {availableModels.map(model => (
                    <MenuItem key={model} value={model}>{model}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Temperature: {config.temperature}
                </Typography>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={config.temperature}
                  onChange={(e) => handleConfigChange('temperature', parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
                <Typography variant="caption" color="text.secondary">
                  Controls randomness (0 = deterministic, 2 = very creative)
                </Typography>
              </Box>

              <TextField
                fullWidth
                label="Max Tokens"
                type="number"
                value={config.maxTokens}
                onChange={(e) => handleConfigChange('maxTokens', parseInt(e.target.value))}
                helperText="Maximum number of tokens in the response"
              />
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* Tools Configuration */}
        <Accordion 
          expanded={expandedSections.includes('tools')}
          onChange={() => toggleSection('tools')}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Tools & Capabilities</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Available Tools
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {availableTools.map(tool => (
                  <Chip
                    key={tool}
                    label={tool}
                    clickable
                    color={config.tools.includes(tool) ? 'primary' : 'default'}
                    onClick={() => {
                      const newTools = config.tools.includes(tool)
                        ? config.tools.filter(t => t !== tool)
                        : [...config.tools, tool];
                      handleConfigChange('tools', newTools);
                    }}
                  />
                ))}
              </Box>
              <Typography variant="caption" color="text.secondary">
                Click tools to enable/disable them for this agent
              </Typography>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Schedule Configuration */}
        <Accordion 
          expanded={expandedSections.includes('schedule')}
          onChange={() => toggleSection('schedule')}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Scheduling</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={3}>
              <FormControlLabel
                control={
                  <Switch
                    checked={config.schedule?.enabled || false}
                    onChange={(e) => handleNestedConfigChange('schedule', 'enabled', e.target.checked)}
                  />
                }
                label="Enable Scheduled Runs"
              />

              {config.schedule?.enabled && (
                <>
                  <TextField
                    fullWidth
                    label="Cron Expression"
                    value={config.schedule?.cron || ''}
                    onChange={(e) => handleNestedConfigChange('schedule', 'cron', e.target.value)}
                    helperText="e.g., '0 9 * * *' for daily at 9 AM"
                  />

                  <FormControl fullWidth>
                    <InputLabel>Timezone</InputLabel>
                    <Select
                      value={config.schedule?.timezone || 'UTC'}
                      label="Timezone"
                      onChange={(e) => handleNestedConfigChange('schedule', 'timezone', e.target.value)}
                    >
                      <MenuItem value="UTC">UTC</MenuItem>
                      <MenuItem value="America/New_York">Eastern Time</MenuItem>
                      <MenuItem value="America/Chicago">Central Time</MenuItem>
                      <MenuItem value="America/Denver">Mountain Time</MenuItem>
                      <MenuItem value="America/Los_Angeles">Pacific Time</MenuItem>
                    </Select>
                  </FormControl>
                </>
              )}
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* Limits Configuration */}
        <Accordion 
          expanded={expandedSections.includes('limits')}
          onChange={() => toggleSection('limits')}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Usage Limits</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Max Runs Per Day"
                type="number"
                value={config.limits?.maxRunsPerDay || 100}
                onChange={(e) => handleNestedConfigChange('limits', 'maxRunsPerDay', parseInt(e.target.value))}
              />

              <TextField
                fullWidth
                label="Max Runs Per Hour"
                type="number"
                value={config.limits?.maxRunsPerHour || 10}
                onChange={(e) => handleNestedConfigChange('limits', 'maxRunsPerHour', parseInt(e.target.value))}
              />

              <TextField
                fullWidth
                label="Timeout (seconds)"
                type="number"
                value={config.limits?.timeoutSeconds || 300}
                onChange={(e) => handleNestedConfigChange('limits', 'timeoutSeconds', parseInt(e.target.value))}
              />
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* Environment Variables */}
        <Accordion 
          expanded={expandedSections.includes('environment')}
          onChange={() => toggleSection('environment')}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Environment Variables</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Alert severity="info" sx={{ mb: 2 }}>
              Environment variables are available to your agent during execution
            </Alert>
            <Stack spacing={2}>
              {Object.entries(config.environment || {}).map(([key, value], index) => (
                <Box key={index} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <TextField
                    label="Key"
                    value={key}
                    onChange={(e) => {
                      const newEnv = { ...config.environment };
                      delete newEnv[key];
                      newEnv[e.target.value] = value;
                      handleConfigChange('environment', newEnv);
                    }}
                    size="small"
                  />
                  <TextField
                    label="Value"
                    value={value}
                    onChange={(e) => {
                      const newEnv = { ...config.environment };
                      newEnv[key] = e.target.value;
                      handleConfigChange('environment', newEnv);
                    }}
                    size="small"
                  />
                  <Button
                    size="small"
                    color="error"
                    onClick={() => {
                      const newEnv = { ...config.environment };
                      delete newEnv[key];
                      handleConfigChange('environment', newEnv);
                    }}
                  >
                    Remove
                  </Button>
                </Box>
              ))}
              <Button
                variant="outlined"
                onClick={() => {
                  const newEnv = { ...config.environment, '': '' };
                  handleConfigChange('environment', newEnv);
                }}
              >
                Add Variable
              </Button>
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* Action Buttons */}
        <Card sx={{ p: 3 }}>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="outlined"
              startIcon={<CodeIcon />}
              onClick={handleTest}
              disabled={testing || !config.prompt.trim()}
            >
              {testing ? 'Testing...' : 'Test Agent'}
            </Button>
            
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={loading || !config.name.trim() || !config.prompt.trim()}
            >
              {loading ? 'Saving...' : 'Save Agent'}
            </Button>
          </Stack>
        </Card>
      </Stack>
    </Box>
  );
}

