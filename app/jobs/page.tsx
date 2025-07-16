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

interface Job {
  job_id: string;
  job_title: string;
  employer_name: string;
  employer_logo?: string;
  job_city?: string;
  job_state?: string;
  job_apply_link: string;
  job_type?: string;
  job_is_remote?: boolean;
}

interface Meta {
  total: number;
  page: number;
  num_pages: number;
}

const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Internship", "Temporary"];

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

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, num_pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [query, setQuery] = useState('AI Engineer OR Machine Learning Engineer');
  const [location, setLocation] = useState('');
  const [remote, setRemote] = useState(false);
  const [jobType, setJobType] = useState('');
  const [page, setPage] = useState(1);
  const [salaryModal, setSalaryModal] = useState<{ open: boolean; jobTitle: string; location: string }>({ open: false, jobTitle: '', location: '' });

  const fetchJobs = () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({
      query,
      page: String(page),
      num_pages: '1',
    });
    if (location) params.append('location', location);
    if (remote) params.append('remote', 'true');
    if (jobType) params.append('job_type', jobType);
    fetch(`/api/jobs?${params.toString()}`)
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
        if (data.meta) setMeta(data.meta);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setJobs([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line
  }, [query, location, remote, jobType, page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchJobs();
  };

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
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 mb-10 items-end bg-white/80 dark:bg-gray-900/80 rounded-xl shadow p-6">
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Keyword</label>
            <input
              id="search"
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g. AI Engineer, Data Scientist"
              aria-label="Search jobs by keyword"
            />
          </div>
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Location</label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g. San Francisco, Remote"
              aria-label="Filter jobs by location"
            />
          </div>
          <div>
            <label htmlFor="jobType" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Job Type</label>
            <select
              id="jobType"
              value={jobType}
              onChange={e => setJobType(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              aria-label="Filter jobs by type"
            >
              <option value="">All</option>
              {JOB_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 mb-2 md:mb-0">
            <input
              id="remote"
              type="checkbox"
              checked={remote}
              onChange={e => setRemote(e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              aria-label="Remote only"
            />
            <label htmlFor="remote" className="text-sm font-medium text-gray-700 dark:text-gray-200">Remote Only</label>
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded shadow transition"
            aria-label="Search jobs"
          >
            Search
          </button>
        </form>
        <div className="mb-6 text-gray-600 dark:text-gray-300 text-sm">
          {meta.total > 0 && (
            <span>Showing page {meta.page} of {Math.ceil(meta.total / 10) || 1} ({meta.total} jobs found)</span>
          )}
        </div>
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
          <Box display="flex" flexWrap="wrap" gap={2}>
            {jobs.map((job) => (
              <Box key={job.job_id} sx={{ flex: 1, minWidth: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(33.33% - 16px)' } }}>
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
        {/* Pagination */}
        {meta.total > 10 && (
          <div className="flex justify-center mt-10 gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold disabled:opacity-50"
              aria-label="Previous page"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-gray-700 dark:text-gray-200">Page {page} of {Math.ceil(meta.total / 10) || 1}</span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= Math.ceil(meta.total / 10)}
              className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold disabled:opacity-50"
              aria-label="Next page"
            >
              Next
            </button>
          </div>
        )}
      </Paper>
    </Container>
  );
} 