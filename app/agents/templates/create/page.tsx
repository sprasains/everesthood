"use client";
export const dynamic = "force-dynamic";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Box, 
  Typography, 
  Paper, 
  Container, 
  TextField, 
  Button, 
  FormControlLabel, 
  Switch, 
  Chip, 
  Alert, 
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Divider,
  IconButton,
  Tooltip,
  Grid,
  Avatar,
  Stack,
  Tabs,
  Tab,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon, 
  Info as InfoIcon,
  AutoAwesome as AutoAwesomeIcon,
  Psychology as PsychologyIcon,
  Settings as SettingsIcon,
  Public as PublicIcon,
  Lock as LockIcon,
  Edit as EditIcon,
  ContentCopy as CopyIcon,
  ExpandMore as ExpandMoreIcon,
  Check as CheckIcon,
  Lightbulb as LightbulbIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  Favorite as FavoriteIcon,
  Business as BusinessIcon,
  Science as ScienceIcon,
  HealthAndSafety as HealthIcon,
  AccountBalance as FinanceIcon,
  Brush as CreativeIcon,
  Code as CodeIcon,
  Analytics as AnalyticsIcon,
  Support as SupportIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Help as HelpIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

// Pre-built template examples with usage examples and monetization
const templateExamples = [
  {
    id: 'creative-writer',
    name: 'Creative Writer',
    description: 'Helps with writing stories, blogs, and creative content',
    icon: <CreativeIcon sx={{ fontSize: 40, color: '#ff6b6b' }} />,
    category: 'Creative',
    prompt: `You are an expert creative writing assistant. Help users write engaging stories, blog posts, and creative content. Be encouraging and provide helpful suggestions.`,
    tools: ['web_search', 'file_reader'],
    model: 'gpt-4o',
    color: '#ff6b6b',
    usageExamples: [
      'Write blog posts for clients ($50-200 per post)',
      'Create social media content for businesses',
      'Develop marketing copy and campaigns',
      'Ghostwrite books and articles',
      'Generate SEO-optimized content'
    ],
    automation: [
      'Auto-generate weekly blog posts',
      'Create content calendars',
      'Repurpose content across platforms',
      'Generate email newsletters'
    ],
    monetization: 'Content creation services, freelance writing, content marketing agencies'
  },
  {
    id: 'career-coach',
    name: 'Career Coach',
    description: 'Provides career advice and job search guidance',
    icon: <WorkIcon sx={{ fontSize: 40, color: '#4ecdc4' }} />,
    category: 'Professional',
    prompt: `You are a certified career coach. Help users with job searching, resume writing, interview preparation, and career development. Provide actionable advice.`,
    tools: ['web_search', 'file_reader'],
    model: 'gpt-4o',
    color: '#4ecdc4',
    usageExamples: [
      'Resume optimization services ($100-300 per resume)',
      'Interview coaching sessions ($150-500 per session)',
      'Career transition consulting',
      'LinkedIn profile optimization',
      'Job search strategy planning'
    ],
    automation: [
      'Auto-analyze job postings',
      'Generate personalized cover letters',
      'Track application progress',
      'Send follow-up reminders'
    ],
    monetization: 'Career coaching services, resume writing business, job search consulting'
  },
  {
    id: 'data-analyst',
    name: 'Data Analyst',
    description: 'Analyzes data and creates insights',
    icon: <AnalyticsIcon sx={{ fontSize: 40, color: '#45b7d1' }} />,
    category: 'Technical',
    prompt: `You are a senior data analyst. Help users understand their data, create visualizations, and make data-driven decisions. Be clear and analytical.`,
    tools: ['calculator', 'file_reader', 'code_executor'],
    model: 'gpt-4o',
    color: '#45b7d1',
    usageExamples: [
      'Business intelligence reports ($500-2000 per report)',
      'Data visualization services',
      'Market research analysis',
      'Financial data interpretation',
      'Performance analytics dashboards'
    ],
    automation: [
      'Auto-generate weekly/monthly reports',
      'Real-time data monitoring',
      'Automated data cleaning',
      'Predictive analytics models'
    ],
    monetization: 'Data consulting services, BI reporting, analytics consulting, market research'
  },
  {
    id: 'health-coach',
    name: 'Health Coach',
    description: 'Provides wellness and fitness guidance',
    icon: <HealthIcon sx={{ fontSize: 40, color: '#96ceb4' }} />,
    category: 'Health',
    prompt: `You are a certified health and wellness coach. Help users with fitness, nutrition, and overall wellness. Provide safe, evidence-based advice.`,
    tools: ['web_search'],
    model: 'gpt-4o',
    color: '#96ceb4',
    usageExamples: [
      'Personal training programs ($100-300 per month)',
      'Nutrition consultation services',
      'Wellness coaching sessions',
      'Fitness app content creation',
      'Corporate wellness programs'
    ],
    automation: [
      'Generate personalized workout plans',
      'Create meal planning schedules',
      'Track fitness progress',
      'Send motivational reminders'
    ],
    monetization: 'Personal training, nutrition consulting, wellness coaching, fitness content creation'
  },
  {
    id: 'financial-advisor',
    name: 'Financial Advisor',
    description: 'Helps with budgeting and financial planning',
    icon: <FinanceIcon sx={{ fontSize: 40, color: '#feca57' }} />,
    category: 'Finance',
    prompt: `You are a financial advisor. Help users with budgeting, saving, investing, and financial planning. Provide practical, responsible advice.`,
    tools: ['calculator', 'web_search'],
    model: 'gpt-4o',
    color: '#feca57',
    usageExamples: [
      'Financial planning services ($200-1000 per plan)',
      'Investment portfolio analysis',
      'Budget coaching sessions',
      'Tax planning assistance',
      'Retirement planning consulting'
    ],
    automation: [
      'Auto-generate budget reports',
      'Track investment performance',
      'Calculate retirement projections',
      'Monitor financial goals'
    ],
    monetization: 'Financial planning services, investment consulting, budget coaching, tax preparation'
  },
  {
    id: 'code-assistant',
    name: 'Code Assistant',
    description: 'Helps with programming and development',
    icon: <CodeIcon sx={{ fontSize: 40, color: '#ff9ff3' }} />,
    category: 'Technical',
    prompt: `You are an expert software developer. Help users write, debug, and optimize code. Support multiple programming languages and best practices.`,
    tools: ['code_executor', 'file_reader'],
    model: 'gpt-4o',
    color: '#ff9ff3',
    usageExamples: [
      'Code review services ($50-200 per review)',
      'Bug fixing and debugging',
      'Code optimization consulting',
      'Programming tutorials and courses',
      'Technical documentation writing'
    ],
    automation: [
      'Auto-code review and suggestions',
      'Generate test cases',
      'Create documentation',
      'Monitor code quality'
    ],
    monetization: 'Freelance development, code review services, programming education, technical consulting'
  }
];

