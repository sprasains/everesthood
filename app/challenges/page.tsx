"use client";
import { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Card, 
  CardContent, 
  CardActions, 
  Button, 
  Avatar, 
  Chip, 
  Grid, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Badge
} from '@mui/material';
import { 
  EmojiEvents, 
  Add, 
  Search, 
  FilterList,
  Edit,
  Delete,
  Person,
  Schedule,
  AttachMoney,
  Group,
  TrendingUp,
  Star,
  Timer,
  CheckCircle,
  PlayArrow,
  Pause,
  Stop
} from '@mui/icons-material';
import AppLayoutShell from '@/components/layout/AppLayoutShell';

interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  type: 'hackathon' | 'contest' | 'challenge' | 'competition';
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  startDate: string;
  endDate: string;
  prize: string;
  participants: number;
  maxParticipants: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  tags: string[];
  requirements: string[];
  judgingCriteria: string[];
  organizer: {
    id: string;
    name: string;
    image?: string;
  };
  isJoined: boolean;
  isCompleted: boolean;
  progress?: number;
}

interface ChallengeSubmission {
  id: string;
  title: string;
  description: string;
  participant: {
    name: string;
    image?: string;
  };
  submittedAt: string;
  score?: number;
  rank?: number;
  status: 'submitted' | 'under_review' | 'approved' | 'rejected';
}

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [submissions, setSubmissions] = useState<ChallengeSubmission[]>([]);

  const categories = [
    'Technology',
    'AI/ML',
    'Web Development',
    'Mobile Development',
    'Data Science',
    'Design',
    'Business',
    'Marketing',
    'Blockchain',
    'IoT',
    'Gaming',
    'Other'
  ];

  const statuses = [
    'upcoming',
    'active',
    'completed',
    'cancelled'
  ];

  const difficulties = [
    'beginner',
    'intermediate',
    'advanced',
    'expert'
  ];

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/challenges');
      if (response.ok) {
        const data = await response.json();
        setChallenges(data.challenges || []);
      } else {
        setError('Failed to fetch challenges');
      }
    } catch (err) {
      setError('Error loading challenges');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChallenge = async (challengeData: any) => {
    try {
      const response = await fetch('/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(challengeData),
      });

      if (response.ok) {
        await fetchChallenges();
        setCreateDialogOpen(false);
      } else {
        setError('Failed to create challenge');
      }
    } catch (err) {
      setError('Error creating challenge');
    }
  };

  const handleJoinChallenge = async (challengeId: string) => {
    try {
      const response = await fetch(`/api/challenges/${challengeId}/join`, {
        method: 'POST',
      });

      if (response.ok) {
        await fetchChallenges();
      } else {
        setError('Failed to join challenge');
      }
    } catch (err) {
      setError('Error joining challenge');
    }
  };

  const handleViewChallenge = async (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    // Fetch submissions for this challenge
    try {
      const response = await fetch(`/api/challenges/${challenge.id}/submissions`);
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data.submissions || []);
      }
    } catch (err) {
      console.error('Error fetching submissions:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'info';
      case 'active': return 'success';
      case 'completed': return 'default';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'error';
      case 'expert': return 'secondary';
      default: return 'default';
    }
  };

  const filteredChallenges = challenges.filter(challenge => {
    const matchesSearch = challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         challenge.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         challenge.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !categoryFilter || challenge.category === categoryFilter;
    const matchesStatus = !statusFilter || challenge.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (loading) {
    return (
      <AppLayoutShell>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
            <CircularProgress />
          </Box>
        </Container>
      </AppLayoutShell>
    );
  }

  return (
    <AppLayoutShell>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Hackathons & Challenges
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            Compete in exciting challenges, showcase your skills, and win amazing prizes
          </Typography>

          {/* Search and Filter */}
          <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search challenges..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    label="Category"
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    {categories.map(category => (
                      <MenuItem key={category} value={category}>{category}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="">All Statuses</MenuItem>
                    {statuses.map(status => (
                      <MenuItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setCreateDialogOpen(true)}
                >
                  Create Challenge
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Challenges Grid */}
        <Grid container spacing={3}>
          {filteredChallenges.map((challenge) => (
            <Grid item xs={12} md={6} lg={4} key={challenge.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-4px)' }
                }}
                onClick={() => handleViewChallenge(challenge)}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ width: 48, height: 48, mr: 2, bgcolor: 'primary.main' }}>
                        <EmojiEvents />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          {challenge.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {challenge.type.charAt(0).toUpperCase() + challenge.type.slice(1)}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip 
                      label={challenge.status} 
                      size="small" 
                      color={getStatusColor(challenge.status) as any}
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {challenge.description}
                  </Typography>

                  <Box display="flex" flexWrap="wrap" gap={0.5} mb={2}>
                    <Chip label={challenge.category} size="small" color="primary" />
                    <Chip 
                      label={challenge.difficulty} 
                      size="small" 
                      color={getDifficultyColor(challenge.difficulty) as any}
                    />
                    {challenge.tags.slice(0, 2).map((tag, index) => (
                      <Chip key={index} label={tag} size="small" variant="outlined" />
                    ))}
                  </Box>

                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Box display="flex" alignItems="center">
                        <Group fontSize="small" color="action" />
                        <Typography variant="body2" sx={{ ml: 0.5 }}>
                          {challenge.participants}/{challenge.maxParticipants}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center">
                        <AttachMoney fontSize="small" color="action" />
                        <Typography variant="body2" sx={{ ml: 0.5 }}>
                          {challenge.prize}
                        </Typography>
                      </Box>
                    </Box>
                    <Box display="flex" alignItems="center">
                      <Avatar src={challenge.organizer.image} sx={{ width: 24, height: 24 }}>
                        {challenge.organizer.name.charAt(0)}
                      </Avatar>
                    </Box>
                  </Box>

                  {challenge.status === 'active' && challenge.isJoined && (
                    <Box sx={{ mb: 2 }}>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2">Progress</Typography>
                        <Typography variant="body2">{challenge.progress || 0}%</Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={challenge.progress || 0} 
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                    </Box>
                  )}

                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center">
                      <Schedule fontSize="small" color="action" />
                      <Typography variant="body2" sx={{ ml: 0.5 }}>
                        {new Date(challenge.endDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                    {challenge.isCompleted && (
                      <CheckCircle color="success" fontSize="small" />
                    )}
                  </Box>
                </CardContent>
                <CardActions>
                  {challenge.isJoined ? (
                    <Button
                      startIcon={<PlayArrow />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewChallenge(challenge);
                      }}
                      variant="contained"
                    >
                      Continue
                    </Button>
                  ) : (
                    <Button
                      startIcon={<Add />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleJoinChallenge(challenge.id);
                      }}
                      variant="contained"
                      disabled={challenge.status !== 'active' && challenge.status !== 'upcoming'}
                    >
                      Join
                    </Button>
                  )}
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewChallenge(challenge);
                    }}
                  >
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {filteredChallenges.length === 0 && !loading && (
          <Box textAlign="center" py={8}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No challenges found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Be the first to create an exciting challenge!
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setCreateDialogOpen(true)}
            >
              Create Challenge
            </Button>
          </Box>
        )}

        {/* Create Challenge Dialog */}
        <CreateChallengeDialog
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          onSubmit={handleCreateChallenge}
          categories={categories}
          difficulties={difficulties}
        />

        {/* Challenge Detail Dialog */}
        <ChallengeDetailDialog
          challenge={selectedChallenge}
          submissions={submissions}
          onClose={() => setSelectedChallenge(null)}
        />
      </Container>
    </AppLayoutShell>
  );
}

// Create Challenge Dialog Component
function CreateChallengeDialog({ 
  open, 
  onClose, 
  onSubmit, 
  categories,
  difficulties
}: { 
  open: boolean; 
  onClose: () => void; 
  onSubmit: (data: any) => void;
  categories: string[];
  difficulties: string[];
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    type: 'challenge',
    startDate: '',
    endDate: '',
    prize: '',
    maxParticipants: 100,
    difficulty: 'intermediate',
    tags: [] as string[],
    requirements: [] as string[],
    judgingCriteria: [] as string[]
  });

  const handleSubmit = () => {
    onSubmit(formData);
    setFormData({
      title: '',
      description: '',
      category: '',
      type: 'challenge',
      startDate: '',
      endDate: '',
      prize: '',
      maxParticipants: 100,
      difficulty: 'intermediate',
      tags: [],
      requirements: [],
      judgingCriteria: []
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Create Challenge</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Challenge Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., AI-Powered Web App Challenge"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the challenge, goals, and what participants need to build..."
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                label="Category"
              >
                {categories.map(category => (
                  <MenuItem key={category} value={category}>{category}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                label="Type"
              >
                <MenuItem value="hackathon">Hackathon</MenuItem>
                <MenuItem value="contest">Contest</MenuItem>
                <MenuItem value="challenge">Challenge</MenuItem>
                <MenuItem value="competition">Competition</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Start Date"
              type="datetime-local"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="End Date"
              type="datetime-local"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Prize"
              value={formData.prize}
              onChange={(e) => setFormData({ ...formData, prize: e.target.value })}
              placeholder="e.g., $5,000, MacBook Pro, Job Interview"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Max Participants"
              type="number"
              value={formData.maxParticipants}
              onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) })}
              inputProps={{ min: 2, max: 10000 }}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Difficulty</InputLabel>
              <Select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                label="Difficulty"
              >
                {difficulties.map(difficulty => (
                  <MenuItem key={difficulty} value={difficulty}>
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          Create Challenge
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Challenge Detail Dialog Component
function ChallengeDetailDialog({ 
  challenge, 
  submissions, 
  onClose 
}: { 
  challenge: Challenge | null; 
  submissions: ChallengeSubmission[];
  onClose: () => void;
}) {
  if (!challenge) return null;

  return (
    <Dialog open={!!challenge} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <Avatar sx={{ width: 48, height: 48, mr: 2, bgcolor: 'primary.main' }}>
              <EmojiEvents />
            </Avatar>
            <Box>
              <Typography variant="h6">{challenge.title}</Typography>
              <Typography variant="body2" color="text.secondary">
                {challenge.category} • {challenge.difficulty}
              </Typography>
            </Box>
          </Box>
          <Chip 
            label={challenge.status} 
            color={challenge.status === 'active' ? 'success' : 'default'}
          />
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ mb: 3 }}>
          {challenge.description}
        </Typography>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6}>
            <Typography variant="h6" gutterBottom>Prize</Typography>
            <Typography variant="body2">{challenge.prize}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="h6" gutterBottom>Participants</Typography>
            <Typography variant="body2">
              {challenge.participants}/{challenge.maxParticipants}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="h6" gutterBottom>Start Date</Typography>
            <Typography variant="body2">
              {new Date(challenge.startDate).toLocaleDateString()}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="h6" gutterBottom>End Date</Typography>
            <Typography variant="body2">
              {new Date(challenge.endDate).toLocaleDateString()}
            </Typography>
          </Grid>
        </Grid>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>Requirements</Typography>
          <List>
            {challenge.requirements.map((req, index) => (
              <ListItem key={index}>
                <ListItemText primary={req} />
              </ListItem>
            ))}
          </List>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>Judging Criteria</Typography>
          <List>
            {challenge.judgingCriteria.map((criteria, index) => (
              <ListItem key={index}>
                <ListItemText primary={criteria} />
              </ListItem>
            ))}
          </List>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>Top Submissions</Typography>
          {submissions.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No submissions yet
            </Typography>
          ) : (
            <List>
              {submissions.slice(0, 5).map((submission) => (
                <ListItem key={submission.id}>
                  <ListItemAvatar>
                    <Avatar src={submission.participant.image}>
                      {submission.participant.name.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={submission.title}
                    secondary={submission.participant.name}
                  />
                  {submission.rank && (
                    <ListItemSecondaryAction>
                      <Chip 
                        label={`#${submission.rank}`} 
                        size="small" 
                        color="primary" 
                      />
                    </ListItemSecondaryAction>
                  )}
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        {!challenge.isJoined ? (
          <Button variant="contained">Join Challenge</Button>
        ) : (
          <Button variant="contained">Submit Solution</Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
