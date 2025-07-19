"use client";
export const dynamic = "force-dynamic";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CardComponent from '@/components/ui/CardComponent';
import { CardContent } from '@mui/material';
import { Typography, Box } from '@mui/material';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';

export default function CreateAgentTemplatePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [defaultPrompt, setDefaultPrompt] = useState('');
  const [defaultModel, setDefaultModel] = useState('gpt-4o');
  const [defaultTools, setDefaultTools] = useState(''); // Comma-separated string
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  // State to store error messages
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const toolsArray = defaultTools.split(',').map(tool => tool.trim()).filter(tool => tool.length > 0);

    try {
      const response = await fetch('/api/v1/agent-templates', {
        method: 'POST',
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
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create agent template');
      }

      const newTemplate = await response.json();
      toast({
        title: `Agent template "${newTemplate.name}" created successfully.`,
      });
      router.push(`/agents/templates`); // Redirect to the template listing page
    } catch (e: any) {
      setError(e.message);
      toast({
        title: `Failed to create template: ${e.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', py: 6 }}>
      <h1 className="text-3xl font-bold mb-6">Create New Agent Template</h1>
      {/* Show error message if present */}
      {error && (
        <Box sx={{ color: 'red', textAlign: 'center', mb: 4 }}>Error: {error}</Box>
      )}
      <Box sx={{ borderBottom: '1px solid #eee', mb: 4 }} />
      <form onSubmit={handleSubmit} className="space-y-6">
        <CardComponent>
          <Box>
            <Typography variant="h6">Template Details</Typography>
          </Box>
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
          </CardContent>
        </CardComponent>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Template'}
          </Button>
        </Box>
      </form>
    </Box>
  );
}
