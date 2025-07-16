"use client"
import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { SnackbarProvider } from 'notistack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import theme from '@/lib/lib/theme';
import RouteProgress from "app/components/ui/RouteProgress";
import { ToastProviderWrapper } from './components/ui/use-toast';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <ToastProviderWrapper>
      <SessionProvider>
        <RouteProgress />
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
              {children}
            </SnackbarProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SessionProvider>
    </ToastProviderWrapper>
  )
}