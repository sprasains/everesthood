"use client";
// NOTE: This disables SSR/SSG for the whole app, but is required so that ToastProvider context is always available for all pages/components using useToast.
import { Providers } from './providers';
import { Box } from '@mui/material';
import AppSidebar from '@/components/layout/AppSidebar';
import Navbar from '@/components/layout/Navbar';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0f2027' }}>
            <AppSidebar />
            <Box
              component="main"
              sx={{
                flexGrow: 1,
                ml: { md: '250px' },
                width: { xs: '100%', md: 'calc(100% - 250px)' },
              }}
            >
              <Navbar />
              {children}
            </Box>
          </Box>
        </Providers>
      </body>
    </html>
  );
}
