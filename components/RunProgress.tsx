import React from 'react';
import { Box, Typography } from '@mui/material';
export default function RunProgress({ result }: { result: any }) {
  return (
    <Box mt={2} bgcolor="#e0f7fa" p={2} borderRadius={2}>
      <Typography variant="subtitle2">Test Run Result</Typography>
      <Typography variant="body2">{result?.output || 'No output'}</Typography>
    </Box>
  );
}
