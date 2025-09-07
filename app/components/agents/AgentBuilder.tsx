"use client";

import { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Step,
  Stepper,
  StepLabel,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Card,
  CardContent,
  Stack,
  Chip,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import PreviewIcon from '@mui/icons-material/Preview';

const steps = ['Basic Info', 'Tools & Credentials', 'Review'];

interface BuilderFormData {
  name: string;
  description: string;
  category: string;
  tools: string[];
  credentials: {
    [key: string]: {
      type: string;
      value: string;
      isValid: boolean;
    };
  };
}

const categories = [
  'AI & Machine Learning',
  'Data Analysis',
  'Productivity',
  'Finance',
  'Healthcare',
  'Education',
];

const availableTools = [
  { id: 'gpt4', name: 'GPT-4', requires: ['openai_key'] },
  { id: 'dalle3', name: 'DALL·E 3', requires: ['openai_key'] },
  { id: 'charts', name: 'Chart Generation', requires: [] },
  { id: 'db', name: 'Database Access', requires: ['db_connection'] },
];

export default function AgentBuilder() {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<BuilderFormData>({
    name: '',
    description: '',
    category: '',
    tools: [],
    credentials: {},
  });

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = () => {
    // TODO: Submit agent data
    console.log('Submitting agent:', formData);
  };

  const isStepValid = () => {
    switch (activeStep) {
      case 0:
        return formData.name && formData.description && formData.category;
      case 1:
        return formData.tools.length > 0 && Object.values(formData.credentials).every((c) => c.isValid);
      case 2:
        return true;
      default:
        return false;
    }
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Stack spacing={3}>
            <TextField
              label="Agent Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={4}
              fullWidth
              required
            />
            <FormControl fullWidth required>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        );

      case 1:
        return (
          <Stack spacing={3}>
            <FormControl fullWidth required>
              <InputLabel>Tools</InputLabel>
              <Select
                multiple
                value={formData.tools}
                onChange={(e) => {
                  const tools = e.target.value as string[];
                  const requiredCreds = availableTools
                    .filter((t) => tools.includes(t.id))
                    .flatMap((t) => t.requires);
                  const newCreds = { ...formData.credentials };
                  
                  // Add new required credentials
                  requiredCreds.forEach((cred) => {
                    if (!newCreds[cred]) {
                      newCreds[cred] = { type: 'string', value: '', isValid: false };
                    }
                  });
                  
                  // Remove unused credentials
                  Object.keys(newCreds).forEach((cred) => {
                    if (!requiredCreds.includes(cred)) {
                      delete newCreds[cred];
                    }
                  });
                  
                  setFormData({ ...formData, tools, credentials: newCreds });
                }}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip
                        key={value}
                        label={availableTools.find((t) => t.id === value)?.name}
                        size="small"
                      />
                    ))}
                  </Box>
                )}
              >
                {availableTools.map((tool) => (
                  <MenuItem key={tool.id} value={tool.id}>
                    {tool.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Credentials */}
            {Object.entries(formData.credentials).map(([key, cred]) => (
              <TextField
                key={key}
                label={`${key.replace('_', ' ').toUpperCase()}`}
                type={cred.type === 'secret' ? 'password' : 'text'}
                value={cred.value}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({
                    ...formData,
                    credentials: {
                      ...formData.credentials,
                      [key]: {
                        ...cred,
                        value,
                        isValid: value.length > 0, // Basic validation
                      },
                    },
                  });
                }}
                required
                fullWidth
              />
            ))}
          </Stack>
        );

      case 2:
        return (
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Review Your Agent
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Name
                  </Typography>
                  <Typography variant="body1">{formData.name}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Description
                  </Typography>
                  <Typography variant="body1">{formData.description}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Category
                  </Typography>
                  <Typography variant="body1">{formData.category}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Tools
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {formData.tools.map((toolId) => (
                      <Chip
                        key={toolId}
                        label={availableTools.find((t) => t.id === toolId)?.name}
                        size="small"
                      />
                    ))}
                  </Stack>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Required Credentials
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {Object.keys(formData.credentials).map((key) => (
                      <Chip
                        key={key}
                        label={key.replace('_', ' ').toUpperCase()}
                        size="small"
                        color={formData.credentials[key].isValid ? 'success' : 'error'}
                      />
                    ))}
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        );

      default:
        return 'Unknown step';
    }
  };

  const stepIcons = {
    1: <SettingsIcon />,
    2: <VpnKeyIcon />,
    3: <PreviewIcon />,
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 800, mx: 'auto', p: 3 }}>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel StepIconComponent={() => stepIcons[index + 1]}>
              {label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ mt: 4, mb: 4 }}>{getStepContent(activeStep)}</Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button disabled={activeStep === 0} onClick={handleBack}>
          Back
        </Button>
        {activeStep === steps.length - 1 ? (
          <Button variant="contained" onClick={handleSubmit} disabled={!isStepValid()}>
            Create Agent
          </Button>
        ) : (
          <Button variant="contained" onClick={handleNext} disabled={!isStepValid()}>
            Next
          </Button>
        )}
      </Box>
    </Box>
  );
}
