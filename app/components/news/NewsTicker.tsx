"use client";
import { useQuery } from '@tanstack/react-query';
import { Box, Typography, Paper, Link as MuiLink, Chip } from '@mui/material';
import { keyframes } from '@mui/system';

// Define the scrolling animation using keyframes
const marquee = keyframes`
  0% { transform: translateX(0%); }
  100% { transform: translateX(-50%); }
`;

const fetchNews = async () => {
    const res = await fetch('/api/v1/news');
    if (!res.ok) throw new Error('Failed to fetch news');
    // We only need a few articles for a ticker
    const data = await res.json();
    return data.slice(0, 15); // Get the latest 15 articles
}

export default function NewsTicker() {
    const { data: articles, isLoading, error } = useQuery({ queryKey: ['tickerNews'], queryFn: fetchNews });

    if (isLoading || error || !articles || articles.length === 0) {
        // Don't render anything if there's no data or an error
        return null;
    }

    // Duplicate the articles array to create a seamless loop for the animation
    const doubledArticles = [...articles, ...articles];

    return (
        <Paper
            elevation={2}
            sx={{
                p: 2,
                borderRadius: 3,
                height: '100%',
                overflow: 'hidden', // This is crucial to hide the overflowing content
                position: 'relative',
                '&:hover .marquee-content': {
                    animationPlayState: 'paused', // Pause animation on hover
                },
            }}
        >
            <Typography variant="h6" fontWeight="bold" gutterBottom>
                Latest Headlines
            </Typography>
            <Box
                className="marquee-content"
                sx={{
                    display: 'flex',
                    width: '200%', // Twice the width to accommodate the duplicated content
                    animation: `${marquee} 45s linear infinite`,
                }}
            >
                {doubledArticles.map((article: any, index: number) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', whiteSpace: 'nowrap', py: 1, mr: 4 }}>
                        <Chip
                            label={article.sourceName}
                            size="small"
                            color="primary"
                            variant="filled"
                            sx={{ mr: 1.5, fontWeight: 'bold' }}
                        />
                        <MuiLink
                            href={article.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            underline="hover"
                            color="inherit"
                            variant="body1"
                        >
                            {article.title}
                        </MuiLink>
                    </Box>
                ))}
            </Box>
        </Paper>
    );
}
