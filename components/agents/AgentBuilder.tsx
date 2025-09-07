import React from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Card,
  CardContent,
  FormHelperText,
  Stack,
  Chip,
} from '@mui/material';
import { styled } from '@mui/material/styles';

const steps = ['Basic Info', 'Tools & Credentials', 'Review'];

const categories = [
  'AI Tools',
  'Automation',
  'Data Analysis',
  'Development',
  'Productivity',
  'Social',
];

const tools = [
  { id: 'openai', name: 'OpenAI', description: 'GPT models and API' },
  { id: 'google-ai', name: 'Google AI', description: 'Google AI services' },
  { id: 'custom-api', name: 'Custom API', description: 'Your own API endpoint' },
  { id: 'database', name: 'Database', description: 'Database operations' },
];

interface FormData {
  name: string;
  description: string;
  category: string;
  selectedTools: string[];
  credentials: Record<string, string>;
}

const initialFormData: FormData = {
  name: '',
  description: '',
  category: '',
  selectedTools: [],
  credentials: {},
};

const StyledButton = styled(Button)(({ theme }) => ({
  minWidth: 100,
}));

export default function AgentBuilder() {
  const [activeStep, setActiveStep] = React.useState(0);
  const [formData, setFormData] = React.useState<FormData>(initialFormData);
  const [errors, setErrors] = React.useState<Partial<FormData>>({});

  const handleNext = () => {
    if (validateStep()) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const validateStep = () => {
    const newErrors: Partial<FormData> = {};

    if (activeStep === 0) {
      if (!formData.name) newErrors.name = 'Name is required';
      if (!formData.description) newErrors.description = 'Description is required';
      if (!formData.category) newErrors.category = 'Category is required';
    }

    if (activeStep === 1) {
      if (formData.selectedTools.length === 0) {
        newErrors.selectedTools = ['At least one tool must be selected'];
      }

      formData.selectedTools.forEach((tool) => {
        if (!formData.credentials[tool]) {
          newErrors.credentials = { ...newErrors.credentials, [tool]: 'Credentials required' };
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateStep()) {
      console.log('Form submitted:', formData);
      // Handle form submission
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Stack spacing={3}>
            <TextField
              label="Agent Name"
              fullWidth
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              error={!!errors.name}
              helperText={errors.name}
            />

            <TextField
              label="Description"
              fullWidth
              multiline
              rows={4}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              error={!!errors.description}
              helperText={errors.description}
            />

            <FormControl fullWidth error={!!errors.category}>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                label="Category"
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
              {errors.category && (
                <FormHelperText>{errors.category}</FormHelperText>
              )}
            </FormControl>
          </Stack>
        );

      case 1:
        return (
          <Stack spacing={3}>
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Select Tools
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {tools.map((tool) => (
                  <Chip
                    key={tool.id}
                    label={tool.name}
                    onClick={() => {
                      const newTools = formData.selectedTools.includes(tool.id)
                        ? formData.selectedTools.filter((id) => id !== tool.id)
                        : [...formData.selectedTools, tool.id];
                      setFormData({ ...formData, selectedTools: newTools });
                    }}
                    color={
                      formData.selectedTools.includes(tool.id)
                        ? 'primary'
                        : 'default'
                    }
                    variant={
                      formData.selectedTools.includes(tool.id)
                        ? 'filled'
                        : 'outlined'
                    }
                  />
                ))}
              </Box>
              {errors.selectedTools && (
                <FormHelperText error>{errors.selectedTools}</FormHelperText>
              )}
            </Box>

            {formData.selectedTools.map((toolId) => {
              const tool = tools.find((t) => t.id === toolId);
              return (
                <TextField
                  key={toolId}
                  label={`${tool?.name} Credentials`}
                  fullWidth
                  type="password"
                  value={formData.credentials[toolId] || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      credentials: {
                        ...formData.credentials,
                        [toolId]: e.target.value,
                      },
                    })
                  }
                  error={!!errors.credentials?.[toolId]}
                  helperText={errors.credentials?.[toolId]}
                />
              );
            })}
          </Stack>
        );

      case 2:
        return (
          <Card variant="outlined">
            <CardContent>
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
                    Selected Tools
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {formData.selectedTools.map((toolId) => {
                      const tool = tools.find((t) => t.id === toolId);
                      return (
                        <Chip
                          key={toolId}
                          label={tool?.name}
                          variant="outlined"
                          size="small"
                        />
                      );
                    })}
                  </Box>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {renderStepContent(activeStep)}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, gap: 2 }}>
        {activeStep > 0 && (
          <StyledButton onClick={handleBack} variant="outlined">
            Back
          </StyledButton>
        )}
        <StyledButton
          variant="contained"
          onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
        >
          {activeStep === steps.length - 1 ? 'Create Agent' : 'Next'}
        </StyledButton>
      </Box>
    </Box>
  );
}
