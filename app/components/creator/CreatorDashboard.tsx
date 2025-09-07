"use client";

import React from 'react';
import { 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  CardHeader, 
  Typography, 
  Avatar, 
  Chip, 
  Button, 
  LinearProgress, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon,
  Divider,
  IconButton,
  Tooltip,
  Alert,
  AlertTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Badge,
  CircularProgress
} from "@mui/material";
import { motion } from "framer-motion";
import { useUser } from "@/hooks/useUser";
import { useEffect, useState } from "react";
import {
  TrendingUpIcon,
  TrendingDownIcon,
  MonetizationOnIcon,
  VisibilityIcon,
  ThumbUpIcon,
  CommentIcon,
  ShareIcon,
  AnalyticsIcon,
  ContentCopyIcon,
  EditIcon,
  DeleteIcon,
  SettingsIcon,
  AddIcon,
  StarIcon,
  PeopleIcon,
  ScheduleIcon,
  CheckCircleIcon,
  ErrorIcon,
  WarningIcon,
  InfoIcon
} from "@mui/icons-material";

interface CreatorAnalytics {
  totalEarnings: number;
  monthlyEarnings: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  followerCount: number;
  contentCount: number;
  engagementRate: number;
  topPerformingContent: Array<{
    id: string;
    title: string;
    type: string;
    views: number;
    likes: number;
    earnings: number;
    createdAt: string;
  }>;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    value?: number;
  }>;
  earningsHistory: Array<{
    month: string;
    earnings: number;
    views: number;
  }>;
}

