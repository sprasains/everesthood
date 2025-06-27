"use client";
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Box, Typography, Paper, Button, CircularProgress, Alert, Chip, Stack } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

const fetchAiContent = async (topic: string) => {
    const response = await fetch('/api/v1/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
    });
    if (!response.ok) {
        throw new Error('Failed to fetch AI content');
    }
    return response.json();
}

export default function AiContentHub() {
    const [activeTopic, setActiveTopic] = useState<string | null>(null);

    const mutation = useMutation({
        mutationFn: fetchAiContent,
    });

    const handleGenerate = (topic: string) => {
        setActiveTopic(topic);
        mutation.mutate(topic);
    };

    return (
        <Paper elevation={4} sx={{ p: 3, borderRadius: 4, background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', color: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <AutoAwesomeIcon sx={{ fontSize: 40 }}/>
                <Typography variant="h5" component="h2" fontWeight="bold">
                    AI Content Hub
                </Typography>
            </Box>
            <Typography variant="body2" sx={{ mb: 3, color: 'rgba(255,255,255,0.8)' }}>
                Get the latest AI insights, summaries, and career advice generated on-demand by Gemini.
            </Typography>

            <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
                <Button variant={activeTopic === 'latest_news' ? 'contained' : 'outlined'} color="inherit" onClick={() => handleGenerate('latest_news')}>Latest News</Button>
                <Button variant={activeTopic === 'career_coaching' ? 'contained' : 'outlined'} color="inherit" onClick={() => handleGenerate('career_coaching')}>Career Coaching</Button>
                <Button variant={activeTopic === 'tldr_developments' ? 'contained' : 'outlined'} color="inherit" onClick={() => handleGenerate('tldr_developments')}>TLDR</Button>
            </Stack>

            <Box sx={{ minHeight: 200, p: 2, background: 'rgba(0,0,0,0.2)', borderRadius: 2 }}>
                {mutation.isPending && <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><CircularProgress color="inherit" /></Box>}
                {mutation.isError && <Alert severity="error">Could not generate content. Please try again.</Alert>}
                {mutation.isSuccess && (
                    <Stack spacing={2}>
                        {mutation.data.map((item: any, index: number) => (
                            <Box key={index}>
                                <Typography variant="h6" fontWeight="bold">{item.title || item.concept}</Typography>
                                <Typography variant="body2">{item.summary || item.description || item.significance}</Typography>
                                {item.example && <Typography variant="caption" sx={{ fontStyle: 'italic', mt: 1, display: 'block' }}>Example: {item.example}</Typography>}
                            </Box>
                        ))}
                    </Stack>
                )}
            </Box>
        </Paper>
    );
} 