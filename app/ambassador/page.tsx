"use client";

import { Box, Container, Typography, Paper, Grid, Card, CardContent, Avatar, Chip, Button, LinearProgress, Alert, AlertTitle, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, List, ListItem, ListItemText, ListItemIcon, ListItemSecondaryAction, Divider, Tabs, Tab } from "@mui/material";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useUser } from "@/hooks/useUser";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  EmojiEventsIcon,
  PeopleIcon,
  MonetizationOnIcon,
  TrendingUpIcon,
  ShareIcon,
  AddIcon,
  RefreshIcon,
  StarIcon,
  DiamondIcon,
  WorkspacePremiumIcon,
  EditIcon,
  SaveIcon,
  CancelIcon
} from "@mui/icons-material";

interface AmbassadorProfile {
  id: string;
  tier: string;
  status: string;
  totalReferrals: number;
  totalEarnings: number;
  monthlyEarnings: number;
  lifetimeEarnings: number;
  joinDate: string;
  lastActivity: string;
  bio?: string;
  socialLinks?: any;
  specialties: string[];
  isVerified: boolean;
  user: {
    id: string;
    name: string;
    image?: string;
    email: string;
    level: number;
    xp: number;
  };
  activities?: AmbassadorActivity[];
  rewards?: AmbassadorReward[];
}

interface AmbassadorActivity {
  id: string;
  type: string;
  description: string;
  points: number;
  earnings: number;
  createdAt: string;
}

interface AmbassadorReward {
  id: string;
  type: string;
  title: string;
  description: string;
  value: number;
  status: string;
  claimedAt?: string;
  expiresAt?: string;
  createdAt: string;
}

interface Referral {
  id: string;
  status: string;
  rewardAmount: number;
  completedAt?: string;
  createdAt: string;
  referred: {
    id: string;
    name: string;
    image?: string;
    email: string;
    level: number;
    xp: number;
  };
}

