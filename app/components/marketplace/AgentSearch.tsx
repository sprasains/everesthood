"use client";
import { useState, useEffect, useMemo } from 'react';
import { Box, TextField, Autocomplete, Chip, Slider, Typography, Stack, Button, FormControl, InputLabel, Select, MenuItem, Card, CardContent, Rating, Avatar } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import ClearIcon from '@mui/icons-material/Clear';

interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  rating: number;
  complexity: 'Beginner' | 'Intermediate' | 'Advanced';
  tags: string[];
  usageCount: number;
  isPublic: boolean;
  defaultModel: string;
  version: number;
}

interface SearchFilters {
  query: string;
  category: string;
  complexity: string[];
  rating: number;
  tags: string[];
  sortBy: 'rating' | 'usage' | 'name' | 'recent';
  sortOrder: 'asc' | 'desc';
}

interface AgentSearchProps {
  onResultsChange: (results: AgentTemplate[]) => void;
  onFiltersChange: (filters: SearchFilters) => void;
  initialFilters?: Partial<SearchFilters>;
}

export default function AgentSearch({ onResultsChange, onFiltersChange, initialFilters }: AgentSearchProps) {
  const [templates, setTemplates] = useState<AgentTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: 'All',
    complexity: [],
    rating: 0,
    tags: [],
    sortBy: 'rating',
    sortOrder: 'desc',
    ...initialFilters
  });

  const categories = [
    'All', 'Finance', 'Content', 'Lifestyle', 'Productivity', 'Health', 'AI', 'Automation', 
    'Education', 'Social', 'Marketing', 'Research', 'Wellness', 'Personal', 'Utility', 'Custom'
  ];

  const complexityLevels = ['Beginner', 'Intermediate', 'Advanced'];
  const sortOptions = [
    { value: 'rating', label: 'Rating' },
    { value: 'usage', label: 'Usage Count' },
    { value: 'name', label: 'Name' },
    { value: 'recent', label: 'Recently Added' }
  ];

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch('/api/v1/agents/templates');
        if (!response.ok) throw new Error('Failed to fetch templates');
        const data = await response.json();
        setTemplates(data);
      } catch (error) {
        console.error('Error fetching templates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const filteredAndSortedTemplates = useMemo(() => {
    let filtered = templates.filter(template => {
      // Text search
      if (filters.query) {
        const query = filters.query.toLowerCase();
        if (!template.name.toLowerCase().includes(query) && 
            !template.description.toLowerCase().includes(query) &&
            !template.tags.some(tag => tag.toLowerCase().includes(query))) {
          return false;
        }
      }

      // Category filter
      if (filters.category && filters.category !== 'All' && template.category !== filters.category) {
        return false;
      }

      // Complexity filter
      if (filters.complexity.length > 0 && !filters.complexity.includes(template.complexity)) {
        return false;
      }

      // Rating filter
      if (filters.rating > 0 && template.rating < filters.rating) {
        return false;
      }

      // Tags filter
      if (filters.tags.length > 0 && !filters.tags.some(tag => template.tags.includes(tag))) {
        return false;
      }

      return true;
    });

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'rating':
          comparison = a.rating - b.rating;
          break;
        case 'usage':
          comparison = a.usageCount - b.usageCount;
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'recent':
          comparison = b.version - a.version; // Assuming higher version = more recent
          break;
      }

      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [templates, filters]);

  useEffect(() => {
    onResultsChange(filteredAndSortedTemplates);
    onFiltersChange(filters);
  }, [filteredAndSortedTemplates, filters, onResultsChange, onFiltersChange]);

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      category: 'All',
      complexity: [],
      rating: 0,
      tags: [],
      sortBy: 'rating',
      sortOrder: 'desc'
    });
  };

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    templates.forEach(template => {
      template.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [templates]);

  return (
    <Box sx={{ mb: 4 }}>
      {/* Main Search Bar */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
        <TextField
          fullWidth
          placeholder="Search agents by name, description, or tags..."
          value={filters.query}
          onChange={(e) => handleFilterChange('query', e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
            endAdornment: filters.query && (
              <Button
                size="small"
                onClick={() => handleFilterChange('query', '')}
                sx={{ minWidth: 'auto', p: 0.5 }}
              >
                <ClearIcon fontSize="small" />
              </Button>
            )
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              backgroundColor: 'background.paper',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }
          }}
        />
        
        <Button
          variant={showAdvancedFilters ? "contained" : "outlined"}
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          startIcon={<FilterListIcon />}
          sx={{ minWidth: 'auto', px: 2 }}
        >
          Filters
        </Button>
      </Box>

      {/* Quick Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={filters.category}
            label="Category"
            onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            {categories.map(category => (
              <MenuItem key={category} value={category}>{category}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={filters.sortBy}
            label="Sort By"
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
          >
            {sortOptions.map(option => (
              <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          size="small"
          onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
          startIcon={<SortIcon />}
          variant="outlined"
        >
          {filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}
        </Button>

        {(filters.query || filters.category !== 'All' || filters.complexity.length > 0 || filters.rating > 0 || filters.tags.length > 0) && (
          <Button
            size="small"
            onClick={clearFilters}
            startIcon={<ClearIcon />}
            variant="outlined"
            color="secondary"
          >
            Clear All
          </Button>
        )}
      </Box>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <Card sx={{ mb: 3, p: 3, backgroundColor: 'background.paper' }}>
          <Typography variant="h6" gutterBottom>Advanced Filters</Typography>
          
          <Stack spacing={3}>
            {/* Complexity Filter */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>Complexity Level</Typography>
              <Stack direction="row" spacing={1}>
                {complexityLevels.map(level => (
                  <Chip
                    key={level}
                    label={level}
                    clickable
                    color={filters.complexity.includes(level) ? 'primary' : 'default'}
                    onClick={() => {
                      const newComplexity = filters.complexity.includes(level)
                        ? filters.complexity.filter(c => c !== level)
                        : [...filters.complexity, level];
                      handleFilterChange('complexity', newComplexity);
                    }}
                  />
                ))}
              </Stack>
            </Box>

            {/* Rating Filter */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Minimum Rating: {filters.rating.toFixed(1)} ⭐
              </Typography>
              <Slider
                value={filters.rating}
                onChange={(_, value) => handleFilterChange('rating', value)}
                min={0}
                max={5}
                step={0.1}
                marks={[
                  { value: 0, label: '0' },
                  { value: 2.5, label: '2.5' },
                  { value: 5, label: '5' }
                ]}
                sx={{ maxWidth: 300 }}
              />
            </Box>

            {/* Tags Filter */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>Tags</Typography>
              <Autocomplete
                multiple
                options={allTags}
                value={filters.tags}
                onChange={(_, value) => handleFilterChange('tags', value)}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option}
                      {...getTagProps({ index })}
                      key={option}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Select tags..."
                    size="small"
                    sx={{ maxWidth: 400 }}
                  />
                )}
              />
            </Box>
          </Stack>
        </Card>
      )}

      {/* Results Summary */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {filteredAndSortedTemplates.length} agent{filteredAndSortedTemplates.length !== 1 ? 's' : ''} found
        </Typography>
        
        {loading && (
          <Typography variant="body2" color="text.secondary">
            Loading...
          </Typography>
        )}
      </Box>
    </Box>
  );
}

