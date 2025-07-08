'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircledIcon } from '@radix-ui/react-icons';

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
        const response = await fetch('/api/v1/agent-instances');
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
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Agent Instances</h1>
        <Link href="/agents/templates/create">
          <Button>
            <PlusCircledIcon className="mr-2 h-4 w-4" /> Create New Agent
          </Button>
        </Link>
      </div>

      {agentInstances.length === 0 ? (
        <div className="text-center text-gray-500 mt-12">
          <p className="mb-4">You haven&apos;t created any agent instances yet.</p>
          <Link href="/agents/templates/create">
            <Button variant="outline">Start by creating one!</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agentInstances.map((instance) => (
            <Card key={instance.id}>
              <CardHeader>
                <CardTitle>{instance.name}</CardTitle>
                <p className="text-sm text-gray-500">Template: {instance.template.name}</p>
              </CardHeader>
              <CardContent>
                <Link href={`/agents/${instance.id}`}>
                  <Button variant="outline">Configure</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
