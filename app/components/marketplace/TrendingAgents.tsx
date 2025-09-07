"use client";

import { Box, Card, CardContent, Typography, Rating, Chip, Stack } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';

interface TrendingAgent {
  id: string;
  name: string;
  description: string;
  rating: number;
  usageCount: number;
  tags: string[];
}

const trendingAgents: TrendingAgent[] = [
  {
    id: '1',
    name: 'Data Analyst Pro',
    description: 'AI-powered data analysis and visualization',
    rating: 4.8,
    usageCount: 1500,
    tags: ['Data', 'Analytics', 'Popular'],
  },
  {
    id: '2',
    name: 'AI Writer',
    description: 'Generate high-quality content with AI',
    rating: 4.7,
    usageCount: 1200,
    tags: ['Content', 'Writing', 'AI'],
  },
  {
    id: '3',
    name: 'Code Assistant',
    description: 'Smart coding help and code review',
    rating: 4.9,
    usageCount: 2000,
    tags: ['Coding', 'Development', 'Premium'],
  },
];

export default function TrendingAgents() {
  return (
    <Box>
      <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <TrendingUpIcon sx={{ mr: 1 }} /> Trending Agents
      </Typography>
      
      <Stack spacing={2}>
        {trendingAgents.map((agent) => (
          <Card key={agent.id} sx={{ 
            background: 'linear-gradient(135deg, #1a237e10 0%, #0d47a110 100%)',
            transition: 'transform 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
            },
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {agent.name}
                </Typography>
                <Chip 
                  icon={<LocalFireDepartmentIcon />} 
                  label={`${agent.usageCount}+ uses`}
                  size="small"
                  color="primary"
                />
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {agent.description}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Rating value={agent.rating} readOnly precision={0.1} size="small" />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  {agent.rating}
                </Typography>
              </Box>
              
              <Stack direction="row" spacing={1}>
                {agent.tags.map((tag) => (
                  <Chip key={tag} label={tag} size="small" />
                ))}
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
