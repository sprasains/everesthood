'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { SearchCommand } from './SearchCommand';
import { UserNav } from './UserNav';
import { ThemeToggle } from './ThemeToggle';

export function MainNav() {
  const pathname = usePathname();

  const routes = [
    {
      href: '/',
      label: 'Home',
      active: pathname === '/',
    },
    {
      href: '/feed',
      label: 'Feed',
      active: pathname === '/feed',
    },
    {
      href: '/events',
      label: 'Events',
      active: pathname.startsWith('/events'),
    },
    {
      href: '/polls',
      label: 'Polls',
      active: pathname.startsWith('/polls'),
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <span className="font-bold">EverestHood</span>
        </Link>
        <div className="mr-6 hidden md:flex">
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  'transition-colors hover:text-foreground/80',
                  route.active ? 'text-foreground' : 'text-foreground/60'
                )}
              >
                {route.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex-1" />
        <div className="flex items-center space-x-4">
          <SearchCommand />
          <UserNav />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
