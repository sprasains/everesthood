'use client';

import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Autocomplete,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Save as SaveIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  MenuBook as MenuBookIcon,
  Visibility as VisibilityIcon,
  Schedule as ScheduleIcon,
  School as SchoolIcon,
  Code as CodeIcon,
  Image as ImageIcon,
  VideoLibrary as VideoIcon,
  Quiz as QuizIcon,
  FitnessCenter as ExerciseIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface GuideStep {
  id?: string;
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

interface GuideFormData {
  title: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  isPublic: boolean;
  thumbnail?: string;
  estimatedTime?: number;
  prerequisites: string[];
  learningOutcomes: string[];
}

const defaultStep: GuideStep = {
  title: '',
  content: '',
  type: 'TEXT',
  order: 1,
  isOptional: false,
  estimatedTime: 5
};

const categories = [
  'Programming', 'Design', 'Business', 'Marketing', 'Data Science',
  'AI/ML', 'Web Development', 'Mobile Development', 'DevOps',
  'Cybersecurity', 'Productivity', 'Career Development', 'Personal Finance',
  'Health & Wellness', 'Creative Writing', 'Photography', 'Music',
  'Language Learning', 'Cooking', 'DIY & Crafts', 'Other'
];

const suggestedTags = [
  'Beginner Friendly', 'Step-by-Step', 'Hands-on', 'Theory', 'Practice',
  'Quick Start', 'Comprehensive', 'Visual', 'Interactive', 'Free',
  'Premium', 'Updated', 'Popular', 'Trending', 'Certified'
];

const stepTypes = [
  { value: 'TEXT', label: 'Text', icon: <MenuBookIcon />, description: 'Written content and instructions' },
  { value: 'IMAGE', label: 'Image', icon: <ImageIcon />, description: 'Visual content with images' },
  { value: 'VIDEO', label: 'Video', icon: <VideoIcon />, description: 'Video tutorials and demonstrations' },
  { value: 'CODE', label: 'Code', icon: <CodeIcon />, description: 'Code examples and snippets' },
  { value: 'QUIZ', label: 'Quiz', icon: <QuizIcon />, description: 'Interactive quizzes and questions' },
  { value: 'EXERCISE', label: 'Exercise', icon: <ExerciseIcon />, description: 'Hands-on exercises and practice' }
];

export default function CreateGuidePage() {
  const router = useRouter();
  const [formData, setFormData] = useState<GuideFormData>({
    title: '',
    description: '',
    content: '',
    category: '',
    tags: [],
    difficulty: 'BEGINNER',
    isPublic: false,
    estimatedTime: 30,
    prerequisites: [],
    learningOutcomes: []
  });

  const [steps, setSteps] = useState<GuideStep[]>([{ ...defaultStep }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stepDialog, setStepDialog] = useState(false);
  const [editingStep, setEditingStep] = useState<GuideStep | null>(null);
  const [editingStepIndex, setEditingStepIndex] = useState(-1);

  const handleInputChange = (field: keyof GuideFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddStep = () => {
    const newStep: GuideStep = {
      ...defaultStep,
      order: steps.length + 1
    };
    setEditingStep(newStep);
    setEditingStepIndex(-1);
    setStepDialog(true);
  };

  const handleEditStep = (index: number) => {
    setEditingStep({ ...steps[index] });
    setEditingStepIndex(index);
    setStepDialog(true);
  };

  const handleSaveStep = () => {
    if (!editingStep) return;

    if (editingStepIndex >= 0) {
      // Update existing step
      const newSteps = [...steps];
      newSteps[editingStepIndex] = editingStep;
      setSteps(newSteps);
    } else {
      // Add new step
      setSteps(prev => [...prev, editingStep]);
    }

    setStepDialog(false);
    setEditingStep(null);
    setEditingStepIndex(-1);
  };

  const handleDeleteStep = (index: number) => {
    const newSteps = steps.filter((_, i) => i !== index);
    // Reorder steps
    newSteps.forEach((step, i) => {
      step.order = i + 1;
    });
    setSteps(newSteps);
  };

  const handleMoveStep = (index: number, direction: 'up' | 'down') => {
    const newSteps = [...steps];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < newSteps.length) {
      [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
      // Update order
      newSteps.forEach((step, i) => {
        step.order = i + 1;
      });
      setSteps(newSteps);
    }
  };

  const calculateTotalTime = () => {
    return steps.reduce((total, step) => total + (step.estimatedTime || 0), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Create guide
      const guideResponse = await fetch('/api/guides', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          estimatedTime: calculateTotalTime()
        }),
      });

      if (!guideResponse.ok) {
        const errorData = await guideResponse.json();
        throw new Error(errorData.error || 'Failed to create guide');
      }

      const guide = await guideResponse.json();

      // Create steps
      for (const step of steps) {
        await fetch(`/api/guides/${guide.id}/steps`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(step),
        });
      }

      router.push(`/guides/${guide.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          <MenuBookIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
          Create Guide & Tutorial
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Share your knowledge with the community through step-by-step guides
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Main Form */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={8}>
                  <TextField
                    fullWidth
                    label="Guide Title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    required
                    placeholder="e.g., Getting Started with React Hooks"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>Difficulty</InputLabel>
                    <Select
                      value={formData.difficulty}
                      onChange={(e) => handleInputChange('difficulty', e.target.value)}
                      label="Difficulty"
                    >
                      <MenuItem value="BEGINNER">Beginner</MenuItem>
                      <MenuItem value="INTERMEDIATE">Intermediate</MenuItem>
                      <MenuItem value="ADVANCED">Advanced</MenuItem>
                      <MenuItem value="EXPERT">Expert</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      label="Category"
                      required
                    >
                      {categories.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Thumbnail URL (Optional)"
                    value={formData.thumbnail || ''}
                    onChange={(e) => handleInputChange('thumbnail', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                </Grid>
              </Grid>

              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                multiline
                rows={3}
                required
                placeholder="Brief description of what this guide covers..."
                sx={{ mb: 3 }}
              />

              <TextField
                fullWidth
                label="Introduction"
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                multiline
                rows={4}
                required
                placeholder="Introduction to your guide..."
                sx={{ mb: 3 }}
              />

              {/* Tags */}
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Tags
              </Typography>
              
              <Autocomplete
                multiple
                options={suggestedTags}
                value={formData.tags}
                onChange={(_, newValue) => handleInputChange('tags', newValue)}
                freeSolo
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Tags"
                    placeholder="Add tags to categorize your guide"
                  />
                )}
                sx={{ mb: 3 }}
              />

              {/* Prerequisites */}
              <Typography variant="h6" gutterBottom>
                Prerequisites
              </Typography>
              
              <Autocomplete
                multiple
                freeSolo
                value={formData.prerequisites}
                onChange={(_, newValue) => handleInputChange('prerequisites', newValue)}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Prerequisites"
                    placeholder="What should learners know before starting?"
                  />
                )}
                sx={{ mb: 3 }}
              />

              {/* Learning Outcomes */}
              <Typography variant="h6" gutterBottom>
                Learning Outcomes
              </Typography>
              
              <Autocomplete
                multiple
                freeSolo
                value={formData.learningOutcomes}
                onChange={(_, newValue) => handleInputChange('learningOutcomes', newValue)}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Learning Outcomes"
                    placeholder="What will learners achieve after completing this guide?"
                  />
                )}
                sx={{ mb: 3 }}
              />
            </Paper>

            {/* Steps */}
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">
                  Guide Steps ({steps.length})
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddStep}
                >
                  Add Step
                </Button>
              </Box>

              {steps.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    No steps added yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Add steps to create your guide structure
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddStep}
                  >
                    Add First Step
                  </Button>
                </Box>
              ) : (
                <List>
                  {steps.map((step, index) => (
                    <ListItem key={index} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mb: 1 }}>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {stepTypes.find(t => t.value === step.type)?.icon}
                            <Typography variant="subtitle1">
                              {step.order}. {step.title}
                            </Typography>
                            <Chip
                              label={step.type}
                              size="small"
                              variant="outlined"
                            />
                            {step.isOptional && (
                              <Chip
                                label="Optional"
                                size="small"
                                color="secondary"
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {step.content.substring(0, 100)}...
                            </Typography>
                            {step.estimatedTime && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                <ScheduleIcon fontSize="small" />
                                <Typography variant="caption">
                                  {step.estimatedTime} min
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="Move Up">
                            <IconButton
                              size="small"
                              onClick={() => handleMoveStep(index, 'up')}
                              disabled={index === 0}
                            >
                              <ArrowUpIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Move Down">
                            <IconButton
                              size="small"
                              onClick={() => handleMoveStep(index, 'down')}
                              disabled={index === steps.length - 1}
                            >
                              <ArrowDownIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => handleEditStep(index)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteStep(index)}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>
          </Grid>

          {/* Preview Panel */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
              <Typography variant="h6" gutterBottom>
                <VisibilityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Preview
              </Typography>
              
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {formData.title || 'Untitled Guide'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {formData.description || 'No description provided'}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip
                      label={formData.difficulty.toLowerCase()}
                      color={formData.difficulty === 'BEGINNER' ? 'success' : formData.difficulty === 'INTERMEDIATE' ? 'warning' : 'error'}
                      size="small"
                    />
                    <Chip
                      label={formData.category || 'No category'}
                      size="small"
                      variant="outlined"
                    />
                  </Box>

                  {formData.tags.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      {formData.tags.map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))}
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ScheduleIcon fontSize="small" />
                    <Typography variant="body2">
                      {calculateTotalTime()} minutes
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" gutterBottom>
                Guide Structure
              </Typography>
              
              {steps.map((step, index) => (
                <Box key={index} sx={{ mb: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="body2">
                    {step.order}. {step.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {stepTypes.find(t => t.value === step.type)?.label}
                    {step.estimatedTime && ` • ${step.estimatedTime} min`}
                  </Typography>
                </Box>
              ))}
            </Paper>
          </Grid>
        </Grid>

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
          <Button
            variant="outlined"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
            disabled={loading || steps.length === 0}
          >
            {loading ? 'Creating...' : 'Create Guide'}
          </Button>
        </Box>
      </form>

      {/* Step Dialog */}
      <Dialog
        open={stepDialog}
        onClose={() => setStepDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingStepIndex >= 0 ? 'Edit Step' : 'Add Step'}
        </DialogTitle>
        <DialogContent>
          {editingStep && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={8}>
                  <TextField
                    fullWidth
                    label="Step Title"
                    value={editingStep.title}
                    onChange={(e) => setEditingStep({ ...editingStep, title: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Estimated Time (minutes)"
                    type="number"
                    value={editingStep.estimatedTime || ''}
                    onChange={(e) => setEditingStep({ ...editingStep, estimatedTime: parseInt(e.target.value) || 0 })}
                  />
                </Grid>
              </Grid>

              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Step Type</InputLabel>
                <Select
                  value={editingStep.type}
                  onChange={(e) => setEditingStep({ ...editingStep, type: e.target.value as any })}
                  label="Step Type"
                >
                  {stepTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {type.icon}
                        <Box>
                          <Typography variant="body2">{type.label}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {type.description}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Step Content"
                multiline
                rows={6}
                value={editingStep.content}
                onChange={(e) => setEditingStep({ ...editingStep, content: e.target.value })}
                required
                sx={{ mt: 2 }}
              />

              {editingStep.type === 'IMAGE' || editingStep.type === 'VIDEO' ? (
                <TextField
                  fullWidth
                  label="Media URL"
                  value={editingStep.mediaUrl || ''}
                  onChange={(e) => setEditingStep({ ...editingStep, mediaUrl: e.target.value })}
                  sx={{ mt: 2 }}
                />
              ) : null}

              {editingStep.type === 'CODE' ? (
                <TextField
                  fullWidth
                  label="Code Language"
                  value={editingStep.codeLanguage || ''}
                  onChange={(e) => setEditingStep({ ...editingStep, codeLanguage: e.target.value })}
                  sx={{ mt: 2 }}
                />
              ) : null}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStepDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSaveStep}
            variant="contained"
            disabled={!editingStep?.title || !editingStep?.content}
          >
            {editingStepIndex >= 0 ? 'Update' : 'Add'} Step
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
