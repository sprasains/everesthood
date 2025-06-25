"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import { Box, Container, Typography, CircularProgress, Grid, Paper, TextField, Button } from "@mui/material";
import Link from "next/link";

export default function CareersPage() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJobs = async () => {
            const res = await fetch('/api/v1/jobs');
            if(res.ok) setJobs(await res.json());
            setLoading(false);
        };
        fetchJobs();
    }, []);

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "#0f2027", color: "white" }}>
            <Navbar />
            <Container maxWidth="lg" sx={{ pt: 12, pb: 6 }}>
                <Typography variant="h3" fontWeight="bold" sx={{ mb: 4 }}>Opportunities</Typography>
                {/* Add search and filter text fields here */}
                {loading ? <CircularProgress /> : (
                    <Grid container spacing={3}>
                        {jobs.map(job => (
                            <Grid item xs={12} md={6} lg={4} key={job.id}>
                                <Link href={`/careers/${job.id}`} style={{ textDecoration: 'none' }}>
                                    <Paper sx={{ p: 3, height: '100%', bgcolor: 'rgba(255,255,255,0.05)' }}>
                                        <Typography variant="h6" fontWeight="bold">{job.title}</Typography>
                                        <Typography color="text.secondary">{job.company.name}</Typography>
                                        <Typography>{job.location}</Typography>
                                    </Paper>
                                </Link>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Container>
        </Box>
    );
}
