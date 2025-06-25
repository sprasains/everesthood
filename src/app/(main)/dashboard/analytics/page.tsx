"use client";
import { useState, useEffect } from "react";
import { Box, Container, Typography, CircularProgress, Grid, Paper } from "@mui/material";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

export default function AnalyticsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('/api/v1/user/analytics');
      if (res.ok) setData(await res.json());
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 20 }}><CircularProgress /></Box>;
  if (!data) return <Typography>Could not load analytics data.</Typography>;

  const knowledgeGraphData = {
    labels: Object.keys(data.knowledgeGraph),
    datasets: [{
      label: 'Topics Engaged With',
      data: Object.values(data.knowledgeGraph),
      backgroundColor: 'rgba(139, 92, 246, 0.5)',
    }],
  };
  // Logic to process trendTrajectory data would go here

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#0f2027", color: "white" }}>
      <Container maxWidth="lg" sx={{ pt: 12, pb: 6 }}>
        <Typography variant="h3" fontWeight="bold">My Signal Dashboard</Typography>
        <Grid container spacing={3} sx={{ mt: 4 }}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.05)' }}>
              <Typography variant="h6">Knowledge Graph</Typography>
              <Bar data={knowledgeGraphData} />
            </Paper>
          </Grid>
          {/* Add more grid items for other charts */}
        </Grid>
      </Container>
    </Box>
  );
}