export default function CreatorDashboard() {
  const { user } = useUser();
  const [analytics, setAnalytics] = useState<CreatorAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/creator/analytics');
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      
      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress size={60} sx={{ color: 'white' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 4 }}>
        <AlertTitle>Error Loading Analytics</AlertTitle>
        {error}
      </Alert>
    );
  }

  if (!analytics) {
    return (
      <Alert severity="info" sx={{ mb: 4 }}>
        <AlertTitle>No Analytics Data</AlertTitle>
        Start creating content to see your analytics here.
      </Alert>
    );
  }

  const StatCard = ({ title, value, change, icon, color = "primary" }: {
    title: string;
    value: string | number;
    change?: number;
    icon: React.ReactNode;
    color?: string;
  }) => (
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
      }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Avatar sx={{ bgcolor: `${color}.main`, width: 48, height: 48 }}>
              {icon}
            </Avatar>
            {change !== undefined && (
              <Chip
                icon={change >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                label={`${change >= 0 ? '+' : ''}${change}%`}
                color={change >= 0 ? 'success' : 'error'}
                size="small"
                sx={{ fontWeight: 600 }}
              />
            )}
          </Box>
          <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <Box>
      {/* Overview Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Earnings"
            value={`$${analytics.totalEarnings.toLocaleString()}`}
            change={12.5}
            icon={<MonetizationOnIcon />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Views"
            value={analytics.totalViews.toLocaleString()}
            change={8.2}
            icon={<VisibilityIcon />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Followers"
            value={analytics.followerCount.toLocaleString()}
            change={15.3}
            icon={<PeopleIcon />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Engagement Rate"
            value={`${analytics.engagementRate.toFixed(1)}%`}
            change={-2.1}
            icon={<AnalyticsIcon />}
            color="warning"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Top Performing Content */}
        <Grid item xs={12} lg={8}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card sx={{ 
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            }}>
              <CardHeader
                title="Top Performing Content"
                action={
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AddIcon />}
                    sx={{ borderRadius: 2 }}
                  >
                    Create New
                  </Button>
                }
              />
              <CardContent sx={{ p: 0 }}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Content</TableCell>
                        <TableCell align="right">Views</TableCell>
                        <TableCell align="right">Likes</TableCell>
                        <TableCell align="right">Earnings</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {analytics.topPerformingContent
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((content) => (
                          <TableRow key={content.id} hover>
                            <TableCell>
                              <Box>
                                <Typography variant="subtitle2" fontWeight="bold">
                                  {content.title}
                                </Typography>
                                <Chip
                                  label={content.type}
                                  size="small"
                                  variant="outlined"
                                  sx={{ mt: 0.5 }}
                                />
                              </Box>
                            </TableCell>
                            <TableCell align="right">
                              {content.views.toLocaleString()}
                            </TableCell>
                            <TableCell align="right">
                              {content.likes.toLocaleString()}
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="subtitle2" color="success.main" fontWeight="bold">
                                ${content.earnings.toLocaleString()}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Tooltip title="Edit">
                                  <IconButton size="small">
                                    <EditIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Analytics">
                                  <IconButton size="small">
                                    <AnalyticsIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton size="small" color="error">
                                    <DeleteIcon />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={analytics.topPerformingContent.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Recent Activity & Quick Actions */}
        <Grid item xs={12} lg={4}>
          <Grid container spacing={3}>
            {/* Recent Activity */}
            <Grid item xs={12}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card sx={{ 
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: 3,
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                }}>
                  <CardHeader title="Recent Activity" />
                  <CardContent sx={{ p: 0 }}>
                    <List>
                      {analytics.recentActivity.slice(0, 5).map((activity, index) => (
                        <React.Fragment key={activity.id}>
                          <ListItem sx={{ py: 1.5 }}>
                            <ListItemIcon>
                              {activity.type === 'earnings' && <MonetizationOnIcon color="success" />}
                              {activity.type === 'view' && <VisibilityIcon color="info" />}
                              {activity.type === 'like' && <ThumbUpIcon color="primary" />}
                              {activity.type === 'comment' && <CommentIcon color="secondary" />}
                              {activity.type === 'share' && <ShareIcon color="warning" />}
                            </ListItemIcon>
                            <ListItemText
                              primary={activity.description}
                              secondary={new Date(activity.timestamp).toLocaleDateString()}
                            />
                            {activity.value && (
                              <Typography variant="subtitle2" color="success.main" fontWeight="bold">
                                +${activity.value}
                              </Typography>
                            )}
                          </ListItem>
                          {index < analytics.recentActivity.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            {/* Quick Actions */}
            <Grid item xs={12}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card sx={{ 
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: 3,
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                }}>
                  <CardHeader title="Quick Actions" />
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Button
                          variant="contained"
                          fullWidth
                          startIcon={<AddIcon />}
                          sx={{ borderRadius: 2, mb: 1 }}
                        >
                          Create New Content
                        </Button>
                      </Grid>
                      <Grid item xs={6}>
                        <Button
                          variant="outlined"
                          fullWidth
                          startIcon={<AnalyticsIcon />}
                          sx={{ borderRadius: 2 }}
                        >
                          View Analytics
                        </Button>
                      </Grid>
                      <Grid item xs={6}>
                        <Button
                          variant="outlined"
                          fullWidth
                          startIcon={<MonetizationOnIcon />}
                          sx={{ borderRadius: 2 }}
                        >
                          Earnings
                        </Button>
                      </Grid>
                      <Grid item xs={6}>
                        <Button
                          variant="outlined"
                          fullWidth
                          startIcon={<PeopleIcon />}
                          sx={{ borderRadius: 2 }}
                        >
                          Audience
                        </Button>
                      </Grid>
                      <Grid item xs={6}>
                        <Button
                          variant="outlined"
                          fullWidth
                          startIcon={<SettingsIcon />}
                          sx={{ borderRadius: 2 }}
                        >
                          Settings
                        </Button>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Creator Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Alert severity="info" sx={{ mt: 4, borderRadius: 3 }}>
          <AlertTitle>Creator Tips</AlertTitle>
          <Typography variant="body2">
            • Post consistently to maintain audience engagement<br/>
            • Use trending hashtags to increase discoverability<br/>
            • Engage with your audience through comments and replies<br/>
            • Analyze your top-performing content to understand what resonates<br/>
            • Consider collaborating with other creators to expand your reach
          </Typography>
        </Alert>
      </motion.div>
    </Box>
  );
}
