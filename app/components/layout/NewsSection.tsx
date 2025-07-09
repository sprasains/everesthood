"use client";
import { useQuery } from '@tanstack/react-query';
import { Box, Typography, CircularProgress } from '@mui/material';
import NewsCard from '../news/NewsCard';

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
            {/* Responsive flexbox grid for news cards */}
            <Box display="flex" flexWrap="wrap" gap={3}>
                {articles?.map((article: any) => (
                    <Box key={article.id} flexBasis={{ xs: '100%', sm: '48%', md: '31%' }} flexGrow={1} minWidth={280} maxWidth={{ xs: '100%', sm: '48%', md: '31%' }}>
                        <NewsCard article={article} />
                    </Box>
                ))}
            </Box>
        </Box>
    );
}
