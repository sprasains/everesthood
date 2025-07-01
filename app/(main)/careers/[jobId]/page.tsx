"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { Box, Container, Typography, CircularProgress, Paper, Button, Divider } from "@mui/material";

export default function JobDetailPage() {
    const params = useParams();
    const jobId = params?.jobId as string | undefined;
    const [job, setJob] = useState<any>(null);

    useEffect(() => {
        // Fetch job details from a new API endpoint: /api/v1/jobs/[jobId]
        const fetchJob = async () => {
            const res = await fetch(`/api/v1/jobs/${jobId}`);
            if (res.ok) setJob(await res.json());
        };
        if (jobId) fetchJob();
    }, [jobId]);
    
    const handleApply = async () => {
        await fetch(`/api/v1/jobs/${jobId}/apply`, { method: 'POST' });
        alert('Application submitted!');
    };

    if (!job) return <CircularProgress />;

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "#0f2027", color: "white" }}>
            <Navbar />
            <Container maxWidth="md" sx={{ pt: 12, pb: 6 }}>
                <Paper sx={{ p: 4, bgcolor: 'rgba(255,255,255,0.05)' }}>
                    <Typography variant="h4" fontWeight="bold">{job.title}</Typography>
                    <Typography variant="h6" color="text.secondary">{job.company.name} - {job.location}</Typography>
                    <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.2)' }} />
                    <Typography sx={{ whiteSpace: 'pre-wrap' }}>{job.description}</Typography>
                    <Button variant="contained" size="large" sx={{ mt: 4 }} onClick={handleApply}>Apply Now</Button>
                </Paper>
            </Container>
        </Box>
    );
}
