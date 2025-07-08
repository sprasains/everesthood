"use client";
import { Card, CardMedia, CardContent, Typography, Box, Button, Link as MuiLink } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import NewsLikeButton from './NewsLikeButton';

interface NewsCardListProps {
  article: {
    id: string;
    title: string;
    link: string;
    imageUrl?: string | null;
    sourceName: string;
    description?: string | null;
    isLiked: boolean;
    likeCount: number;
  };
}

export default function NewsCardList({ article }: NewsCardListProps) {
  return (
    <Card
      sx={{
        display: 'flex',
        mb: 2,
        borderRadius: 3,
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        transition: 'box-shadow 0.3s ease-in-out',
        '&:hover': {
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        }
      }}
    >
      <CardMedia
        component="img"
        image={article.imageUrl || '/default-news-image.jpg'}
        alt={article.title}
        sx={{ 
          width: { xs: 100, sm: 160 },
          flexShrink: 0,
          objectFit: 'cover'
        }}
      />
      <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, p: 2 }}>
        <CardContent sx={{ flex: '1 0 auto', p: '0 !important' }}>
          <Typography variant="caption" color="text.secondary">
            {article.sourceName}
          </Typography>
          <Typography component="h3" variant="h6" fontWeight="bold">
            {article.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ 
            my: 1,
            display: { xs: 'none', sm: '-webkit-box' },
            overflow: 'hidden',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 2,
          }}>
            {article.description}
          </Typography>
        </CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', pl: 0, pb: 0, mt: 'auto', gap: 1 }}>
          <NewsLikeButton articleId={article.id} isLiked={article.isLiked} likeCount={article.likeCount} />
          <Button
            component={MuiLink}
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            variant="contained"
            size="small"
            endIcon={<ArrowForwardIcon />}
          >
            Show More
          </Button>
        </Box>
      </Box>
    </Card>
  );
}
