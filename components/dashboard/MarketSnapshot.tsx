import React from 'react';
import useSWR from 'swr';
import { Card, CardContent, Typography, Grid, CircularProgress, Box, Chip } from '@mui/material';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function MarketSnapshot() {
  const { data, error, isLoading } = useSWR('/api/market-health', fetcher, { refreshInterval: 60000 });

  return (
    <Card elevation={4} sx={{ borderRadius: 4, background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', color: 'white', mb: 3 }}>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Market Snapshot
        </Typography>
        {isLoading && (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={60}>
            <CircularProgress color="inherit" size={24} />
          </Box>
        )}
        {error && (
          <Typography color="error">Failed to load market data.</Typography>
        )}
        {data && Array.isArray(data) && (
          <Box sx={{
            display: 'flex',
            flexDirection: 'row',
            overflowX: { xs: 'auto', md: 'visible' },
            gap: 1,
            py: 1,
            px: 0,
            width: '100%',
            justifyContent: { xs: 'flex-start', md: 'center' },
          }}>
            {data.map((item: any) => (
              <Box key={item.symbol} sx={{
                minWidth: 90,
                maxWidth: 110,
                p: 1,
                borderRadius: 2,
                background: item.symbol.includes('USD') ? 'linear-gradient(90deg, #fbbf24, #f59e42)' : 'linear-gradient(90deg, #38bdf8, #6366f1)',
                color: 'white',
                boxShadow: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                fontSize: '0.95rem',
              }}>
                <Typography variant="subtitle2" fontWeight={600} sx={{ fontSize: '0.95rem' }}>{item.symbol}</Typography>
                <Typography variant="body1" fontWeight={700} sx={{ mt: 0.5, fontSize: '1.05rem' }}>{item.price}</Typography>
                <Chip
                  label={item.changePercent !== 'N/A' ? item.changePercent : '—'}
                  color={item.changePercent && item.changePercent.startsWith('-') ? 'error' : 'success'}
                  size="small"
                  sx={{ mt: 0.5, fontWeight: 600, bgcolor: 'rgba(255,255,255,0.15)', color: 'white', fontSize: '0.8rem', height: 22 }}
                />
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
} 