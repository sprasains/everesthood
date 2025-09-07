'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Search, Users, Calendar, MessageSquare, BarChart } from 'lucide-react';

export function SearchCommand() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = (command: () => unknown) => {
    setOpen(false);
    command();
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center text-sm font-medium text-muted-foreground rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground"
      >
        <Search className="w-4 h-4 mr-2" />
        Search...
        <kbd className="ml-2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type to search across everything..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Quick Links">
            <CommandItem onSelect={() => runCommand(() => router.push('/search?type=all'))}>
              <Search className="w-4 h-4 mr-2" />
              Search Everything
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/search?type=posts'))}>
              <MessageSquare className="w-4 h-4 mr-2" />
              Search Posts
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/search?type=events'))}>
              <Calendar className="w-4 h-4 mr-2" />
              Search Events
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/search?type=users'))}>
              <Users className="w-4 h-4 mr-2" />
              Search Users
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/search?type=polls'))}>
              <BarChart className="w-4 h-4 mr-2" />
              Search Polls
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Search Tips">
            <CommandItem className="text-sm text-muted-foreground">
              Use Alt + 1-5 to switch between search types
            </CommandItem>
            <CommandItem className="text-sm text-muted-foreground">
              Use quotes for exact matches: &quot;example&quot;
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