export default function AmbassadorHubPage() {
  const { data: session, status } = useSession();
  const { user } = useUser();
  const router = useRouter();
  const [ambassador, setAmbassador] = useState<AmbassadorProfile | null>(null);
  const [activities, setActivities] = useState<AmbassadorActivity[]>([]);
  const [rewards, setRewards] = useState<AmbassadorReward[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({
    bio: '',
    specialties: [] as string[],
    socialLinks: {
      linkedin: '',
      twitter: '',
      github: '',
      website: ''
    }
  });
  const [referralDialogOpen, setReferralDialogOpen] = useState(false);
  const [referralEmail, setReferralEmail] = useState('');

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    fetchAmbassadorData();
  }, [session, status, router]);

  const fetchAmbassadorData = async () => {
    try {
      setLoading(true);
      const [ambassadorResponse, activitiesResponse, rewardsResponse, referralsResponse] = await Promise.all([
        fetch('/api/ambassador?includeStats=true'),
        fetch('/api/ambassador/activities'),
        fetch('/api/ambassador/rewards'),
        fetch('/api/ambassador/referrals')
      ]);
      
      if (!ambassadorResponse.ok) {
        throw new Error('Failed to fetch ambassador data');
      }
      
      const ambassadorData = await ambassadorResponse.json();
      const activitiesData = await activitiesResponse.json();
      const rewardsData = await rewardsResponse.json();
      const referralsData = await referralsResponse.json();
      
      setAmbassador(ambassadorData.ambassador);
      setActivities(activitiesData.activities || []);
      setRewards(rewardsData.rewards || []);
      setReferrals(referralsData.referrals || []);
      
      if (ambassadorData.ambassador) {
        setEditData({
          bio: ambassadorData.ambassador.bio || '',
          specialties: ambassadorData.ambassador.specialties || [],
          socialLinks: ambassadorData.ambassador.socialLinks || {
            linkedin: '',
            twitter: '',
            github: '',
            website: ''
          }
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinProgram = async () => {
    try {
      const response = await fetch('/api/ambassador', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bio: 'New ambassador ready to grow the community!',
          specialties: ['Community Building', 'Social Media']
        })
      });

      if (!response.ok) {
        throw new Error('Failed to join ambassador program');
      }

      fetchAmbassadorData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const response = await fetch('/api/ambassador', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      setEditing(false);
      fetchAmbassadorData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleSendReferral = async () => {
    try {
      const response = await fetch('/api/ambassador/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referredEmail: referralEmail })
      });

      if (!response.ok) {
        throw new Error('Failed to send referral');
      }

      setReferralDialogOpen(false);
      setReferralEmail('');
      fetchAmbassadorData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleClaimReward = async (rewardId: string) => {
    try {
      const response = await fetch(`/api/ambassador/rewards/${rewardId}/claim`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to claim reward');
      }

      fetchAmbassadorData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'BRONZE': return 'warning';
      case 'SILVER': return 'info';
      case 'GOLD': return 'success';
      case 'PLATINUM': return 'primary';
      case 'DIAMOND': return 'error';
      default: return 'default';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'BRONZE': return <EmojiEventsIcon />;
      case 'SILVER': return <StarIcon />;
      case 'GOLD': return <WorkspacePremiumIcon />;
      case 'PLATINUM': return <DiamondIcon />;
      case 'DIAMOND': return <DiamondIcon />;
      default: return <EmojiEventsIcon />;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'REFERRAL': return <PeopleIcon />;
      case 'SOCIAL_SHARE': return <ShareIcon />;
      case 'CONTENT_CREATION': return <EditIcon />;
      case 'COMMUNITY_ENGAGEMENT': return <PeopleIcon />;
      case 'EVENT_PARTICIPATION': return <EmojiEventsIcon />;
      default: return <TrendingUpIcon />;
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
              Loading Ambassador Hub...
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
              Ambassador Hub
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'rgba(255,255,255,0.9)',
                maxWidth: 600,
                mx: 'auto'
              }}
            >
              Grow the community, earn rewards, and unlock exclusive benefits
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 4 }}>
              <AlertTitle>Error</AlertTitle>
              {error}
            </Alert>
          )}

          {!ambassador ? (
            /* Join Program Card */
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
                <EmojiEventsIcon sx={{ fontSize: 80, color: 'primary.main', mb: 3 }} />
                <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>
                  Join the Ambassador Program
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
                  Become an ambassador and help grow our community while earning exclusive rewards, 
                  early access to features, and special recognition.
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleJoinProgram}
                  sx={{ borderRadius: 2, px: 4 }}
                >
                  Join Now
                </Button>
              </Paper>
            </motion.div>
          ) : (
            <>
              {/* Stats Cards */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
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
                      <Chip
                        icon={getTierIcon(ambassador.tier)}
                        label={ambassador.tier}
                        color={getTierColor(ambassador.tier) as any}
                        sx={{ mb: 2 }}
                      />
                      <Typography variant="h6" fontWeight="bold">
                        Ambassador Tier
                      </Typography>
                    </Card>
                  </motion.div>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
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
                      <PeopleIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                      <Typography variant="h4" fontWeight="bold" color="primary.main">
                        {ambassador.totalReferrals}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Referrals
                      </Typography>
                    </Card>
                  </motion.div>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
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
                      <MonetizationOnIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                      <Typography variant="h4" fontWeight="bold" color="success.main">
                        ${ambassador.monthlyEarnings.toFixed(2)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        This Month
                      </Typography>
                    </Card>
                  </motion.div>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <Card sx={{ 
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: 3,
                      textAlign: 'center',
                      p: 3
                    }}>
                      <TrendingUpIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                      <Typography variant="h4" fontWeight="bold" color="warning.main">
                        ${ambassador.lifetimeEarnings.toFixed(2)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Lifetime Earnings
                      </Typography>
                    </Card>
                  </motion.div>
                </Grid>
              </Grid>

              {/* Main Content */}
              <Paper sx={{ 
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: 3,
              }}>
                <Tabs
                  value={activeTab}
                  onChange={(_, newValue) => setActiveTab(newValue)}
                  sx={{ px: 3, pt: 2 }}
                >
                  <Tab label="Profile" />
                  <Tab label="Activities" />
                  <Tab label="Rewards" />
                  <Tab label="Referrals" />
                </Tabs>

                <Box sx={{ p: 3 }}>
                  {activeTab === 0 && (
                    /* Profile Tab */
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h5" fontWeight="bold">
                          Ambassador Profile
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton onClick={fetchAmbassadorData}>
                            <RefreshIcon />
                          </IconButton>
                          {editing ? (
                            <>
                              <IconButton onClick={handleUpdateProfile} color="primary">
                                <SaveIcon />
                              </IconButton>
                              <IconButton onClick={() => setEditing(false)}>
                                <CancelIcon />
                              </IconButton>
                            </>
                          ) : (
                            <IconButton onClick={() => setEditing(true)}>
                              <EditIcon />
                            </IconButton>
                          )}
                        </Box>
                      </Box>

                      <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                          <Card sx={{ p: 3, textAlign: 'center' }}>
                            <Avatar 
                              src={ambassador.user.image} 
                              sx={{ width: 80, height: 80, mx: 'auto', mb: 2 }}
                            >
                              {ambassador.user.name?.charAt(0) || 'U'}
                            </Avatar>
                            <Typography variant="h6" fontWeight="bold">
                              {ambassador.user.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              Level {ambassador.user.level} • {ambassador.user.xp} XP
                            </Typography>
                            <Chip
                              icon={getTierIcon(ambassador.tier)}
                              label={ambassador.tier}
                              color={getTierColor(ambassador.tier) as any}
                            />
                          </Card>
                        </Grid>
                        <Grid item xs={12} md={8}>
                          <Card sx={{ p: 3 }}>
                            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                              Bio
                            </Typography>
                            {editing ? (
                              <TextField
                                fullWidth
                                multiline
                                rows={4}
                                value={editData.bio}
                                onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                                placeholder="Tell us about yourself..."
                              />
                            ) : (
                              <Typography variant="body1">
                                {ambassador.bio || 'No bio provided yet.'}
                              </Typography>
                            )}

                            <Typography variant="h6" fontWeight="bold" sx={{ mt: 3, mb: 2 }}>
                              Specialties
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                              {ambassador.specialties.map((specialty, index) => (
                                <Chip key={index} label={specialty} size="small" />
                              ))}
                            </Box>
                          </Card>
                        </Grid>
                      </Grid>
                    </Box>
                  )}

                  {activeTab === 1 && (
                    /* Activities Tab */
                    <Box>
                      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
                        Recent Activities
                      </Typography>
                      {activities.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                          <TrendingUpIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                          <Typography variant="h6" color="text.secondary">
                            No activities yet
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Start referring friends and engaging with the community to see your activities here.
                          </Typography>
                        </Box>
                      ) : (
                        <List>
                          {activities.map((activity, index) => (
                            <motion.div
                              key={activity.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.1 }}
                            >
                              <ListItem>
                                <ListItemIcon>
                                  {getActivityIcon(activity.type)}
                                </ListItemIcon>
                                <ListItemText
                                  primary={activity.description}
                                  secondary={new Date(activity.createdAt).toLocaleDateString()}
                                />
                                <ListItemSecondaryAction>
                                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                    <Chip label={`${activity.points} pts`} size="small" />
                                    {activity.earnings > 0 && (
                                      <Chip label={`$${activity.earnings.toFixed(2)}`} size="small" color="success" />
                                    )}
                                  </Box>
                                </ListItemSecondaryAction>
                              </ListItem>
                              {index < activities.length - 1 && <Divider />}
                            </motion.div>
                          ))}
                        </List>
                      )}
                    </Box>
                  )}

                  {activeTab === 2 && (
                    /* Rewards Tab */
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h5" fontWeight="bold">
                          Available Rewards
                        </Typography>
                        <Button
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={() => setReferralDialogOpen(true)}
                        >
                          Send Referral
                        </Button>
                      </Box>
                      {rewards.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                          <MonetizationOnIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                          <Typography variant="h6" color="text.secondary">
                            No rewards yet
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Start referring friends to earn rewards!
                          </Typography>
                        </Box>
                      ) : (
                        <Grid container spacing={2}>
                          {rewards.map((reward, index) => (
                            <Grid item xs={12} sm={6} md={4} key={reward.id}>
                              <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                              >
                                <Card sx={{ p: 3, height: '100%' }}>
                                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                                    {reward.title}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    {reward.description}
                                  </Typography>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Chip
                                      label={`$${reward.value.toFixed(2)}`}
                                      color="success"
                                      size="small"
                                    />
                                    {reward.status === 'PENDING' ? (
                                      <Button
                                        size="small"
                                        variant="contained"
                                        onClick={() => handleClaimReward(reward.id)}
                                      >
                                        Claim
                                      </Button>
                                    ) : (
                                      <Chip
                                        label={reward.status}
                                        color={reward.status === 'CLAIMED' ? 'success' : 'default'}
                                        size="small"
                                      />
                                    )}
                                  </Box>
                                </Card>
                              </motion.div>
                            </Grid>
                          ))}
                        </Grid>
                      )}
                    </Box>
                  )}

                  {activeTab === 3 && (
                    /* Referrals Tab */
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h5" fontWeight="bold">
                          Your Referrals
                        </Typography>
                        <Button
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={() => setReferralDialogOpen(true)}
                        >
                          Send Referral
                        </Button>
                      </Box>
                      {referrals.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                          <PeopleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                          <Typography variant="h6" color="text.secondary">
                            No referrals yet
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Start referring friends to grow the community and earn rewards!
                          </Typography>
                          <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => setReferralDialogOpen(true)}
                          >
                            Send Your First Referral
                          </Button>
                        </Box>
                      ) : (
                        <List>
                          {referrals.map((referral, index) => (
                            <motion.div
                              key={referral.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.1 }}
                            >
                              <ListItem>
                                <ListItemIcon>
                                  <Avatar sx={{ width: 32, height: 32 }}>
                                    {referral.referred.name?.charAt(0) || 'U'}
                                  </Avatar>
                                </ListItemIcon>
                                <ListItemText
                                  primary={referral.referred.name}
                                  secondary={referral.referred.email}
                                />
                                <ListItemSecondaryAction>
                                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                    <Chip
                                      label={referral.status}
                                      color={referral.status === 'COMPLETED' ? 'success' : 'warning'}
                                      size="small"
                                    />
                                    <Chip
                                      label={`$${referral.rewardAmount.toFixed(2)}`}
                                      color="success"
                                      size="small"
                                    />
                                  </Box>
                                </ListItemSecondaryAction>
                              </ListItem>
                              {index < referrals.length - 1 && <Divider />}
                            </motion.div>
                          ))}
                        </List>
                      )}
                    </Box>
                  )}
                </Box>
              </Paper>

              {/* Referral Dialog */}
              <Dialog 
                open={referralDialogOpen} 
                onClose={() => setReferralDialogOpen(false)}
                maxWidth="sm"
                fullWidth
              >
                <DialogTitle>Send Referral</DialogTitle>
                <DialogContent>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={referralEmail}
                    onChange={(e) => setReferralEmail(e.target.value)}
                    placeholder="Enter friend's email address"
                    sx={{ mt: 2 }}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    You'll earn $50 when your friend joins and becomes an active user!
                  </Typography>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setReferralDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSendReferral}
                    variant="contained"
                    disabled={!referralEmail}
                  >
                    Send Referral
                  </Button>
                </DialogActions>
              </Dialog>
            </>
          )}
        </motion.div>
      </Container>
    </Box>
  );
}

