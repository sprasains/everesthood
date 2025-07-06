'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';

interface Tool {
  id: string;
  name: string;
  description: string;
  inputSchema: Record<string, any>;
  outputSchema: Record<string, any>;
  isPublic: boolean;
}

export default function ToolMarketplacePage() {
  const { toast } = useToast();
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchTools = async () => {
      try {
        const response = await fetch('/api/v1/tools');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Tool[] = await response.json();
        setTools(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTools();
  }, []);

  const handleViewDetails = (tool: Tool) => {
    setSelectedTool(tool);
    setIsDialogOpen(true);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading tools...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center mt-8">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Tool Marketplace</h1>
      <p className="text-lg text-gray-600 mb-8">
        Discover and integrate powerful tools to enhance your custom agents.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <Card key={tool.id}>
            <CardHeader>
              <CardTitle>{tool.name}</CardTitle>
              <CardDescription>{tool.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => handleViewDetails(tool)} variant="outline">
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedTool && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{selectedTool.name} Details</DialogTitle>
              <DialogDescription>{selectedTool.description}</DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                <div>
                  <Label>Input Schema</Label>
                  <Textarea
                    readOnly
                    value={JSON.stringify(selectedTool.inputSchema, null, 2)}
                    rows={8}
                    className="font-mono text-sm bg-gray-100"
                  />
                </div>
                <div>
                  <Label>Output Schema</Label>
                  <Textarea
                    readOnly
                    value={JSON.stringify(selectedTool.outputSchema, null, 2)}
                    rows={8}
                    className="font-mono text-sm bg-gray-100"
                  />
                </div>
                <div>
                  <Label>Publicly Available</Label>
                  <Switch checked={selectedTool.isPublic} disabled />
                </div>
              </div>
            </ScrollArea>
            <DialogFooter>
              <Button onClick={() => setIsDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
