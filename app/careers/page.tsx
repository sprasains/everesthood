"use client";
export const dynamic = "force-dynamic";
import React, { useEffect, useState } from "react";
import BriefcaseIcon from '@heroicons/react/24/outline/esm/BriefcaseIcon.js';
import MapPinIcon from '@heroicons/react/24/outline/esm/MapPinIcon.js';
import BuildingOffice2Icon from '@heroicons/react/24/outline/esm/BuildingOffice2Icon.js';
import ArrowTopRightOnSquareIcon from '@heroicons/react/24/outline/esm/ArrowTopRightOnSquareIcon.js';
import Squares2X2Icon from '@heroicons/react/24/outline/esm/Squares2X2Icon.js';
import Bars3Icon from '@heroicons/react/24/outline/esm/Bars3Icon.js';
import GlobeAltIcon from '@heroicons/react/24/outline/esm/GlobeAltIcon.js';
import { Card, CardActionArea, CardMedia, CardContent, Typography, Box, Button, Paper, Container, ToggleButton, ToggleButtonGroup, Grid, CircularProgress } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';
import SalaryModal from './SalaryModal';
import JobCardGrid from './JobCardGrid';
import JobCardList from './JobCardList';
import DEFAULT_LOGO from './DEFAULT_LOGO';

interface Job {
  job_id: string;
  job_title: string;
  employer_name: string;
  employer_logo?: string;
  job_city?: string;
  job_state?: string;
  job_apply_link: string;
}

export default function CareersPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [salaryModal, setSalaryModal] = useState<{ open: boolean; jobTitle: string; location: string }>({ open: false, jobTitle: '', location: '' });

  useEffect(() => {
    setLoading(true);
    fetch("/api/jobs")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch jobs");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setJobs(data);
        } else if (Array.isArray(data.jobs)) {
          setJobs(data.jobs);
        } else {
          setJobs([]);
          setError(data.error || "Unknown error");
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setJobs([]);
        setLoading(false);
      });
  }, []);

  return (
    <Container maxWidth="lg" sx={{ pt: { xs: 4, md: 6 }, pb: 6 }}>
      <Paper elevation={4} sx={{ p: { xs: 2, md: 4 }, mb: 4, bgcolor: 'background.paper', borderRadius: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h3" fontWeight="bold" color="primary" sx={{ mb: 0 }}>
            AI Career Opportunities
          </Typography>
          <ToggleButtonGroup
            value={view}
            exclusive
            onChange={(_, v) => v && setView(v)}
            aria-label="layout"
          >
            <ToggleButton value="grid" aria-label="grid view"><ViewModuleIcon /></ToggleButton>
            <ToggleButton value="list" aria-label="list view"><ViewListIcon /></ToggleButton>
          </ToggleButtonGroup>
        </Box>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}><CircularProgress /></Box>
        ) : error ? (
          <Box display="flex" flexDirection="column" alignItems="center" py={8}>
            <Typography color="error" variant="h6">{error}</Typography>
          </Box>
        ) : jobs.length === 0 ? (
          <Box display="flex" flexDirection="column" alignItems="center" py={8}>
            <Typography color="text.secondary" variant="h6">No jobs found. Try adjusting your search or filters.</Typography>
          </Box>
        ) : view === 'grid' ? (
          // Use Box and flexbox instead of MUI Grid for layout
          <Box display="flex" flexWrap="wrap" gap={2}>
            {jobs.map((job) => (
              <Box key={job.job_id} flexBasis={{ xs: '100%', sm: '48%', md: '31%' }} flexGrow={1} minWidth={280} maxWidth={{ xs: '100%', sm: '48%', md: '31%' }}>
                <JobCardGrid job={job} onSalary={() => setSalaryModal({ open: true, jobTitle: job.job_title, location: job.job_city || job.job_state || '' })} />
              </Box>
            ))}
          </Box>
        ) : (
          <Box>
            {jobs.map((job) => (
              <JobCardList key={job.job_id} job={job} onSalary={() => setSalaryModal({ open: true, jobTitle: job.job_title, location: job.job_city || job.job_state || '' })} />
            ))}
          </Box>
        )}
        <SalaryModal
          open={salaryModal.open}
          onClose={() => setSalaryModal({ open: false, jobTitle: '', location: '' })}
          jobTitle={salaryModal.jobTitle}
          location={salaryModal.location}
        />
      </Paper>
    </Container>
  );
}