"use client";
import { useQuery } from "@tanstack/react-query";
import { Box, Container, Typography, CircularProgress, Grid, Paper } from "@mui/material";
import { Bar } from 'react-chartjs-2';
import { motion } from "framer-motion";

const fetchAnalytics = async () => {
  const res = await fetch('/api/v1/user/analytics');
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return res.json();
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
            <Grid item xs={12} md={6}>
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
