"use client";
export const dynamic = "force-dynamic";

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import {
  Box, Typography, Paper, Container, TextField, Button, FormControlLabel, Switch, Chip, Alert, CircularProgress,
  Card, CardContent, Accordion, AccordionSummary, AccordionDetails, Stack, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, FormLabel, Radio, RadioGroup, Stepper, Step, StepLabel, List, ListItem, ListItemIcon, ListItemText
} from '@mui/material';
import {
  Add as AddIcon, AutoAwesome as AutoAwesomeIcon, Psychology as PsychologyIcon, Settings as SettingsIcon,
  Public as PublicIcon, Lock as LockIcon, Edit as EditIcon, ContentCopy as CopyIcon, ExpandMore as ExpandMoreIcon, Check as CheckIcon,
  Lightbulb as LightbulbIcon, Work as WorkIcon, Star as StarIcon, TrendingUp as TrendingUpIcon, Group as GroupIcon, Person as PersonIcon,
  Business as BusinessIcon, Speed as SpeedIcon, Analytics as AnalyticsIcon
} from '@mui/icons-material';

// --- Zod schema for validation ---
// --- Zod schema for validation ---
const agentTemplateSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  description: z.string().min(5, 'Description is required'),
  defaultPrompt: z.string().min(5, 'Instructions are required'),
  defaultModel: z.string(),
  defaultTools: z.array(z.string()),
  isPublic: z.boolean(),
});
type AgentTemplateForm = z.infer<typeof agentTemplateSchema>;

export default function AgentTemplateCreatePage() {
  const router = useRouter();
  const steps = ["Choose Template", "Customize", "Review & Create"];
  const [activeStep, setActiveStep] = useState(0);
  const [showExamples, setShowExamples] = useState(false);
  const [showMonetization, setShowMonetization] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [defaultTools, setDefaultTools] = useState<string[]>([]);

  const toolCategories: Record<string, { icon: React.ReactNode, description: string, tools: string[] }> = {
    'Creative': { icon: <AutoAwesomeIcon />, description: 'Writing, design, and creative tasks', tools: ['Writer', 'Designer'] },
    'Professional': { icon: <WorkIcon />, description: 'Business, coaching, and consulting', tools: ['Coach', 'Consultant'] },
    'Technical': { icon: <AnalyticsIcon />, description: 'Data, analytics, and automation', tools: ['Analyst', 'Automator'] },
  };
  const templateExamples = [
    { id: 'writer', name: 'Content Writer', icon: <AutoAwesomeIcon />, prompt: 'Write engaging blog posts on any topic.' },
    { id: 'coach', name: 'Career Coach', icon: <WorkIcon />, prompt: 'Help users with resume reviews and interview prep.' },
    { id: 'analyst', name: 'Data Analyst', icon: <AnalyticsIcon />, prompt: 'Generate automated reports and dashboards.' },
  ];
  const { control, handleSubmit, setValue, formState: { errors } } = useForm<AgentTemplateForm>({
    resolver: zodResolver(agentTemplateSchema),
    defaultValues: {
      name: '',
      description: '',
      defaultPrompt: '',
      defaultModel: 'gpt-4o',
      defaultTools: [],
      isPublic: false,
    },
  });
  const onSubmit = async (data: AgentTemplateForm) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/v1/agents/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create agent template');
      }
      const newTemplate = await response.json();
      alert(`🎉 Agent template "${newTemplate.name}" created successfully!`);
      router.push('/agents/templates');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}><StepLabel>{label}</StepLabel></Step>
          ))}
        </Stepper>
        {activeStep === 0 && (
          <Box>
            <Typography variant="h5" gutterBottom>Choose a Template</Typography>
            <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
              {templateExamples.map((t) => (
                <Card key={t.id} variant={selectedTemplate === t.id ? 'elevation' : 'outlined'} sx={{ cursor: 'pointer', minWidth: 200 }} onClick={() => setSelectedTemplate(t.id)}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>{t.icon}<Typography sx={{ ml: 1 }}>{t.name}</Typography></Box>
                    <Typography variant="body2" color="text.secondary">{t.prompt}</Typography>
                  </CardContent>
                </Card>
              ))}
            </Stack>
            <Button variant="contained" onClick={() => setActiveStep(1)} disabled={!selectedTemplate}>Next</Button>
          </Box>
        )}
        {activeStep === 1 && (
          <form onSubmit={handleSubmit(onSubmit)}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Name" fullWidth margin="normal" error={!!errors.name} helperText={errors.name?.message} />
              )}
            />
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Description" fullWidth margin="normal" multiline rows={3} error={!!errors.description} helperText={errors.description?.message} />
              )}
            />
            <Controller
              name="defaultPrompt"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Instructions" fullWidth margin="normal" multiline rows={4} error={!!errors.defaultPrompt} helperText={errors.defaultPrompt?.message} />
              )}
            />
            <Controller
              name="defaultModel"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Model" fullWidth margin="normal" />
              )}
            />
            <FormControlLabel
              control={
                <Controller
                  name="isPublic"
                  control={control}
                  render={({ field }) => <Switch {...field} checked={field.value} />}
                />
              }
              label="Make Public"
            />
            <Box sx={{ mt: 2 }}>
              <Button type="submit" variant="contained" color="primary" disabled={loading} startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}>
                {loading ? 'Creating...' : 'Create Template'}
              </Button>
              <Button sx={{ ml: 2 }} onClick={() => setActiveStep(0)}>Back</Button>
            </Box>
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          </form>
        )}
        {activeStep === 2 && (
          <Box>
            <Typography variant="h6">Review your template and submit!</Typography>
            <Button variant="contained" onClick={handleSubmit(onSubmit)} disabled={loading} sx={{ mt: 2 }}>{loading ? 'Creating...' : 'Submit'}</Button>
            <Button sx={{ ml: 2 }} onClick={() => setActiveStep(1)}>Back</Button>
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          </Box>
        )}
      </Paper>
      <Dialog open={showExamples} onClose={() => setShowExamples(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LightbulbIcon sx={{ mr: 2, color: 'primary.main' }} />
            Example AI Instructions
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Here are some examples of good AI instructions. Copy and modify them for your needs:
          </Typography>
          <List>
            {templateExamples.map((template) => (
              <ListItem key={template.id} sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  {template.icon}
                  <Typography variant="h6" sx={{ ml: 2 }}>{template.name}</Typography>
                </Box>
                <Typography variant="body2" sx={{ mb: 2, fontStyle: 'italic' }}>{template.prompt}</Typography>
                <Button size="small" startIcon={<CopyIcon />} onClick={() => { setValue('defaultPrompt', template.prompt); setShowExamples(false); }}>Use This Example</Button>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowExamples(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={showMonetization} onClose={() => setShowMonetization(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TrendingUpIcon sx={{ mr: 2, color: 'success.main' }} />
            Monetization & Business Guide
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom sx={{ color: 'success.main' }}>
            💰 How to Make Money with Your AI Assistant
          </Typography>
          {/* ...add monetization content here... */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowMonetization(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
