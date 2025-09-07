'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Rating,
  Avatar,
  Divider,
  LinearProgress,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  SkipNext as NextIcon,
  SkipPrevious as PreviousIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Bookmark as BookmarkIcon,
  Share as ShareIcon,
  Star as StarIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  MenuBook as MenuBookIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  ExpandMore as ExpandMoreIcon,
  Code as CodeIcon,
  Image as ImageIcon,
  VideoLibrary as VideoIcon,
  Quiz as QuizIcon,
  FitnessCenter as ExerciseIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface GuideStep {
  id: string;
  title: string;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'CODE' | 'QUIZ' | 'EXERCISE';
  order: number;
  isOptional: boolean;
  estimatedTime?: number;
  mediaUrl?: string;
  codeLanguage?: string;
  quizData?: string;
}

interface Guide {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  thumbnail?: string;
  estimatedTime?: number;
  prerequisites: string[];
  learningOutcomes: string[];
  viewCount: number;
  likeCount: number;
  shareCount: number;
  averageRating: number;
  reviewCount: number;
  createdAt: string;
  user: {
    id: string;
    name: string;
    image?: string;
  };
  steps: GuideStep[];
  reviews: Array<{
    id: string;
    rating: number;
    title?: string;
    content?: string;
    helpful: number;
    notHelpful: number;
    createdAt: string;
    user: {
      id: string;
      name: string;
      image?: string;
    };
  }>;
  _count: {
    steps: number;
    reviews: number;
    progress: number;
    bookmarks: number;
  };
  userProgress?: {
    progress: number;
    isCompleted: boolean;
    currentStep?: string;
    timeSpent: number;
  } | null;
  isBookmarked: boolean;
}

