"use client";
import React, { useEffect, useState } from "react";
import { BriefcaseIcon, MapPinIcon, BuildingOffice2Icon, ArrowTopRightOnSquareIcon, Squares2X2Icon, Bars3Icon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { Card, CardActionArea, CardMedia, CardContent, Typography, Box, Button, Paper, Container, ToggleButton, ToggleButtonGroup, Grid, CircularProgress } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';

interface Job {
  job_id: string;
  job_title: string;
  employer_name: string;
  employer_logo?: string;
  job_city?: string;
  job_state?: string;
  job_apply_link: string;
}

const DEFAULT_LOGO = (
  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-300 dark:from-gray-700 dark:to-gray-900 rounded-full flex items-center justify-center">
    <BuildingOffice2Icon className="w-7 h-7 text-blue-400 dark:text-gray-400" />
  </div>
);

function SalaryModal({ open, onClose, jobTitle, location }: { open: boolean; onClose: () => void; jobTitle: string; location: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [salary, setSalary] = useState<any>(null);

  React.useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    setSalary(null);
    fetch(`/api/salary?job_title=${encodeURIComponent(jobTitle)}&location=${encodeURIComponent(location)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch salary");
        return res.json();
      })
      .then((data) => {
        setSalary(data.data?.[0] || null);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [open, jobTitle, location]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" aria-label="Close modal">&times;</button>
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Estimated Salary</h2>
        <div className="mb-2 text-gray-700 dark:text-gray-200 text-sm">{jobTitle} in {location}</div>
        {loading ? (
          <div className="animate-pulse h-20 bg-gray-200 dark:bg-gray-800 rounded" />
        ) : error ? (
          <div className="text-red-600 dark:text-red-400">{error}</div>
        ) : salary ? (
          <div className="space-y-2">
            <div><span className="font-semibold">Median:</span> ${salary.median_salary?.toLocaleString(undefined, { maximumFractionDigits: 0 })} {salary.salary_currency} / {salary.salary_period?.toLowerCase()}</div>
            <div><span className="font-semibold">Range:</span> ${salary.min_salary?.toLocaleString(undefined, { maximumFractionDigits: 0 })} - ${salary.max_salary?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
            <div className="text-xs text-gray-500">Source: {salary.publisher_name} ({salary.salaries_updated_at?.slice(0, 10)})</div>
            {salary.publisher_link && <a href={salary.publisher_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-xs">View on {salary.publisher_name}</a>}
          </div>
        ) : (
          <div className="text-gray-500">No salary data found.</div>
        )}
      </div>
    </div>
  );
}

function JobCardGrid({ job, onSalary }: { job: Job; onSalary: () => void }) {
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
}

function JobCardList({ job, onSalary }: { job: Job; onSalary: () => void }) {
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