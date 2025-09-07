"use client";

import { Box, Container, Typography, Paper, Grid, Card, CardContent, CardHeader, Avatar, Chip, Button, LinearProgress, Alert, AlertTitle, Tabs, Tab, Badge, Tooltip, IconButton } from "@mui/material";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useUser } from "@/hooks/useUser";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  EmojiEventsIcon,
  StarIcon,
  PeopleIcon,
  AutoAwesomeIcon,
  SchoolIcon,
  DiamondIcon,
  LockIcon,
  CheckCircleIcon,
  TrendingUpIcon,
  RefreshIcon
} from "@mui/icons-material";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  points: number;
  requirements: any;
  isActive: boolean;
  isSecret: boolean;
  earned: boolean;
  earnedAt?: string;
  progress: number;
}

interface AchievementStats {
  totalEarned: number;
  totalPoints: number;
}

export default function AchievementsPage() {
  const { data: session, status } = useSession();
  const { user } = useUser();
  const router = useRouter();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<AchievementStats>({ totalEarned: 0, totalPoints: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  const categories = [
    { label: 'All', value: '', icon: <EmojiEventsIcon /> },
    { label: 'Social', value: 'SOCIAL', icon: <PeopleIcon /> },
    { label: 'Creator', value: 'CREATOR', icon: <AutoAwesomeIcon /> },
    { label: 'Learner', value: 'LEARNER', icon: <SchoolIcon /> },
    { label: 'Community', value: 'COMMUNITY', icon: <StarIcon /> },
    { label: 'Special', value: 'SPECIAL', icon: <DiamondIcon /> }
  ];

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    fetchAchievements();
  }, [session, status, router, activeTab]);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const category = categories[activeTab]?.value;
      const earned = activeTab === 0 ? undefined : false; // Show all for "All" tab, unearned for others
      
      const url = new URL('/api/achievements', window.location.origin);
      if (category) url.searchParams.set('category', category);
      if (earned !== undefined) url.searchParams.set('earned', earned.toString());
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error('Failed to fetch achievements');
      }
      
      const data = await response.json();
      setAchievements(data.achievements);
      setStats({ totalEarned: data.totalEarned, totalPoints: data.totalPoints });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'SOCIAL': return 'primary';
      case 'CREATOR': return 'secondary';
      case 'LEARNER': return 'success';
      case 'COMMUNITY': return 'warning';
      case 'SPECIAL': return 'error';
      default: return 'default';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'SOCIAL': return <PeopleIcon />;
      case 'CREATOR': return <AutoAwesomeIcon />;
      case 'LEARNER': return <SchoolIcon />;
      case 'COMMUNITY': return <StarIcon />;
      case 'SPECIAL': return <DiamondIcon />;
      default: return <EmojiEventsIcon />;
    }
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
              Loading Achievements...
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
      <Container maxWidth="lg" sx={{ py: 4 }}>
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
              Achievements
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'rgba(255,255,255,0.9)',
                maxWidth: 600,
                mx: 'auto'
              }}
            >
              Unlock achievements and track your progress
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 4 }}>
              <AlertTitle>Error</AlertTitle>
              {error}
            </Alert>
          )}

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={4}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card sx={{ 
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 3,
                  textAlign: 'center',
                  p: 3
                }}>
                  <EmojiEventsIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h4" fontWeight="bold" color="primary.main">
                    {stats.totalEarned}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Achievements Earned
                  </Typography>
                </Card>
              </motion.div>
            </Grid>
            <Grid item xs={12} sm={4}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card sx={{ 
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 3,
                  textAlign: 'center',
                  p: 3
                }}>
                  <StarIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                  <Typography variant="h4" fontWeight="bold" color="warning.main">
                    {stats.totalPoints}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Points
                  </Typography>
                </Card>
              </motion.div>
            </Grid>
            <Grid item xs={12} sm={4}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card sx={{ 
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 3,
                  textAlign: 'center',
                  p: 3
                }}>
                  <TrendingUpIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    {achievements.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Available
                  </Typography>
                </Card>
              </motion.div>
            </Grid>
          </Grid>

          {/* Category Tabs */}
          <Paper sx={{ 
            mb: 4,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
          }}>
            <Tabs
              value={activeTab}
              onChange={(_, newValue) => setActiveTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ px: 2 }}
            >
              {categories.map((category, index) => (
                <Tab
                  key={category.value}
                  label={category.label}
                  icon={category.icon}
                  iconPosition="start"
                  sx={{ minHeight: 64 }}
                />
              ))}
            </Tabs>
          </Paper>

          {/* Achievements Grid */}
          <Grid container spacing={3}>
            {achievements.map((achievement, index) => (
              <Grid item xs={12} sm={6} md={4} key={achievement.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card sx={{ 
                    height: '100%',
                    background: achievement.earned 
                      ? 'rgba(76, 175, 80, 0.1)' 
                      : 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 3,
                    border: achievement.earned ? '2px solid #4caf50' : 'none',
                    position: 'relative',
                    overflow: 'visible'
                  }}>
                    {achievement.earned && (
                      <Box sx={{ 
                        position: 'absolute', 
                        top: -8, 
                        right: -8,
                        zIndex: 1
                      }}>
                        <Avatar sx={{ 
                          bgcolor: 'success.main',
                          width: 32,
                          height: 32
                        }}>
                          <CheckCircleIcon />
                        </Avatar>
                      </Box>
                    )}
                    
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ 
                          bgcolor: `${getCategoryColor(achievement.category)}.main`,
                          mr: 2,
                          width: 48,
                          height: 48
                        }}>
                          {getCategoryIcon(achievement.category)}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" fontWeight="bold" sx={{ mb: 0.5 }}>
                            {achievement.isSecret && !achievement.earned ? '???' : achievement.name}
                          </Typography>
                          <Chip
                            label={achievement.category}
                            size="small"
                            color={getCategoryColor(achievement.category) as any}
                            variant="outlined"
                          />
                        </Box>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {achievement.isSecret && !achievement.earned 
                          ? 'Complete this achievement to reveal its description'
                          : achievement.description
                        }
                      </Typography>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          {achievement.points} points
                        </Typography>
                        {achievement.earned && achievement.earnedAt && (
                          <Typography variant="caption" color="success.main">
                            Earned {new Date(achievement.earnedAt).toLocaleDateString()}
                          </Typography>
                        )}
                      </Box>
                      
                      {!achievement.earned && achievement.progress > 0 && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                            Progress: {achievement.progress}%
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={achievement.progress} 
                            sx={{ borderRadius: 1 }}
                          />
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          {achievements.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Paper sx={{ 
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: 3,
                textAlign: 'center',
                p: 6
              }}>
                <EmojiEventsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                  No achievements found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {activeTab === 0 
                    ? 'Start exploring the platform to unlock achievements!'
                    : 'No achievements available in this category yet.'
                  }
                </Typography>
              </Paper>
            </motion.div>
          )}
        </motion.div>
      </Container>
    </Box>
  );
}