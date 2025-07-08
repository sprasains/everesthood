import { Box } from '@mui/material';
import AppSidebar from '@/components/layout/AppSidebar';
import Navbar from '@/components/layout/Navbar';

export default function MainAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0f2027' }}>
      <AppSidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: { md: '250px' }, // Offset content by sidebar width on desktop
          width: { xs: '100%', md: 'calc(100% - 250px)' },
        }}
      >
        {/* The top Navbar can be used for user profile/logout or breadcrumbs */}
        <Navbar />
        {children}
      </Box>
    </Box>
  );
}
