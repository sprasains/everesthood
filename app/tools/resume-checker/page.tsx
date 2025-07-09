"use client";
import { useState } from 'react';
import { Box, Container, Typography, Button, Paper, CircularProgress } from '@mui/material';

const useRequireAuth = () => { return { user: { id: 'placeholder' } }; };

const AuthLoading = () => <div>Loading...</div>;

export default function ResumeCheckerPage() {
    const { user, loading: authLoading } = useRequireAuth();
    const [file, setFile] = useState<File | null>(null);
    const [feedback, setFeedback] = useState("");
    const [loading, setLoading] = useState(false);

    if (authLoading || !user) return <AuthLoading />;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) setFile(e.target.files[0]);
    };

    const handleSubmit = async () => {
        if (!file) return;
        setLoading(true);
        const formData = new FormData();
        formData.append('resume', file);
        // POST formData to /api/v1/resume/analyze
        // Set feedback with the result
        setLoading(false);
    };

    return (
        <Container sx={{pt: 12}}>
            <Typography variant="h4">AI Resume Vibe Check</Typography>
            <Paper sx={{p: 4, mt: 4}}>
                <Button variant="contained" component="label">
                    Upload Resume (PDF)
                    <input type="file" hidden accept=".pdf" onChange={handleFileChange} />
                </Button>
                {file && <Typography sx={{my: 2}}>Selected: {file.name}</Typography>}
                <Button onClick={handleSubmit} disabled={!file || loading}>
                    {loading ? <CircularProgress size={24} /> : "Get Feedback ($2.99)"}
                </Button>
                {feedback && <Box sx={{mt: 4, p: 2, bgcolor: 'rgba(0,0,0,0.2)'}}>{feedback}</Box>}
            </Paper>
        </Container>
    );
}
