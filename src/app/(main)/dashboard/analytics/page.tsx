"use client";
import { useQuery } from "@tanstack/react-query";
import { Box, Container, Typography, CircularProgress, Paper } from "@mui/material";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto';
import { motion } from "framer-motion";
import Grid from '@mui/material/Grid';
import { logger, newCorrelationId } from '@/services/logger';

// Fetches analytics data for the user, logs the process, and handles errors
const fetchAnalytics = async () => {
  // Start a new correlation ID for this user flow
  newCorrelationId();
  logger.info('Fetching analytics.');
  try {
    // Make the API call, passing the correlation ID for traceability
    const res = await fetch('/api/v1/user/analytics', { headers: { 'X-Correlation-ID': correlationId } });
    if (!res.ok) {
      // Log a warning if the API call fails
      logger.warn('Failed to fetch analytics.', { status: res.status });
      throw new Error('Failed to fetch analytics');
    }
    const data = await res.json();
    // Log the successful fetch
    logger.info('Fetched analytics.');
    return data;
  } catch (error: any) {
    // Log any errors
    logger.error('Error fetching analytics.', { error: error.message, stack: error.stack });
    throw error;
  }
};

export default function AnalyticsDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["analytics"],
    queryFn: fetchAnalytics,
  });

  const knowledgeGraphData = data?.knowledgeGraph ? {
    labels: Object.keys(data.knowledgeGraph),
    datasets: [{
      label: 'Topics Engaged With',
      data: Object.values(data.knowledgeGraph),
      backgroundColor: 'rgba(139, 92, 246, 0.5)',
    }],
  } : null;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#0f2027", color: "white" }}>
      <Container maxWidth="lg" sx={{ pt: 12, pb: 6 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <Typography variant="h3" fontWeight="bold">My Signal Dashboard</Typography>
          <Grid container spacing={3} sx={{ mt: 4 }}>
            <Grid key="knowledge-graph" sx={{ width: { xs: '100%', md: '50%' } }}>
              <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.05)' }}>
                <Typography variant="h6">Knowledge Graph</Typography>
                {isLoading ? <CircularProgress /> : knowledgeGraphData ? <Bar data={knowledgeGraphData} /> : <Typography color="text.secondary">No data.</Typography>}
              </Paper>
            </Grid>
            {/* Add more grid items for other charts */}
          </Grid>
        </motion.div>
      </Container>
    </Box>
  );
}