// Tool categories with icons
const toolCategories = {
  'Search & Research': {
    tools: ['web_search'],
    icon: <SearchIcon sx={{ fontSize: 20 }} />,
    description: 'Find information and research topics'
  },
  'Calculations': {
    tools: ['calculator'],
    icon: <CalculateIcon sx={{ fontSize: 20 }} />,
    description: 'Perform mathematical calculations'
  },
  'File Operations': {
    tools: ['file_reader'],
    icon: <DescriptionIcon sx={{ fontSize: 20 }} />,
    description: 'Read and analyze uploaded files'
  },
  'Code & Development': {
    tools: ['code_executor'],
    icon: <CodeIcon sx={{ fontSize: 20 }} />,
    description: 'Run and test code snippets'
  },
  'Communication': {
    tools: ['email_sender'],
    icon: <EmailIcon sx={{ fontSize: 20 }} />,
    description: 'Send emails and messages'
  },
  'Scheduling': {
    tools: ['calendar_manager'],
    icon: <CalendarTodayIcon sx={{ fontSize: 20 }} />,
    description: 'Manage calendar and schedule events'
  }
};

// Import missing icons
import {
  Search as SearchIcon,
  Calculate as CalculateIcon,
  Description as DescriptionIcon,
  Email as EmailIcon,
  CalendarToday as CalendarTodayIcon
} from '@mui/icons-material';

