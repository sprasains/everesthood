'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface ChangelogEntry {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  type?: string;
  version?: string;
  isSeen: boolean;
}

export function WhatsNewModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [changelogs, setChangelogs] = useState<ChangelogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChangelogs = async () => {
      try {
        const response = await fetch('/api/v1/changelog');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: ChangelogEntry[] = await response.json();
        setChangelogs(data);
        setLoading(false);

        const hasUnseen = data.some(log => !log.isSeen);
        if (hasUnseen) {
          setIsOpen(true);
        }
      } catch (e: any) {
        setError(e.message);
        setLoading(false);
      }
    };

    fetchChangelogs();
  }, []);

  const markAsSeen = async (id: string) => {
    try {
      await fetch('/api/v1/changelog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ changelogId: id }),
      });
      setChangelogs((prev) =>
        prev.map((log) => (log.id === id ? { ...log, isSeen: true } : log))
      );
    } catch (e) {
      console.error('Failed to mark changelog as seen', e);
    }
  };

  const handleClose = () => {
    changelogs.forEach(log => {
      if (!log.isSeen) {
        markAsSeen(log.id);
      }
    });
    setIsOpen(false);
  };

  if (loading) {
    return null; // Or a loading spinner
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  const unseenChangelogs = changelogs.filter(log => !log.isSeen);
  const seenChangelogs = changelogs.filter(log => log.isSeen);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>What&apos;s New in EverestHood!</DialogTitle>
          <DialogDescription>
            Check out the latest features, improvements, and bug fixes.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[400px] pr-4">
          {unseenChangelogs.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">New Updates</h3>
              {unseenChangelogs.map((log) => (
                <div key={log.id} className="mb-4 p-4 border rounded-md bg-blue-50/50 relative">
                  {!log.isSeen && (
                    <Badge variant="default" className="absolute top-2 right-2 bg-green-500 text-white">New</Badge>
                  )}
                  <h4 className="font-bold text-md mb-1">{log.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">{log.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{format(new Date(log.publishedAt), 'PPP')}</span>
                    {log.type && <Badge variant="secondary">{log.type}</Badge>}
                    {log.version && <Badge variant="outline">v{log.version}</Badge>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {seenChangelogs.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Previous Updates</h3>
              {seenChangelogs.map((log) => (
                <div key={log.id} className="mb-4 p-4 border rounded-md bg-gray-50/50">
                  <h4 className="font-bold text-md mb-1">{log.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">{log.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{format(new Date(log.publishedAt), 'PPP')}</span>
                    {log.type && <Badge variant="secondary">{log.type}</Badge>}
                    {log.version && <Badge variant="outline">v{log.version}</Badge>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        <Button onClick={handleClose} className="mt-4">Got it!</Button>
      </DialogContent>
    </Dialog>
  );
}
