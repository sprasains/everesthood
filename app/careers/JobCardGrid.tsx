"use client";
import React from "react";
import { Card, CardActionArea, CardMedia, CardContent, Typography, Box, Button } from '@mui/material';
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

export const JobCardGrid = ({ job, onSalary }: { job: Job; onSalary: () => void }) => {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 4, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
      <CardActionArea href={job.job_apply_link} target="_blank" rel="noopener noreferrer" sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <CardMedia
          component="img"
          image={job.employer_logo || '/default-news-image.jpg'}
          alt={job.employer_name}
          sx={{ height: 180, objectFit: 'cover', width: '100%' }}
        />
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {job.employer_name}
          </Typography>
          <Typography variant="h6" component="h3" fontWeight="bold" sx={{ mb: 1 }}>
            {job.job_title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', overflow: 'hidden', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2 }}>
            {job.job_city || job.job_state || 'Remote'}
          </Typography>
        </CardContent>
      </CardActionArea>
      <Box sx={{ display: 'flex', gap: 1, p: 2, pt: 0 }}>
        <Button
          href={job.job_apply_link}
          target="_blank"
          rel="noopener noreferrer"
          variant="contained"
          size="small"
          endIcon={<ArrowForwardIcon />}
          sx={{ flex: 1 }}
        >
          Apply Now
        </Button>
        <Button
          onClick={onSalary}
          variant="outlined"
          size="small"
          sx={{ flex: 1 }}
        >
          Estimate Salary
        </Button>
      </Box>
    </Card>
  );
};

export default JobCardGrid; 