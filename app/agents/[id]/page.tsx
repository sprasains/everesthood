"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Box, Paper, Stack, Typography, Chip, Collapse, IconButton } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

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
    <Box sx={{ maxWidth: 900, mx: 'auto', py: 6 }}>
      <Stack direction="row" alignItems="center" spacing={2} mb={2}>
        <Typography variant="h4" fontWeight="bold">Configure Agent: {agentInstance.name}</Typography>
        <Chip label="Active" color="success" size="small" />
        {/* Add more status/config chips as needed */}
      </Stack>
      <Box sx={{ borderBottom: '1px solid #eee', mb: 4 }} />
      <Paper elevation={3} sx={{ p: 3, borderRadius: 3, mb: 4 }}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle2">Template</Typography>
            <Typography variant="body1">{agentInstance.template.name}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2">Custom Prompt</Typography>
            <Typography variant="body2">{customPrompt}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2">LLM Model</Typography>
            <Typography variant="body2">{selectedModel}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2">Webhook URL</Typography>
            <Typography variant="body2">{webhookUrl || '-'}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2">CRON Schedule</Typography>
            <Typography variant="body2">{cronSchedule || '-'}</Typography>
          </Box>
          {/* Add chaining, logs, etc. here as needed */}
        </Stack>
      </Paper>
      <Paper elevation={2} sx={{ p: 2, borderRadius: 2, mb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="subtitle2">Advanced Config (JSON)</Typography>
          <IconButton size="small" onClick={() => setShowAdvanced((v) => !v)}>
            <ExpandMoreIcon sx={{ transform: showAdvanced ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.2s' }} />
          </IconButton>
        </Stack>
        <Collapse in={showAdvanced}>
          <Box mt={2}>
            <Textarea
              id="customConfig"
              value={customConfig}
              onChange={(e) => setCustomConfig(e.target.value)}
              rows={6}
              style={{ width: '100%', fontFamily: 'monospace', fontSize: 14 }}
            />
          </Box>
        </Collapse>
      </Paper>
      <Stack direction="row" justifyContent="flex-end" spacing={2}>
        <Button onClick={handleSave} disabled={loading} variant="outline">
          {loading ? 'Saving...' : 'Save Configuration'}
        </Button>
      </Stack>
    </Box>
  );
}
