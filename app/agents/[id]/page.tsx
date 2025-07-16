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

  useEffect(() => {
    if (id) {
      const fetchAgentData = async () => {
        try {
          // Fetch current agent instance details
          const instanceResponse = await fetch(`/api/v1/agent-instances/${id}`);
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
          const agentsResponse = await fetch('/api/v1/agent-instances');
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

      const response = await fetch(`/api/v1/agent-instances/${id}`, {
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
    return <div className="flex justify-center items-center h-screen">Loading agent configuration...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center mt-8">Error: {error}</div>;
  }

  if (!agentInstance) {
    return <div className="text-center mt-8">Agent instance not found.</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Configure Agent: {agentInstance.name}</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="instanceName">Instance Name</Label>
            <Input
              id="instanceName"
              value={instanceName}
              onChange={(e) => setInstanceName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="templateName">Template</Label>
            <Input id="templateName" value={agentInstance.template.name} disabled />
          </div>
          <div>
            <Label htmlFor="customPrompt">Custom Prompt</Label>
            <Textarea
              id="customPrompt"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              rows={6}
            />
          </div>
          <div>
            <Label htmlFor="selectedModel">LLM Model</Label>
            <Input
              id="selectedModel"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              placeholder="e.g., gpt-4o, claude-3-opus"
            />
          </div>
          <div>
            <Label htmlFor="webhookUrl">Webhook URL (for output)</Label>
            <Input
              id="webhookUrl"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://your-webhook-endpoint.com/"
            />
          </div>
          <div>
            <Label htmlFor="nextAgent">Run another agent on completion</Label>
            <Select
              value={nextAgent || ''}
              onValueChange={(value) => setNextAgent(value === '' ? null : value)}
            >
              <SelectTrigger id="nextAgent">
                <SelectValue placeholder="Select an agent (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {availableAgents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.name} ({agent.template.name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500 mt-2">
              Select another agent to automatically run after this agent completes successfully.
            </p>
          </div>
          <div>
            <Label htmlFor="cronSchedule">Cron Schedule</Label>
            <Input
              id="cronSchedule"
              value={cronSchedule}
              onChange={(e) => setCronSchedule(e.target.value)}
              placeholder="e.g., 0 5 * * *"
            />
            <p className="text-sm text-gray-500 mt-1">
              Set a cron expression to run this agent on a schedule (UTC). Leave blank for manual runs.<br />
              <a href="https://crontab.guru/" target="_blank" rel="noopener noreferrer" className="underline text-blue-600">Learn cron syntax</a>
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Advanced Configuration (JSON)</CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="customConfig">config_override</Label>
          <Textarea
            id="customConfig"
            value={customConfig}
            onChange={(e) => setCustomConfig(e.target.value)}
            rows={10}
            className="font-mono text-sm"
          />
          <p className="text-sm text-gray-500 mt-2">
            Enter a JSON object to override any other configuration parameters.
          </p>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={loading}>
        {loading ? 'Saving...' : 'Save Configuration'}
      </Button>
    </div>
  );
}
