"use client";

import { Box, Container, Typography, Paper, Grid, Card, CardContent, CardHeader, Avatar, Chip, Button, LinearProgress, Alert, AlertTitle, Fab, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem, IconButton, Tooltip, TextareaAutosize } from "@mui/material";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useUser } from "@/hooks/useUser";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AddIcon,
  SearchIcon,
  FilterListIcon,
  WorkIcon,
  LocationOnIcon,
  ScheduleIcon,
  AttachMoneyIcon,
  BusinessIcon,
  ApplyIcon,
  StarIcon,
  TrendingUpIcon,
  CheckCircleIcon,
  MoreVertIcon,
  RemoteWorkIcon,
  SchoolIcon,
  EngineeringIcon,
  DesignServicesIcon,
  AnalyticsIcon,
  SecurityIcon
} from "@mui/icons-material";

interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  requirements: string[];
  benefits: string[];
  location: string;
  remote: boolean;
  salaryMin?: number;
  salaryMax?: number;
  currency: string;
  type: string;
  level: string;
  category: string;
  tags: string[];
  isActive: boolean;
  applications: number;
  views: number;
  createdAt: string;
  expiresAt?: string;
}

export default function CareersPage() {
  const { data: session, status } = useSession();
  const { user } = useUser();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [remoteFilter, setRemoteFilter] = useState("");
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [application, setApplication] = useState({
    coverLetter: "",
    resumeUrl: "",
  });

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    fetchJobs();
  }, [session, status, router, searchTerm, categoryFilter, typeFilter, levelFilter, remoteFilter]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (categoryFilter) params.append('category', categoryFilter);
      if (typeFilter) params.append('type', typeFilter);
      if (levelFilter) params.append('level', levelFilter);
      if (remoteFilter) params.append('remote', remoteFilter);
      
      const response = await fetch(`/api/jobs?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }
      
      const data = await response.json();
      setJobs(data.jobs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!selectedJob) return;

    try {
      const response = await fetch(`/api/jobs/${selectedJob.id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(application)
      });

      if (!response.ok) {
        throw new Error('Failed to apply for job');
      }

      setApplyDialogOpen(false);
      setSelectedJob(null);
      setApplication({ coverLetter: "", resumeUrl: "" });
      fetchJobs(); // Refresh to update application count
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'engineering': return <EngineeringIcon />;
      case 'design': return <DesignServicesIcon />;
      case 'data': return <AnalyticsIcon />;
      case 'security': return <SecurityIcon />;
      case 'education': return <SchoolIcon />;
      default: return <WorkIcon />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'full-time': return 'success';
      case 'part-time': return 'info';
      case 'contract': return 'warning';
      case 'internship': return 'secondary';
      default: return 'default';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'entry': return 'info';
      case 'mid': return 'primary';
      case 'senior': return 'success';
      case 'executive': return 'warning';
      default: return 'default';
    }
  };

  const formatSalary = (job: Job) => {
    if (!job.salaryMin && !job.salaryMax) return 'Salary not specified';
    if (job.salaryMin && job.salaryMax) {
      return `${job.currency} ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}`;
    }
    if (job.salaryMin) {
      return `${job.currency} ${job.salaryMin.toLocaleString()}+`;
    }
    return `Up to ${job.currency} ${job.salaryMax?.toLocaleString()}`;
  };

  if (status === "loading" || loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
            <LinearProgress sx={{ mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Loading Careers...
            </Typography>
          </Paper>
        </motion.div>
      </Box>
    );
  }

  if (!session) {
    return null; // Will redirect
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      pt: 8, // Account for navbar
    }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography 
              variant="h3" 
              fontWeight="bold" 
              sx={{ 
                color: 'white', 
                mb: 2,
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}
            >
              Careers
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'rgba(255,255,255,0.9)',
                maxWidth: 600,
                mx: 'auto'
              }}
            >
              Find your next opportunity in AI and technology
            </Typography>
          </Box>

          {/* Search and Filters */}
          <Paper sx={{ 
            p: 3, 
            mb: 4, 
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
          }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    label="Category"
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    <MenuItem value="Engineering">Engineering</MenuItem>
                    <MenuItem value="Design">Design</MenuItem>
                    <MenuItem value="Data">Data</MenuItem>
                    <MenuItem value="Security">Security</MenuItem>
                    <MenuItem value="Education">Education</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    label="Type"
                  >
                    <MenuItem value="">All Types</MenuItem>
                    <MenuItem value="full-time">Full-time</MenuItem>
                    <MenuItem value="part-time">Part-time</MenuItem>
                    <MenuItem value="contract">Contract</MenuItem>
                    <MenuItem value="internship">Internship</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Level</InputLabel>
                  <Select
                    value={levelFilter}
                    onChange={(e) => setLevelFilter(e.target.value)}
                    label="Level"
                  >
                    <MenuItem value="">All Levels</MenuItem>
                    <MenuItem value="entry">Entry</MenuItem>
                    <MenuItem value="mid">Mid</MenuItem>
                    <MenuItem value="senior">Senior</MenuItem>
                    <MenuItem value="executive">Executive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Remote</InputLabel>
                  <Select
                    value={remoteFilter}
                    onChange={(e) => setRemoteFilter(e.target.value)}
                    label="Remote"
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="true">Remote Only</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 4 }}>
              <AlertTitle>Error</AlertTitle>
              {error}
            </Alert>
          )}

          {/* Jobs Grid */}
          <Grid container spacing={3}>
            {jobs.map((job) => (
              <Grid item xs={12} md={6} lg={4} key={job.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card sx={{ 
                    height: '100%',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
                    },
                    transition: 'all 0.3s ease-in-out',
                  }}>
                    <CardHeader
                      avatar={
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {getCategoryIcon(job.category)}
                        </Avatar>
                      }
                      title={
                        <Typography variant="h6" fontWeight="bold" noWrap>
                          {job.title}
                        </Typography>
                      }
                      subheader={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                          <Chip
                            icon={<BusinessIcon />}
                            label={job.company}
                            size="small"
                            variant="outlined"
                          />
                          <Chip
                            label={job.type}
                            size="small"
                            color={getTypeColor(job.type) as any}
                          />
                          <Chip
                            label={job.level}
                            size="small"
                            color={getLevelColor(job.level) as any}
                          />
                        </Box>
                      }
                      action={
                        <IconButton size="small">
                          <MoreVertIcon />
                        </IconButton>
                      }
                    />
                    <CardContent>
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ 
                          mb: 2,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {job.description}
                      </Typography>
                      
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <LocationOnIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            {job.location} {job.remote && '• Remote'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <AttachMoneyIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            {formatSalary(job)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <TrendingUpIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            {job.applications} applications
                          </Typography>
                        </Box>
                      </Box>

                      {job.tags.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                          {job.tags.slice(0, 3).map((tag) => (
                            <Chip
                              key={tag}
                              label={tag}
                              size="small"
                              variant="outlined"
                              sx={{ mr: 0.5, mb: 0.5 }}
                            />
                          ))}
                          {job.tags.length > 3 && (
                            <Chip
                              label={`+${job.tags.length - 3}`}
                              size="small"
                              variant="outlined"
                              sx={{ mr: 0.5, mb: 0.5 }}
                            />
                          )}
                        </Box>
                      )}

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Button
                          variant="contained"
                          startIcon={<ApplyIcon />}
                          onClick={() => {
                            setSelectedJob(job);
                            setApplyDialogOpen(true);
                          }}
                          size="small"
                        >
                          Apply
                        </Button>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(job.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          {/* Empty State */}
          {jobs.length === 0 && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Paper sx={{ 
                p: 6, 
                textAlign: 'center',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: 3,
              }}>
                <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
                  No jobs found
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Try adjusting your search criteria or check back later for new opportunities
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setSearchTerm("");
                    setCategoryFilter("");
                    setTypeFilter("");
                    setLevelFilter("");
                    setRemoteFilter("");
                  }}
                >
                  Clear Filters
                </Button>
              </Paper>
            </motion.div>
          )}

          {/* Apply Dialog */}
          <Dialog 
            open={applyDialogOpen} 
            onClose={() => setApplyDialogOpen(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>Apply for {selectedJob?.title}</DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    {selectedJob?.company} • {selectedJob?.location}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {formatSalary(selectedJob!)}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Resume URL (Optional)"
                    value={application.resumeUrl}
                    onChange={(e) => setApplication({ ...application, resumeUrl: e.target.value })}
                    placeholder="https://example.com/resume.pdf"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={6}
                    label="Cover Letter (Optional)"
                    value={application.coverLetter}
                    onChange={(e) => setApplication({ ...application, coverLetter: e.target.value })}
                    placeholder="Tell us why you're interested in this position..."
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setApplyDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleApply}
                variant="contained"
                startIcon={<ApplyIcon />}
              >
                Submit Application
              </Button>
            </DialogActions>
          </Dialog>
        </motion.div>
      </Container>
    </Box>
  );
}