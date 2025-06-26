"use client";
import { useQuery } from '@tanstack/react-query';
import { Box, Typography, Grid, CircularProgress } from '@mui/material';
import NewsCard from '../ui/NewsCard';

const fetchNews = async () => {
    const res = await fetch('/api/v1/news');
    if (!res.ok) throw new Error('Failed to fetch news');
    return res.json();
}

export default function NewsSection() {
    const { data: articles, isLoading, error } = useQuery({ queryKey: ['news'], queryFn: fetchNews });

    return (
        <Box sx={{ py: 4 }}>
            <Typography variant="h4" component="h2" fontWeight="bold" gutterBottom>
                Latest Headlines
            </Typography>
            {isLoading ? <CircularProgress /> : null}
            {error ? <Typography color="error">Could not load news.</Typography> : null}
            <Grid container spacing={3}>
                {articles?.map((article: any) => (
                    <Grid item key={article.id} xs={12} sm={6} md={3}>
                       <NewsCard article={article} />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}
