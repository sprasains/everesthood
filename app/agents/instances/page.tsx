"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { PlusCircledIcon } from '@radix-ui/react-icons';
import { Box, Paper, Stack, Typography, Chip, Fade } from '@mui/material';

interface AgentInstanceListItem {
  id: string;
  name: string;
  template: { name: string };
}

export default function AgentInstancesPage() {
  const [agentInstances, setAgentInstances] = useState<AgentInstanceListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgentInstances = async () => {
      try {
        const response = await fetch('/api/v1/agents/instances');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: AgentInstanceListItem[] = await response.json();
        setAgentInstances(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAgentInstances();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading agent instances...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center mt-8">Error: {error}</div>;
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', py: 6 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={2} mb={4}>
        <Typography variant="h4" fontWeight="bold">Your Agent Instances</Typography>
        <Stack direction="row" spacing={1}>
          <Link href="/agents/templates">
            <Button variant="outlined">Browse Templates</Button>
          </Link>
          <Link href="/agents/templates/create">
            <Button variant="contained" startIcon={<PlusCircledIcon />}>Create New Agent</Button>
          </Link>
        </Stack>
      </Stack>
      <Box sx={{ borderBottom: '1px solid #eee', mb: 4 }} />
      {agentInstances.length === 0 ? (
        <Box sx={{ textAlign: 'center', color: 'text.secondary', mt: 12 }}>
          <Typography variant="body1" mb={2}>You haven&apos;t created any agent instances yet.</Typography>
          <Link href="/agents/templates/create">
            <Button variant="outlined">Start by creating one!</Button>
          </Link>
        </Box>
      ) : (
        <Stack direction="column" spacing={3}>
          {agentInstances.map((instance, idx) => (
            <Fade in timeout={400 + idx * 80} key={instance.id}>
              <Paper elevation={3} sx={{ p: 3, borderRadius: 3, bgcolor: 'background.paper', display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { sm: 'center' }, gap: 2, transition: 'box-shadow 0.2s', '&:hover': { boxShadow: 8 } }}>
                <Box flex={1}>
                  <Typography variant="h6" fontWeight="bold">{instance.name}</Typography>
                  <Typography variant="body2" color="text.secondary">Template: {instance.template.name}</Typography>
                  {/* Add more agentic details here as needed, e.g. status, last run, etc. */}
                </Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  {/* Example status chip, replace with real status if available */}
                  <Chip label="Active" color="success" size="small" />
                  <Link href={`/agents/${instance.id}`}>
                    <Button variant="outlined">Configure</Button>
                  </Link>
                </Stack>
              </Paper>
            </Fade>
          ))}
        </Stack>
      )}
    </Box>
  );
}
