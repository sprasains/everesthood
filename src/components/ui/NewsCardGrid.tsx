"use client";
import { Card, CardActionArea, CardMedia, CardContent, Typography } from '@mui/material';
import { motion } from 'framer-motion';

interface NewsCardGridProps {
  article: {
    id: string;
    title: string;
    link: string;
    imageUrl?: string | null;
    sourceName: string;
    description?: string | null;
  };
}

export default function NewsCardGrid({ article }: NewsCardGridProps) {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.03 }}
      transition={{ duration: 0.3 }}
      style={{ height: '100%' }}
    >
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 4,
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        }}
      >
        <CardActionArea href={article.link} target="_blank" rel="noopener noreferrer" sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
          <CardMedia
            component="img"
            image={article.imageUrl || '/default-news-image.jpg'}
            alt={article.title}
            sx={{ 
              height: 180,
              objectFit: 'cover'
            }}
          />
          <CardContent sx={{ flexGrow: 1 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {article.sourceName}
            </Typography>
            <Typography variant="h6" component="h3" fontWeight="bold" sx={{ mb: 1 }}>
              {article.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{
              display: '-webkit-box',
              overflow: 'hidden',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 3,
            }}>
              {article.description}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </motion.div>
  );
}
