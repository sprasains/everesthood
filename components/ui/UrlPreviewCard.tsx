import React from 'react';
import { Card, CardContent, CardMedia, Typography, Link as MuiLink, CircularProgress, Box } from '@mui/material';
import { NodeViewProps } from '@tiptap/react';

const UrlPreviewCard: React.FC<NodeViewProps> = ({ node }) => {
  const { title, description, image, url, loading, error } = node.attrs || {};

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 100, mb: 2 }}>
        <CircularProgress size={32} />
        <Typography sx={{ ml: 2 }}>Loading preview...</Typography>
      </Box>
    );
  }
  if (error) {
    return (
      <Card sx={{ mb: 2, maxWidth: 420, bgcolor: 'error.light', color: 'error.contrastText' }}>
        <CardContent>
          <Typography variant="body2">Failed to load preview: {error}</Typography>
          <MuiLink href={url} target="_blank" rel="noopener noreferrer" underline="hover" sx={{ fontWeight: 'bold', fontSize: 16 }}>
            {url}
          </MuiLink>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', mb: 2, maxWidth: 420 }}>
      {image && (
        <CardMedia
          component="img"
          image={image}
          alt={title || url}
          sx={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 2, m: 1 }}
        />
      )}
      <CardContent sx={{ flex: 1, minWidth: 0 }}>
        <MuiLink href={url} target="_blank" rel="noopener noreferrer" underline="hover" sx={{ fontWeight: 'bold', fontSize: 16 }}>
          {title || url}
        </MuiLink>
        {description && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxHeight: 40, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {description}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default UrlPreviewCard; 