import useSWR from 'swr';
import { Card, CardContent, Typography, CircularProgress, Box } from '@mui/material';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function AICacheDisplay({ prompt }: { prompt: string }) {
  const { data, error, isLoading } = useSWR(`/api/ai-cache?prompt=${encodeURIComponent(prompt)}`, fetcher);

  if (isLoading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight={60}><CircularProgress size={24} /></Box>;
  if (error || data?.error) return <Typography color="error">Error loading AI content.</Typography>;

  return (
    <Card elevation={4} sx={{ borderRadius: 4, background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', color: 'white', mb: 3 }}>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          AI Content
        </Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>{data.content}</Typography>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>Provider: {data.provider}</Typography><br/>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>Cached: {new Date(data.createdAt).toLocaleString()}</Typography>
      </CardContent>
    </Card>
  );
} 