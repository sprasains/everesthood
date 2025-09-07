'use client';

import React, { useState, useEffect } from 'react';
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
  Slider,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Save as SaveIcon,
  Preview as PreviewIcon,
  AutoAwesome as AutoAwesomeIcon,
  Psychology as PsychologyIcon,
  Visibility as VisibilityIcon,
  Tag as TagIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface PersonalityTraits {
  creativity: number;
  analytical: number;
  empathetic: number;
  direct: number;
  humorous: number;
  professional: number;
  casual: number;
  supportive: number;
}

interface PersonaFormData {
  name: string;
  description: string;
  personality: PersonalityTraits;
  systemPrompt: string;
  avatar: string;
  visibility: 'PRIVATE' | 'PUBLIC' | 'SHARED';
  tags: string[];
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
}

const defaultPersonality: PersonalityTraits = {
  creativity: 50,
  analytical: 50,
  empathetic: 50,
  direct: 50,
  humorous: 50,
  professional: 50,
  casual: 50,
  supportive: 50
};

const personalityLabels = {
  creativity: 'Creativity',
  analytical: 'Analytical',
  empathetic: 'Empathetic',
  direct: 'Directness',
  humorous: 'Humor',
  professional: 'Professional',
  casual: 'Casual',
  supportive: 'Supportive'
};

const suggestedTags = [
  'Career Coach', 'Creative Writer', 'Technical Expert', 'Life Coach',
  'Business Advisor', 'Wellness Guide', 'Learning Mentor', 'Productivity Expert',
  'Relationship Advisor', 'Financial Planner', 'Health Coach', 'Tech Support'
];

