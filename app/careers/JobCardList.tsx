"use client";
import React from "react";
import { Card, CardMedia, CardContent, Typography, Box, Button } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

interface Job {
  job_id: string;
  job_title: string;
  employer_name: string;
  employer_logo?: string;
  job_city?: string;
  job_state?: string;
  job_apply_link: string;
}

export const JobCardList = ({ job, onSalary }: { job: Job; onSalary: () => void }) => {
  return (
    <Card sx={{ display: 'flex', mb: 2, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)', transition: 'box-shadow 0.3s', '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.12)' } }}>
      <CardMedia
        component="img"
        image={job.employer_logo || '/default-news-image.jpg'}
        alt={job.employer_name}
        sx={{ width: { xs: 100, sm: 160 }, flexShrink: 0, objectFit: 'cover' }}
      />
      <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, p: 2 }}>
        <CardContent sx={{ flex: '1 0 auto', p: '0 !important' }}>
          <Typography variant="caption" color="text.secondary">
            {job.employer_name}
          </Typography>
          <Typography component="h3" variant="h6" fontWeight="bold">
            {job.job_title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ my: 1, display: { xs: 'none', sm: '-webkit-box' }, overflow: 'hidden', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2 }}>
            {job.job_city || job.job_state || 'Remote'}
          </Typography>
        </CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', pl: 0, pb: 0, mt: 'auto', gap: 1 }}>
          <Button
            href={job.job_apply_link}
            target="_blank"
            rel="noopener noreferrer"
            variant="contained"
            size="small"
            endIcon={<ArrowForwardIcon />}
          >
            Apply Now
          </Button>
          <Button
            onClick={onSalary}
            variant="outlined"
            size="small"
          >
            Estimate Salary
          </Button>
        </Box>
      </Box>
    </Card>
  );
};

export default JobCardList; 