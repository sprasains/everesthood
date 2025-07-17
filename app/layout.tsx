"use client";
// NOTE: This disables SSR/SSG for the whole app, but is required so that ToastProvider context is always available for all pages/components using useToast.
import { Providers } from './providers';
import { Box } from '@mui/material';
import AppSidebar from '@/components/layout/AppSidebar';
import Navbar from '@/components/layout/Navbar';
import { useUser } from '@/hooks/useUser';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