export default function GuideDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [guide, setGuide] = useState<Guide | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [timeSpent, setTimeSpent] = useState(0);
  const [reviewDialog, setReviewDialog] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewContent, setReviewContent] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchGuide();
  }, [params.id]);

  const fetchGuide = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/guides/${params.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch guide');
      }
      const data = await response.json();
      setGuide(data);
      
      // Set initial progress
      if (data.userProgress) {
        setCompletedSteps(data.userProgress.completedSteps || []);
        setTimeSpent(data.userProgress.timeSpent || 0);
        
        // Find current step index
        if (data.userProgress.currentStep) {
          const stepIndex = data.steps.findIndex(step => step.id === data.userProgress.currentStep);
          if (stepIndex >= 0) {
            setCurrentStepIndex(stepIndex);
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (stepId: string, completed: boolean) => {
    try {
      let newCompletedSteps = [...completedSteps];
      
      if (completed && !newCompletedSteps.includes(stepId)) {
        newCompletedSteps.push(stepId);
      } else if (!completed && newCompletedSteps.includes(stepId)) {
        newCompletedSteps = newCompletedSteps.filter(id => id !== stepId);
      }

      setCompletedSteps(newCompletedSteps);

      const response = await fetch(`/api/guides/${params.id}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completedSteps: newCompletedSteps,
          currentStep: guide?.steps[currentStepIndex]?.id,
          timeSpent: timeSpent + 1 // Increment time spent
        }),
      });

      if (response.ok) {
        setTimeSpent(prev => prev + 1);
      }
    } catch (err) {
      console.error('Failed to update progress:', err);
    }
  };

  const handleNextStep = () => {
    if (currentStepIndex < (guide?.steps.length || 0) - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleToggleBookmark = async () => {
    try {
      const response = await fetch(`/api/guides/${params.id}/bookmark`, {
        method: 'POST'
      });

      if (response.ok) {
        setGuide(prev => prev ? { ...prev, isBookmarked: !prev.isBookmarked } : null);
      }
    } catch (err) {
      setError('Failed to toggle bookmark');
    }
  };

  const handleSubmitReview = async () => {
    try {
      setSubmittingReview(true);
      const response = await fetch(`/api/guides/${params.id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating: reviewRating,
          title: reviewTitle,
          content: reviewContent
        }),
      });

      if (response.ok) {
        setReviewDialog(false);
        setReviewTitle('');
        setReviewContent('');
        setReviewRating(5);
        fetchGuide(); // Refresh to get updated reviews
      } else {
        throw new Error('Failed to submit review');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'TEXT': return <MenuBookIcon />;
      case 'IMAGE': return <ImageIcon />;
      case 'VIDEO': return <VideoIcon />;
      case 'CODE': return <CodeIcon />;
      case 'QUIZ': return <QuizIcon />;
      case 'EXERCISE': return <ExerciseIcon />;
      default: return <MenuBookIcon />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER': return 'success';
      case 'INTERMEDIATE': return 'warning';
      case 'ADVANCED': return 'error';
      case 'EXPERT': return 'secondary';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading guide...
        </Typography>
      </Container>
    );
  }

  if (error || !guide) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          {error || 'Guide not found'}
        </Alert>
      </Container>
    );
  }

  const currentStep = guide.steps[currentStepIndex];
  const progressPercentage = guide.steps.length > 0 ? (completedSteps.length / guide.steps.length) * 100 : 0;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar
                src={guide.user.image}
                sx={{ mr: 3, width: 60, height: 60 }}
              >
                <PersonIcon />
              </Avatar>
              <Box>
                <Typography variant="h4" component="h1" gutterBottom>
                  {guide.title}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip
                    label={guide.difficulty.toLowerCase()}
                    color={getDifficultyColor(guide.difficulty)}
                  />
                  <Chip
                    label={guide.category}
                    variant="outlined"
                  />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Rating
                    value={guide.averageRating}
                    readOnly
                    precision={0.1}
                  />
                  <Typography variant="body2" color="text.secondary">
                    ({guide.reviewCount} reviews)
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {guide.viewCount} views
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={guide.isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                onClick={handleToggleBookmark}
              >
                {guide.isBookmarked ? 'Bookmarked' : 'Bookmark'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<ShareIcon />}
                onClick={() => navigator.clipboard.writeText(window.location.href)}
              >
                Share
              </Button>
              <Button
                variant="contained"
                startIcon={<StarIcon />}
                onClick={() => setReviewDialog(true)}
              >
                Review
              </Button>
            </Box>
          </Grid>
        </Grid>

        <Typography variant="body1" sx={{ mb: 3 }}>
          {guide.description}
        </Typography>

        {guide.tags.length > 0 && (
          <Box sx={{ mb: 3 }}>
            {guide.tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                sx={{ mr: 1, mb: 1 }}
              />
            ))}
          </Box>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              Created by {guide.user.name}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            {new Date(guide.createdAt).toLocaleDateString()}
          </Typography>
          {guide.estimatedTime && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <ScheduleIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {guide.estimatedTime} min
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {/* Progress */}
          {guide.userProgress && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Your Progress
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {Math.round(progressPercentage)}% Complete
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={progressPercentage}
                  sx={{ height: 8, borderRadius: 4, mb: 2 }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    {completedSteps.length} of {guide.steps.length} steps completed
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {timeSpent} minutes spent
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Current Step */}
          {currentStep && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  {getStepIcon(currentStep.type)}
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" gutterBottom>
                      Step {currentStep.order}: {currentStep.title}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip
                        label={currentStep.type}
                        size="small"
                        variant="outlined"
                      />
                      {currentStep.isOptional && (
                        <Chip
                          label="Optional"
                          size="small"
                          color="secondary"
                        />
                      )}
                      {currentStep.estimatedTime && (
                        <Chip
                          label={`${currentStep.estimatedTime} min`}
                          size="small"
                          icon={<ScheduleIcon />}
                        />
                      )}
                    </Box>
                  </Box>
                  <IconButton
                    onClick={() => updateProgress(currentStep.id, !completedSteps.includes(currentStep.id))}
                    color={completedSteps.includes(currentStep.id) ? 'success' : 'default'}
                  >
                    {completedSteps.includes(currentStep.id) ? <CheckCircleIcon /> : <RadioButtonUncheckedIcon />}
                  </IconButton>
                </Box>

                <Typography variant="body1" sx={{ mb: 3, whiteSpace: 'pre-wrap' }}>
                  {currentStep.content}
                </Typography>

                {currentStep.mediaUrl && (
                  <Box sx={{ mb: 3 }}>
                    {currentStep.type === 'IMAGE' && (
                      <img
                        src={currentStep.mediaUrl}
                        alt={currentStep.title}
                        style={{ maxWidth: '100%', height: 'auto', borderRadius: 8 }}
                      />
                    )}
                    {currentStep.type === 'VIDEO' && (
                      <video
                        src={currentStep.mediaUrl}
                        controls
                        style={{ maxWidth: '100%', height: 'auto', borderRadius: 8 }}
                      />
                    )}
                  </Box>
                )}

                {currentStep.type === 'CODE' && currentStep.codeLanguage && (
                  <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
                    <Typography variant="subtitle2" gutterBottom>
                      {currentStep.codeLanguage} Code:
                    </Typography>
                    <pre style={{ margin: 0, overflow: 'auto' }}>
                      <code>{currentStep.content}</code>
                    </pre>
                  </Paper>
                )}

                {/* Navigation */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                  <Button
                    variant="outlined"
                    startIcon={<PreviousIcon />}
                    onClick={handlePreviousStep}
                    disabled={currentStepIndex === 0}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="contained"
                    endIcon={<NextIcon />}
                    onClick={handleNextStep}
                    disabled={currentStepIndex === guide.steps.length - 1}
                  >
                    Next
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Introduction */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Introduction
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {guide.content}
              </Typography>
            </CardContent>
          </Card>

          {/* Prerequisites */}
          {guide.prerequisites.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Prerequisites
                </Typography>
                <List>
                  {guide.prerequisites.map((prereq, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText primary={prereq} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}

          {/* Learning Outcomes */}
          {guide.learningOutcomes.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  What You'll Learn
                </Typography>
                <List>
                  {guide.learningOutcomes.map((outcome, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <StarIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText primary={outcome} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}

          {/* Reviews */}
          {guide.reviews.length > 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Reviews ({guide.reviews.length})
                </Typography>
                {guide.reviews.map((review) => (
                  <Box key={review.id} sx={{ mb: 3, pb: 3, borderBottom: 1, borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar src={review.user.image} sx={{ mr: 2 }}>
                        <PersonIcon />
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle1">
                          {review.user.name}
                        </Typography>
                        <Rating value={review.rating} readOnly size="small" />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                    {review.title && (
                      <Typography variant="h6" gutterBottom>
                        {review.title}
                      </Typography>
                    )}
                    {review.content && (
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {review.content}
                      </Typography>
                    )}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton size="small">
                        <ThumbUpIcon fontSize="small" />
                      </IconButton>
                      <Typography variant="body2" color="text.secondary">
                        {review.helpful}
                      </Typography>
                      <IconButton size="small">
                        <ThumbDownIcon fontSize="small" />
                      </IconButton>
                      <Typography variant="body2" color="text.secondary">
                        {review.notHelpful}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <Card sx={{ position: 'sticky', top: 20 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Guide Steps
              </Typography>
              <List>
                {guide.steps.map((step, index) => (
                  <ListItem
                    key={step.id}
                    button
                    onClick={() => setCurrentStepIndex(index)}
                    selected={index === currentStepIndex}
                    sx={{ borderRadius: 1, mb: 0.5 }}
                  >
                    <ListItemIcon>
                      {completedSteps.includes(step.id) ? (
                        <CheckCircleIcon color="success" />
                      ) : (
                        getStepIcon(step.type)
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={step.title}
                      secondary={
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Step {step.order}
                          </Typography>
                          {step.estimatedTime && (
                            <Typography variant="caption" color="text.secondary">
                              • {step.estimatedTime} min
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Review Dialog */}
      <Dialog
        open={reviewDialog}
        onClose={() => setReviewDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Write Review</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography gutterBottom>Rating</Typography>
            <Rating
              value={reviewRating}
              onChange={(_, newValue) => setReviewRating(newValue || 5)}
            />
          </Box>
          <TextField
            fullWidth
            label="Title (Optional)"
            value={reviewTitle}
            onChange={(e) => setReviewTitle(e.target.value)}
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            label="Review"
            multiline
            rows={4}
            value={reviewContent}
            onChange={(e) => setReviewContent(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSubmitReview}
            variant="contained"
            disabled={!reviewContent.trim() || submittingReview}
          >
            {submittingReview ? 'Submitting...' : 'Submit Review'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
