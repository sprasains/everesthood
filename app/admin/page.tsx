"use client";

import { Box, Container, Typography, Paper, Grid, Card, CardContent, CardHeader, Avatar, Chip, Button, LinearProgress, Alert, AlertTitle, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Tooltip } from "@mui/material";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useUser } from "@/hooks/useUser";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AdminPanelSettingsIcon,
  PeopleIcon,
  SmartToyIcon,
  ArticleIcon,
  WorkIcon,
  SummarizeIcon,
  SelfCareIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  RefreshIcon,
  VisibilityIcon,
  EditIcon,
  DeleteIcon,
  MoreVertIcon,
  SecurityIcon,
  AnalyticsIcon,
  DashboardIcon
} from "@mui/icons-material";

interface AdminStats {
  totalUsers: number;
  totalAgents: number;
  totalPosts: number;
  totalJobs: number;
  totalSummaries: number;
  totalWellnessSessions: number;
  growth: {
    users: number;
    agents: number;
    posts: number;
  };
}

interface RecentItem {
  id: string;
  name?: string;
  title?: string;
  description?: string;
  email?: string;
  role?: string;
  isPublic?: boolean;
  createdAt: string;
  user?: {
    id: string;
    name: string;
  };
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const { user } = useUser();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentItem[]>([]);
  const [recentAgents, setRecentAgents] = useState<RecentItem[]>([]);
  const [recentPosts, setRecentPosts] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    // Check if user is admin
    if (user?.role !== 'SUPER_ADMIN') {
      router.push("/");
      return;
    }

    fetchAdminData();
  }, [session, status, router, user]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/dashboard');
      
      if (!response.ok) {
        if (response.status === 403) {
          router.push("/");
          return;
        }
        throw new Error('Failed to fetch admin data');
      }
      
      const data = await response.json();
      setStats(data.stats);
      setRecentUsers(data.recent.users);
      setRecentAgents(data.recent.agents);
      setRecentPosts(data.recent.posts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'error';
      case 'ORG_ADMIN': return 'warning';
      case 'USER': return 'primary';
      default: return 'default';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
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
              Loading Admin Dashboard...
            </Typography>
          </Paper>
        </motion.div>
      </Box>
    );
  }

  if (!session || user?.role !== 'SUPER_ADMIN') {
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
              Admin Dashboard
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'rgba(255,255,255,0.9)',
                maxWidth: 600,
                mx: 'auto'
              }}
            >
              System overview and management
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 4 }}>
              <AlertTitle>Error</AlertTitle>
              {error}
            </Alert>
          )}

          {/* Stats Overview */}
          {stats && (
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={4} lg={2}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card sx={{ 
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 3,
                  }}>
                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                      <PeopleIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                      <Typography variant="h4" fontWeight="bold" color="primary.main">
                        {stats.totalUsers}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Users
                      </Typography>
                      <Typography variant="caption" color="success.main">
                        +{stats.growth.users} this month
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={2}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <Card sx={{ 
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 3,
                  }}>
                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                      <SmartToyIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                      <Typography variant="h4" fontWeight="bold" color="success.main">
                        {stats.totalAgents}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        AI Agents
                      </Typography>
                      <Typography variant="caption" color="success.main">
                        +{stats.growth.agents} this month
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={2}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Card sx={{ 
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 3,
                  }}>
                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                      <ArticleIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                      <Typography variant="h4" fontWeight="bold" color="info.main">
                        {stats.totalPosts}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Community Posts
                      </Typography>
                      <Typography variant="caption" color="success.main">
                        +{stats.growth.posts} this month
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={2}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <Card sx={{ 
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 3,
                  }}>
                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                      <WorkIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                      <Typography variant="h4" fontWeight="bold" color="warning.main">
                        {stats.totalJobs}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Active Jobs
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={2}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <Card sx={{ 
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 3,
                  }}>
                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                      <SummarizeIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
                      <Typography variant="h4" fontWeight="bold" color="secondary.main">
                        {stats.totalSummaries}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        AI Summaries
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={2}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <Card sx={{ 
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 3,
                  }}>
                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                      <SelfCareIcon sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
                      <Typography variant="h4" fontWeight="bold" color="error.main">
                        {stats.totalWellnessSessions}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Wellness Sessions
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            </Grid>
          )}

          {/* Recent Activity */}
          <Grid container spacing={3}>
            {/* Recent Users */}
            <Grid item xs={12} md={4}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card sx={{ 
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 3,
                  height: '100%',
                }}>
                  <CardHeader
                    title="Recent Users"
                    avatar={<Avatar sx={{ bgcolor: 'primary.main' }}><PeopleIcon /></Avatar>}
                    action={
                      <IconButton>
                        <RefreshIcon />
                      </IconButton>
                    }
                  />
                  <CardContent>
                    <TableContainer>
                      <Table size="small">
                        <TableBody>
                          {recentUsers.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Avatar sx={{ width: 32, height: 32 }}>
                                    {user.name?.charAt(0) || 'U'}
                                  </Avatar>
                                  <Box>
                                    <Typography variant="body2" fontWeight="bold">
                                      {user.name || 'Unknown'}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {user.email}
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={user.role}
                                  size="small"
                                  color={getRoleColor(user.role || 'USER') as any}
                                />
                              </TableCell>
                              <TableCell>
                                <Typography variant="caption" color="text.secondary">
                                  {formatTimeAgo(user.createdAt)}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            {/* Recent Agents */}
            <Grid item xs={12} md={4}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card sx={{ 
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 3,
                  height: '100%',
                }}>
                  <CardHeader
                    title="Recent Agents"
                    avatar={<Avatar sx={{ bgcolor: 'success.main' }}><SmartToyIcon /></Avatar>}
                    action={
                      <IconButton>
                        <RefreshIcon />
                      </IconButton>
                    }
                  />
                  <CardContent>
                    <TableContainer>
                      <Table size="small">
                        <TableBody>
                          {recentAgents.map((agent) => (
                            <TableRow key={agent.id}>
                              <TableCell>
                                <Box>
                                  <Typography variant="body2" fontWeight="bold">
                                    {agent.name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {agent.description}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={agent.isPublic ? 'Public' : 'Private'}
                                  size="small"
                                  color={agent.isPublic ? 'success' : 'default'}
                                />
                              </TableCell>
                              <TableCell>
                                <Typography variant="caption" color="text.secondary">
                                  {formatTimeAgo(agent.createdAt)}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            {/* Recent Posts */}
            <Grid item xs={12} md={4}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card sx={{ 
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 3,
                  height: '100%',
                }}>
                  <CardHeader
                    title="Recent Posts"
                    avatar={<Avatar sx={{ bgcolor: 'info.main' }}><ArticleIcon /></Avatar>}
                    action={
                      <IconButton>
                        <RefreshIcon />
                      </IconButton>
                    }
                  />
                  <CardContent>
                    <TableContainer>
                      <Table size="small">
                        <TableBody>
                          {recentPosts.map((post) => (
                            <TableRow key={post.id}>
                              <TableCell>
                                <Box>
                                  <Typography variant="body2" fontWeight="bold">
                                    {post.title || 'Untitled'}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    by {post.user?.name || 'Unknown'}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Typography variant="caption" color="text.secondary">
                                  {formatTimeAgo(post.createdAt)}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          </Grid>
        </motion.div>
      </Container>
    </Box>
  );
}