export default function EditPersonaPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [formData, setFormData] = useState<PersonaFormData>({
    name: '',
    description: '',
    personality: defaultPersonality,
    systemPrompt: '',
    avatar: '',
    visibility: 'PRIVATE',
    tags: [],
    status: 'DRAFT'
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    fetchPersona();
  }, [params.id]);

  const fetchPersona = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/personas/${params.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch persona');
      }
      const persona = await response.json();
      
      setFormData({
        name: persona.name,
        description: persona.description,
        personality: persona.personality ? JSON.parse(persona.personality) : defaultPersonality,
        systemPrompt: persona.systemPrompt,
        avatar: persona.avatar || '',
        visibility: persona.visibility,
        tags: persona.tags || [],
        status: persona.status
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof PersonaFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePersonalityChange = (trait: keyof PersonalityTraits, value: number) => {
    setFormData(prev => ({
      ...prev,
      personality: {
        ...prev.personality,
        [trait]: value
      }
    }));
  };

  const generateSystemPrompt = () => {
    const traits = formData.personality;
    const prompt = `You are ${formData.name}, ${formData.description}.

Personality Traits:
- Creativity: ${traits.creativity}% (${traits.creativity > 70 ? 'Highly creative and innovative' : traits.creativity < 30 ? 'Practical and straightforward' : 'Balanced creativity'})
- Analytical: ${traits.analytical}% (${traits.analytical > 70 ? 'Data-driven and logical' : traits.analytical < 30 ? 'Intuitive and experience-based' : 'Balanced approach'})
- Empathetic: ${traits.empathetic}% (${traits.empathetic > 70 ? 'Highly understanding and compassionate' : traits.empathetic < 30 ? 'Objective and detached' : 'Moderately empathetic'})
- Directness: ${traits.direct}% (${traits.direct > 70 ? 'Straightforward and blunt' : traits.direct < 30 ? 'Diplomatic and gentle' : 'Balanced communication'})
- Humor: ${traits.humorous}% (${traits.humorous > 70 ? 'Frequently uses humor and wit' : traits.humorous < 30 ? 'Serious and formal' : 'Occasionally humorous'})
- Professional: ${traits.professional}% (${traits.professional > 70 ? 'Formal and business-like' : traits.professional < 30 ? 'Relaxed and informal' : 'Moderately professional'})
- Casual: ${traits.casual}% (${traits.casual > 70 ? 'Relaxed and conversational' : traits.casual < 30 ? 'Formal and structured' : 'Balanced tone'})
- Supportive: ${traits.supportive}% (${traits.supportive > 70 ? 'Encouraging and uplifting' : traits.supportive < 30 ? 'Challenging and critical' : 'Balanced support'})

Communication Style: ${formData.tags.join(', ')}

Always maintain this personality and communication style in all interactions.`;

    setFormData(prev => ({
      ...prev,
      systemPrompt: prompt
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/personas/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          personality: JSON.stringify(formData.personality)
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update persona');
      }

      router.push(`/personas/${params.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading persona...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => router.back()}>
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            <PsychologyIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
            Edit AI Persona
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Update your custom AI assistant's personality and settings
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Main Form */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <form onSubmit={handleSubmit}>
              {/* Basic Information */}
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Persona Name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                    placeholder="e.g., Career Coach Sarah"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      label="Status"
                    >
                      <MenuItem value="DRAFT">Draft</MenuItem>
                      <MenuItem value="ACTIVE">Active</MenuItem>
                      <MenuItem value="INACTIVE">Inactive</MenuItem>
                      <MenuItem value="ARCHIVED">Archived</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Visibility</InputLabel>
                    <Select
                      value={formData.visibility}
                      onChange={(e) => handleInputChange('visibility', e.target.value)}
                      label="Visibility"
                    >
                      <MenuItem value="PRIVATE">Private</MenuItem>
                      <MenuItem value="SHARED">Shared</MenuItem>
                      <MenuItem value="PUBLIC">Public</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Avatar URL (Optional)"
                    value={formData.avatar}
                    onChange={(e) => handleInputChange('avatar', e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
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
                placeholder="Describe what this persona does and how it helps users..."
                sx={{ mb: 3 }}
              />

              {/* Tags */}
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                <TagIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
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
                    placeholder="Add tags to categorize your persona"
                  />
                )}
                sx={{ mb: 3 }}
              />

              {/* Personality Traits */}
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                <AutoAwesomeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Personality Traits
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Adjust the sliders to define your persona's personality. This will influence how they communicate and respond.
              </Typography>

              <Grid container spacing={3} sx={{ mb: 3 }}>
                {Object.entries(personalityLabels).map(([trait, label]) => (
                  <Grid item xs={12} sm={6} key={trait}>
                    <Typography gutterBottom>
                      {label}: {formData.personality[trait as keyof PersonalityTraits]}%
                    </Typography>
                    <Slider
                      value={formData.personality[trait as keyof PersonalityTraits]}
                      onChange={(_, value) => handlePersonalityChange(trait as keyof PersonalityTraits, value as number)}
                      min={0}
                      max={100}
                      step={5}
                      marks={[
                        { value: 0, label: 'Low' },
                        { value: 50, label: 'Medium' },
                        { value: 100, label: 'High' }
                      ]}
                    />
                  </Grid>
                ))}
              </Grid>

              <Button
                variant="outlined"
                startIcon={<AutoAwesomeIcon />}
                onClick={generateSystemPrompt}
                sx={{ mb: 3 }}
              >
                Regenerate System Prompt
              </Button>

              {/* System Prompt */}
              <Typography variant="h6" gutterBottom>
                System Prompt
              </Typography>
              
              <TextField
                fullWidth
                label="System Prompt"
                value={formData.systemPrompt}
                onChange={(e) => handleInputChange('systemPrompt', e.target.value)}
                multiline
                rows={8}
                required
                placeholder="This is the core instruction that defines how your persona behaves..."
                sx={{ mb: 3 }}
              />

              {/* Actions */}
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  startIcon={<PreviewIcon />}
                  onClick={() => setPreviewMode(!previewMode)}
                >
                  {previewMode ? 'Edit' : 'Preview'}
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
            </form>
          </Paper>
        </Grid>

        {/* Preview Panel */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h6" gutterBottom>
              <PreviewIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Preview
            </Typography>
            
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {formData.name || 'Untitled Persona'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {formData.description || 'No description provided'}
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip
                    label={formData.visibility.toLowerCase()}
                    color={formData.visibility === 'PUBLIC' ? 'success' : formData.visibility === 'SHARED' ? 'info' : 'default'}
                    size="small"
                  />
                  <Chip
                    label={formData.status.toLowerCase()}
                    color={formData.status === 'ACTIVE' ? 'success' : formData.status === 'DRAFT' ? 'warning' : 'default'}
                    size="small"
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
              </CardContent>
            </Card>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" gutterBottom>
              Personality Summary
            </Typography>
            
            {Object.entries(formData.personality).map(([trait, value]) => (
              <Box key={trait} sx={{ mb: 1 }}>
                <Typography variant="body2">
                  {personalityLabels[trait as keyof PersonalityTraits]}: {value}%
                </Typography>
                <Box
                  sx={{
                    height: 4,
                    backgroundColor: 'grey.200',
                    borderRadius: 2,
                    overflow: 'hidden'
                  }}
                >
                  <Box
                    sx={{
                      height: '100%',
                      width: `${value}%`,
                      backgroundColor: 'primary.main',
                      transition: 'width 0.3s ease'
                    }}
                  />
                </Box>
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