export default function CreateAgentTemplatePage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [defaultPrompt, setDefaultPrompt] = useState('');
  const [defaultModel, setDefaultModel] = useState('gpt-4o');
  const [defaultTools, setDefaultTools] = useState<string[]>([]);
  const [newTool, setNewTool] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showExamples, setShowExamples] = useState(false);
  const [showMonetization, setShowMonetization] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const steps = ['Choose Template', 'Customize', 'Review & Create'];

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const selectTemplate = (templateId: string) => {
    const template = templateExamples.find(t => t.id === templateId);
    if (template) {
      setName(template.name);
      setDescription(template.description);
      setDefaultPrompt(template.prompt);
      setDefaultModel(template.model);
      setDefaultTools(template.tools);
      setSelectedTemplate(templateId);
    }
  };

  const addTool = () => {
    if (newTool.trim() && !defaultTools.includes(newTool.trim())) {
      setDefaultTools([...defaultTools, newTool.trim()]);
      setNewTool('');
    }
  };

  const removeTool = (toolToRemove: string) => {
    setDefaultTools(defaultTools.filter(tool => tool !== toolToRemove));
  };

  const addSuggestedTool = (tool: string) => {
    if (!defaultTools.includes(tool)) {
      setDefaultTools([...defaultTools, tool]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/agents/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          defaultPrompt,
          defaultModel,
          defaultTools,
          isPublic,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create agent template');
      }

      const newTemplate = await response.json();
      
      // Show success message
      alert(`🎉 Agent template "${newTemplate.name}" created successfully!`);
      router.push('/agents/templates');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 0:
        return selectedTemplate !== null;
      case 1:
        return name.trim() && description.trim() && defaultPrompt.trim();
      case 2:
        return true;
      default:
        return false;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Creative': return <CreativeIcon sx={{ fontSize: 24, color: '#ff6b6b' }} />;
      case 'Professional': return <WorkIcon sx={{ fontSize: 24, color: '#4ecdc4' }} />;
      case 'Technical': return <CodeIcon sx={{ fontSize: 24, color: '#45b7d1' }} />;
      case 'Health': return <HealthIcon sx={{ fontSize: 24, color: '#96ceb4' }} />;
      case 'Finance': return <FinanceIcon sx={{ fontSize: 24, color: '#feca57' }} />;
      default: return <AutoAwesomeIcon sx={{ fontSize: 24, color: '#667eea' }} />;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ 
          fontWeight: 'bold',
          background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Create Your AI Assistant
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          Choose a template or build from scratch - it's super easy! 🚀
        </Typography>
      </Box>

      {/* Stepper */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Form */}
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <form onSubmit={handleSubmit}>
          {/* Step 1: Choose Template */}
          {activeStep === 0 && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <AutoAwesomeIcon sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h5" component="h2">
                  Choose Your AI Assistant Type
                </Typography>
              </Box>

              <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
                <Tab label="Popular Templates" icon={<StarIcon />} />
                <Tab label="Build from Scratch" icon={<EditIcon />} />
              </Tabs>

                             {activeTab === 0 && (
                 <Box>
                   <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
                     {templateExamples.map((template) => (
                       <Card 
                         key={template.id}
                         variant={selectedTemplate === template.id ? "elevation" : "outlined"}
                         sx={{ 
                           cursor: 'pointer',
                           transition: 'all 0.3s ease',
                           border: selectedTemplate === template.id ? `2px solid ${template.color}` : '1px solid #e0e0e0',
                           '&:hover': {
                             transform: 'translateY(-4px)',
                             boxShadow: 4
                           }
                         }}
                         onClick={() => selectTemplate(template.id)}
                       >
                                                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                           <Box sx={{ mb: 2 }}>
                             {template.icon}
                           </Box>
                           <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                             {template.name}
                           </Typography>
                           <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                             {template.description}
                           </Typography>
                           <Chip 
                             label={template.category} 
                             size="small" 
                             icon={getCategoryIcon(template.category)}
                             sx={{ mb: 1 }}
                           />
                           <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 1 }}>
                             {selectedTemplate === template.id && (
                               <CheckIcon sx={{ color: template.color, mr: 1 }} />
                             )}
                             <Typography variant="caption" color="text.secondary">
                               {template.tools.length} tools included
                             </Typography>
                           </Box>
                           
                           {/* Usage Examples Preview */}
                           <Accordion sx={{ mt: 2, boxShadow: 'none' }}>
                             <AccordionSummary 
                               expandIcon={<ExpandMoreIcon />}
                               sx={{ minHeight: 'auto', p: 0 }}
                             >
                               <Typography variant="caption" color="primary" sx={{ cursor: 'pointer' }}>
                                 💰 See earning potential & examples
                               </Typography>
                             </AccordionSummary>
                             <AccordionDetails sx={{ p: 1, textAlign: 'left' }}>
                               <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold', display: 'block', mb: 1 }}>
                                 💼 Popular Use Cases:
                               </Typography>
                               {template.usageExamples?.slice(0, 3).map((example, index) => (
                                 <Typography key={index} variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                   • {example}
                                 </Typography>
                               ))}
                               <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold', display: 'block', mb: 1, mt: 1 }}>
                                 🤖 Automation:
                               </Typography>
                               {template.automation?.slice(0, 2).map((auto, index) => (
                                 <Typography key={index} variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                   • {auto}
                                 </Typography>
                               ))}
                                                        </AccordionDetails>
                         </Accordion>
                       </CardContent>
                     </Card>
                   ))}
                   </Box>
                   
                   {/* View All Templates Link */}
                   <Box sx={{ mt: 4, textAlign: 'center' }}>
                     <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                       Don't see what you're looking for? Explore all available templates
                     </Typography>
                     <Button
                       variant="outlined"
                       startIcon={<AutoAwesomeIcon />}
                       onClick={() => router.push('/agents/templates')}
                       sx={{
                         borderColor: 'primary.main',
                         color: 'primary.main',
                         '&:hover': {
                           borderColor: 'primary.dark',
                           backgroundColor: 'primary.main',
                           color: 'white'
                         }
                       }}
                     >
                       View All Templates
                     </Button>
                   </Box>
                 </Box>
               )}

                             {activeTab === 1 && (
                 <Box sx={{ textAlign: 'center', py: 4 }}>
                   <AutoAwesomeIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
                   <Typography variant="h6" gutterBottom>
                     Build Your Own AI Assistant
                   </Typography>
                   <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                     Start with a blank template and customize everything from scratch
                   </Typography>
                   <Button 
                     variant="outlined" 
                     size="large"
                     onClick={() => {
                       setName('');
                       setDescription('');
                       setDefaultPrompt('');
                       setDefaultTools([]);
                       setSelectedTemplate('custom');
                     }}
                   >
                     Start from Scratch
                   </Button>
                   
                   {/* Success Stories & Monetization */}
                   <Box sx={{ mt: 6, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
                     <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                       🚀 Success Stories & Earning Potential
                     </Typography>
                     <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2, mt: 2 }}>
                       <Card variant="outlined" sx={{ p: 2 }}>
                         <Typography variant="subtitle2" gutterBottom sx={{ color: 'success.main' }}>
                           💰 Content Creator
                         </Typography>
                         <Typography variant="body2" color="text.secondary">
                           "My AI assistant helps me create 50+ blog posts per month. I earn $5,000+ monthly from content marketing services."
                         </Typography>
                       </Card>
                       <Card variant="outlined" sx={{ p: 2 }}>
                         <Typography variant="subtitle2" gutterBottom sx={{ color: 'success.main' }}>
                           💼 Career Coach
                         </Typography>
                         <Typography variant="body2" color="text.secondary">
                           "I automated resume reviews and interview prep. Now I serve 100+ clients monthly, earning $15,000+."
                         </Typography>
                       </Card>
                       <Card variant="outlined" sx={{ p: 2 }}>
                         <Typography variant="subtitle2" gutterBottom sx={{ color: 'success.main' }}>
                           📊 Data Analyst
                         </Typography>
                         <Typography variant="body2" color="text.secondary">
                           "My AI generates automated reports for 20+ clients. Monthly recurring revenue: $8,000+."
                         </Typography>
                       </Card>
                     </Box>
                   </Box>
                 </Box>
               )}

              {selectedTemplate && (
                <Box sx={{ mt: 4, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    ✅ Template Selected: {templateExamples.find(t => t.id === selectedTemplate)?.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Great choice! Click "Next" to customize your AI assistant.
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {/* Step 2: Customize */}
          {activeStep === 1 && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <EditIcon sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h5" component="h2">
                  Customize Your AI Assistant
                </Typography>
              </Box>

                             <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 3 }}>
                 <TextField
                   fullWidth
                   label="Assistant Name"
                   value={name}
                   onChange={(e) => setName(e.target.value)}
                   required
                   placeholder="e.g., My Writing Helper, Career Advisor"
                   helperText="Give your AI assistant a memorable name"
                 />
                 <FormControl fullWidth>
                   <FormLabel>AI Model</FormLabel>
                   <RadioGroup
                     value={defaultModel}
                     onChange={(e) => setDefaultModel(e.target.value)}
                     row
                   >
                     <FormControlLabel 
                       value="gpt-4o" 
                       control={<Radio />} 
                       label={
                         <Box sx={{ display: 'flex', alignItems: 'center' }}>
                           <StarIcon sx={{ fontSize: 16, color: '#ffd700', mr: 1 }} />
                           GPT-4o (Recommended)
                         </Box>
                       } 
                     />
                     <FormControlLabel 
                       value="gpt-4" 
                       control={<Radio />} 
                       label="GPT-4" 
                     />
                     <FormControlLabel 
                       value="claude-3-opus" 
                       control={<Radio />} 
                       label="Claude 3 Opus" 
                     />
                   </RadioGroup>
                 </FormControl>
               </Box>
               <TextField
                 fullWidth
                 label="Description"
                 value={description}
                 onChange={(e) => setDescription(e.target.value)}
                 required
                 multiline
                 rows={3}
                 placeholder="Describe what your AI assistant does and who it helps..."
                 helperText="Explain the purpose and capabilities of your assistant"
                 sx={{ mb: 3 }}
               />
                               <Accordion sx={{ mb: 3 }}>
                 <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                   <Box sx={{ display: 'flex', alignItems: 'center' }}>
                     <PsychologyIcon sx={{ mr: 2, color: 'primary.main' }} />
                     <Typography variant="h6">AI Personality & Instructions</Typography>
                   </Box>
                 </AccordionSummary>
                 <AccordionDetails>
                   <TextField
                     fullWidth
                     label="Instructions for your AI"
                     value={defaultPrompt}
                     onChange={(e) => setDefaultPrompt(e.target.value)}
                     required
                     multiline
                     rows={6}
                     placeholder="You are a helpful AI assistant. Your role is to..."
                     helperText="Define how your AI should behave and respond to users"
                   />
                                          <Box sx={{ mt: 2 }}>
                         <Button
                           size="small"
                           startIcon={<LightbulbIcon />}
                           onClick={() => setShowExamples(true)}
                         >
                           Show Example Instructions
                         </Button>
                         <Button
                           size="small"
                           startIcon={<TrendingUpIcon />}
                           onClick={() => setShowMonetization(true)}
                           sx={{ ml: 1 }}
                         >
                           Monetization Guide
                         </Button>
                       </Box>
                 </AccordionDetails>
               </Accordion>
               
               <Accordion sx={{ mb: 3 }}>
                 <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                   <Box sx={{ display: 'flex', alignItems: 'center' }}>
                     <SettingsIcon sx={{ mr: 2, color: 'primary.main' }} />
                     <Typography variant="h6">Tools & Capabilities</Typography>
                   </Box>
                 </AccordionSummary>
                 <AccordionDetails>
                   <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                     Choose what your AI assistant can do:
                   </Typography>
                   
                   {Object.entries(toolCategories).map(([category, config]) => (
                     <Box key={category} sx={{ mb: 2 }}>
                       <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                         {config.icon}
                         <span style={{ marginLeft: 8 }}>{category}</span>
                       </Typography>
                       <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                         {config.description}
                       </Typography>
                       <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                         {config.tools.map((tool) => (
                           <Chip
                             key={tool}
                             label={tool}
                             size="small"
                             onClick={() => addSuggestedTool(tool)}
                             disabled={defaultTools.includes(tool)}
                             variant={defaultTools.includes(tool) ? "filled" : "outlined"}
                             color={defaultTools.includes(tool) ? "primary" : "default"}
                           />
                         ))}
                       </Stack>
                     </Box>
                   ))}

                   {defaultTools.length > 0 && (
                     <Box sx={{ mt: 3 }}>
                       <Typography variant="subtitle2" gutterBottom>
                         Selected Tools:
                       </Typography>
                       <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                         {defaultTools.map((tool) => (
                           <Chip
                             key={tool}
                             label={tool}
                             onDelete={() => removeTool(tool)}
                             color="primary"
                             variant="filled"
                           />
                         ))}
                       </Stack>
                     </Box>
                   )}
                 </AccordionDetails>
               </Accordion>
               
               <FormControlLabel
                 control={
                   <Switch
                     checked={isPublic}
                     onChange={(e) => setIsPublic(e.target.checked)}
                     color="primary"
                   />
                 }
                 label={
                   <Box sx={{ display: 'flex', alignItems: 'center' }}>
                     {isPublic ? <PublicIcon sx={{ mr: 1 }} /> : <LockIcon sx={{ mr: 1 }} />}
                     Make this template public
                   </Box>
                 }
               />
               <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                 Public templates can be used by all users. Private templates are only visible to you.
               </Typography>
            </Box>
          )}

          {/* Step 3: Review & Create */}
          {activeStep === 2 && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <SettingsIcon sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h5" component="h2">
                  Review & Create Your AI Assistant
                </Typography>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 3 }}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <AutoAwesomeIcon sx={{ mr: 1, color: 'primary.main' }} />
                      Assistant Details
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Name:</strong> {name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Model:</strong> {defaultModel}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Visibility:</strong> {isPublic ? 'Public' : 'Private'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Tools:</strong> {defaultTools.length} selected
                    </Typography>
                  </CardContent>
                </Card>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <TrendingUpIcon sx={{ mr: 1, color: 'primary.main' }} />
                      Statistics
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Description:</strong> {description.length} characters
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Instructions:</strong> {defaultPrompt.length} characters
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Template:</strong> {selectedTemplate === 'custom' ? 'Custom' : 'Based on example'}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Description
                  </Typography>
                  <Typography variant="body2">
                    {description}
                  </Typography>
                </CardContent>
              </Card>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    AI Instructions
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {defaultPrompt}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          )}

          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              variant="outlined"
              startIcon={<RefreshIcon />}
            >
              Back
            </Button>
            
            <Box>
              {activeStep === steps.length - 1 ? (
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading || !isStepValid(activeStep)}
                  startIcon={loading ? <CircularProgress size={20} /> : <PlayIcon />}
                  sx={{ 
                    minWidth: 200,
                    background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #5a6fd8 0%, #6a4190 100%)'
                    }
                  }}
                >
                  {loading ? 'Creating...' : 'Create AI Assistant'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={!isStepValid(activeStep)}
                  endIcon={<CheckIcon />}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </form>
      </Paper>

             {/* Example Instructions Dialog */}
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
                   <Typography variant="h6" sx={{ ml: 2 }}>
                     {template.name}
                   </Typography>
                 </Box>
                 <Typography variant="body2" sx={{ mb: 2, fontStyle: 'italic' }}>
                   {template.prompt}
                 </Typography>
                 <Button
                   size="small"
                   startIcon={<CopyIcon />}
                   onClick={() => {
                     setDefaultPrompt(template.prompt);
                     setShowExamples(false);
                   }}
                 >
                   Use This Example
                 </Button>
               </ListItem>
             ))}
           </List>
         </DialogContent>
         <DialogActions>
           <Button onClick={() => setShowExamples(false)}>Close</Button>
         </DialogActions>
       </Dialog>

       {/* Monetization Guide Dialog */}
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
           
           <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3, mb: 3 }}>
             <Card variant="outlined">
               <CardContent>
                 <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                   🚀 Quick Start Strategies
                 </Typography>
                 <List dense>
                   <ListItem>
                     <ListItemIcon><StarIcon color="primary" /></ListItemIcon>
                     <ListItemText primary="Freelance Services" secondary="Offer AI-powered services on platforms like Upwork, Fiverr" />
                   </ListItem>
                   <ListItem>
                     <ListItemIcon><GroupIcon color="primary" /></ListItemIcon>
                     <ListItemText primary="Consulting" secondary="Provide AI consulting to businesses and individuals" />
                   </ListItem>
                   <ListItem>
                     <ListItemIcon><BusinessIcon color="primary" /></ListItemIcon>
                     <ListItemText primary="Agency Services" secondary="Build an agency around your AI expertise" />
                   </ListItem>
                 </List>
               </CardContent>
             </Card>
             
             <Card variant="outlined">
               <CardContent>
                 <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                   🤖 Automation Opportunities
                 </Typography>
                 <List dense>
                   <ListItem>
                     <ListItemIcon><SpeedIcon color="primary" /></ListItemIcon>
                     <ListItemText primary="Recurring Revenue" secondary="Monthly subscriptions for automated services" />
                   </ListItem>
                   <ListItem>
                     <ListItemIcon><AnalyticsIcon color="primary" /></ListItemIcon>
                     <ListItemText primary="Scalable Services" secondary="Serve multiple clients simultaneously" />
                   </ListItem>
                   <ListItem>
                     <ListItemIcon><TrendingUpIcon color="primary" /></ListItemIcon>
                     <ListItemText primary="Passive Income" secondary="Automated systems that work 24/7" />
                   </ListItem>
                 </List>
               </CardContent>
             </Card>
           </Box>

           <Typography variant="h6" gutterBottom sx={{ color: 'success.main', mt: 3 }}>
             📊 Real Earning Examples
           </Typography>
           <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2, mb: 3 }}>
             <Card variant="outlined" sx={{ p: 2 }}>
               <Typography variant="subtitle2" gutterBottom sx={{ color: 'success.main' }}>
                 Content Creator
               </Typography>
               <Typography variant="body2" color="text.secondary">
                 • Blog posts: $50-200 each<br/>
                 • Social media: $500-2000/month<br/>
                 • Email marketing: $1000-5000/month
               </Typography>
             </Card>
             <Card variant="outlined" sx={{ p: 2 }}>
               <Typography variant="subtitle2" gutterBottom sx={{ color: 'success.main' }}>
                 Career Coach
               </Typography>
               <Typography variant="body2" color="text.secondary">
                 • Resume reviews: $100-300 each<br/>
                 • Interview prep: $150-500/session<br/>
                 • Career consulting: $200-1000/month
               </Typography>
             </Card>
             <Card variant="outlined" sx={{ p: 2 }}>
               <Typography variant="subtitle2" gutterBottom sx={{ color: 'success.main' }}>
                 Data Analyst
               </Typography>
               <Typography variant="body2" color="text.secondary">
                 • Reports: $500-2000 each<br/>
                 • Dashboards: $1000-5000 each<br/>
                 • Consulting: $2000-10000/month
               </Typography>
             </Card>
           </Box>

           <Typography variant="h6" gutterBottom sx={{ color: 'success.main' }}>
             🎯 Marketing & Growth Tips
           </Typography>
           <List>
             <ListItem>
               <ListItemIcon><PersonIcon color="primary" /></ListItemIcon>
               <ListItemText 
                 primary="Build Your Personal Brand" 
                 secondary="Share your AI expertise on LinkedIn, Twitter, and YouTube to attract clients"
               />
             </ListItem>
             <ListItem>
               <ListItemIcon><GroupIcon color="primary" /></ListItemIcon>
               <ListItemText 
                 primary="Join Professional Communities" 
                 secondary="Network in industry groups, forums, and professional associations"
               />
             </ListItem>
             <ListItem>
               <ListItemIcon><BusinessIcon color="primary" /></ListItemIcon>
               <ListItemText 
                 primary="Create Case Studies" 
                 secondary="Document successful projects and share results to build credibility"
               />
             </ListItem>
           </List>
         </DialogContent>
         <DialogActions>
           <Button onClick={() => setShowMonetization(false)}>Close</Button>
         </DialogActions>
       </Dialog>
    </Container>
  );
}
