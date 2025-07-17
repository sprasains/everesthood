"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Box } from '@mui/material';

interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  defaultPrompt: string;
  defaultModel: string;
  defaultTools: string[];
  isPublic: boolean;
  version: number;
  isLatest: boolean;
}

export default function EditAgentTemplatePage() {
  const params = useParams();
  // Safely extract the id parameter as a string (handles both string and array cases)
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const router = useRouter();
  const { toast } = useToast();
  const [template, setTemplate] = useState<AgentTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [defaultPrompt, setDefaultPrompt] = useState('');
  const [defaultModel, setDefaultModel] = useState('');
  const [defaultTools, setDefaultTools] = useState(''); // Comma-separated string
  const [isPublic, setIsPublic] = useState(false);
  const [createNewVersion, setCreateNewVersion] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchAgentTemplate = async () => {
        try {
          const response = await fetch(`/api/v1/agent-templates/${id}`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data: AgentTemplate = await response.json();
          setTemplate(data);
          setName(data.name);
          setDescription(data.description);
          setDefaultPrompt(data.defaultPrompt);
          setDefaultModel(data.defaultModel);
          setDefaultTools(data.defaultTools.join(', '));
          setIsPublic(data.isPublic);
        } catch (e: any) {
          setError(e.message);
        } finally {
          setLoading(false);
        }
      };
      fetchAgentTemplate();
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const toolsArray = defaultTools.split(',').map(tool => tool.trim()).filter(tool => tool.length > 0);

    try {
      const response = await fetch(`/api/v1/agent-templates/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          defaultPrompt,
          defaultModel,
          defaultTools: toolsArray,
          isPublic,
          createNewVersion,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save agent template');
      }

      const updatedTemplate: AgentTemplate = await response.json();
      setTemplate(updatedTemplate);
      toast({
        title: `Agent template "${updatedTemplate.name}" (v${updatedTemplate.version}) saved successfully.`,
      });
      // If a new version was created, redirect to its page
      if (createNewVersion) {
        router.push(`/agents/templates/${updatedTemplate.id}`);
      }
    } catch (e: any) {
      setError(e.message);
      toast({
        title: `Failed to save template: ${e.message}`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>Loading agent template...</Box>;
  }

  if (error) {
    return <Box sx={{ color: 'red', textAlign: 'center', mt: 8 }}>Error: {error}</Box>;
  }

  if (!template) {
    return <Box sx={{ textAlign: 'center', mt: 8 }}>Agent template not found.</Box>;
  }

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', py: 6 }}>
      <h1 className="text-3xl font-bold mb-6">Edit Agent Template: {template.name} (v{template.version})</h1>
      <Box sx={{ borderBottom: '1px solid #eee', mb: 4 }} />
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Template Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Template Name */}
            <Box>
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Box>
            {/* Description */}
            <Box>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </Box>
            {/* Default Prompt */}
            <Box>
              <Label htmlFor="defaultPrompt">Default Prompt</Label>
              <Textarea
                id="defaultPrompt"
                value={defaultPrompt}
                onChange={(e) => setDefaultPrompt(e.target.value)}
                rows={6}
                required
              />
            </Box>
            {/* Default LLM Model */}
            <Box>
              <Label htmlFor="defaultModel">Default LLM Model</Label>
              <Input
                id="defaultModel"
                value={defaultModel}
                onChange={(e) => setDefaultModel(e.target.value)}
                placeholder="e.g., gpt-4o, claude-3-opus"
              />
            </Box>
            {/* Default Tools */}
            <Box>
              <Label htmlFor="defaultTools">Default Tools (comma-separated)</Label>
              <Input
                id="defaultTools"
                value={defaultTools}
                onChange={(e) => setDefaultTools(e.target.value)}
                placeholder="e.g., web_search, calculator, runAgentTool"
              />
              <p className="text-sm text-gray-500 mt-1">
                List tool names separated by commas (e.g., web_search, runAgentTool).
              </p>
            </Box>
            {/* Public Switch */}
            <Box className="flex items-center space-x-2">
              <Switch
                id="isPublic"
                checked={isPublic}
                onCheckedChange={setIsPublic}
              />
              <Label htmlFor="isPublic">Make Public</Label>
              <p className="text-sm text-gray-500">
                Public templates can be used by all users.
              </p>
            </Box>
            {/* New Version Checkbox */}
            <Box className="flex items-center space-x-2">
              <Checkbox
                id="createNewVersion"
                checked={createNewVersion}
                onCheckedChange={(checked: boolean) => setCreateNewVersion(checked)}
              />
              <Label htmlFor="createNewVersion">Create New Version</Label>
              <p className="text-sm text-gray-500">
                Check this to create a new version of this template instead of updating the current one.
              </p>
            </Box>
          </CardContent>
        </Card>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Template'}
          </Button>
        </Box>
      </form>
    </Box>
  );
}
