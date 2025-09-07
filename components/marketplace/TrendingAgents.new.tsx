import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Rating,
  Stack,
  useTheme,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import GroupIcon from '@mui/icons-material/Group';

interface Agent {
  id: string;
  name: string;
  description: string;
  tags: string[];
  rating: number;
  usageCount: number;
  userCount: number;
}

const mockAgents: Agent[] = [
  {
    id: '1',
    name: 'Code Review Assistant',
    description: 'AI-powered code review and suggestions',
    tags: ['code', 'review', 'ai'],
    rating: 4.8,
    usageCount: 15234,
    userCount: 1892,
  },
  {
    id: '2',
    name: 'Data Analyzer Pro',
    description: 'Automated data analysis and visualization',
    tags: ['data', 'analysis', 'charts'],
    rating: 4.6,
    usageCount: 12421,
    userCount: 1543,
  },
  {
    id: '3',
    name: 'Task Automator',
    description: 'Automate repetitive tasks and workflows',
    tags: ['automation', 'productivity'],
    rating: 4.7,
    usageCount: 10932,
    userCount: 1234,
  },
];

const formatNumber = (num: number) => {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toString();
};

export default function TrendingAgents() {
  const theme = useTheme();

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <LocalFireDepartmentIcon color="error" />
        <Typography variant="h5" fontWeight="bold">
          Trending Agents
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
          },
          gap: 3,
        }}
      >
        {mockAgents.map((agent) => (
          <Card
            key={agent.id}
            sx={{
              height: '100%',
              transition: theme.transitions.create(['transform', 'box-shadow']),
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme.shadows[4],
              },
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {agent.name}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 2, minHeight: 40 }}
              >
                {agent.description}
              </Typography>

              <Stack spacing={2}>
                <Box>
                  <Rating value={agent.rating} precision={0.1} readOnly />
                  <Typography variant="body2" color="text.secondary">
                    {agent.rating} rating
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <TrendingUpIcon fontSize="small" color="success" />
                    <Typography variant="body2">
                      {formatNumber(agent.usageCount)} runs
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <GroupIcon fontSize="small" color="primary" />
                    <Typography variant="body2">
                      {formatNumber(agent.userCount)} users
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {agent.tags.map((tag) => (
                    <Chip key={tag} label={tag} size="small" variant="outlined" />
                  ))}
                </Box>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
