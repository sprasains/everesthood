"use client";
import { useQuery } from "@tanstack/react-query";
import { Box, Container, Typography, CircularProgress, Grid, Paper, Button, TextField } from "@mui/material";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";

const fetchJobs = async (search: string) => {
  const params = search ? `?q=${encodeURIComponent(search)}` : "";
  const res = await fetch(`/api/v1/jobs${params}`);
  if (!res.ok) throw new Error("Failed to fetch jobs");
  return res.json();
};

export default function CareersPage() {
  const [search, setSearch] = useState("");
  const { data: jobs, isLoading } = useQuery({
    queryKey: ["jobs", search],
    queryFn: () => fetchJobs(search),
  });

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#0f2027", color: "white" }}>
      <Container maxWidth="lg" sx={{ pt: 12, pb: 6 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <Typography variant="h3" fontWeight="bold" sx={{ mb: 4 }}>Opportunities</Typography>
          <TextField
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search jobs..."
            sx={{ mb: 4, width: { xs: "100%", md: 400 } }}
            variant="outlined"
            size="small"
          />
          {isLoading ? <CircularProgress /> : (
            <Grid container spacing={3}>
              {jobs?.length > 0 ? jobs.map((job: any) => (
                <Grid key={job.id} sx={{ width: { xs: '100%', md: '50%', lg: '33.33%' } }}>
                  <Link href={`/careers/${job.id}`} style={{ textDecoration: 'none' }}>
                    <Paper sx={{ p: 3, height: '100%', bgcolor: 'rgba(255,255,255,0.05)' }}>
                      <Typography variant="h6" fontWeight="bold">{job.title}</Typography>
                      <Typography color="text.secondary">{job.company?.name}</Typography>
                      <Typography>{job.location}</Typography>
                    </Paper>
                  </Link>
                </Grid>
              )) : (
                <Grid sx={{ width: '100%' }}>
                  <Typography variant="body1" align="center">No jobs found.</Typography>
                </Grid>
              )}
            </Grid>
          )}
        </motion.div>
      </Container>
    </Box>
  );
}