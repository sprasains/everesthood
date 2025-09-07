"use client";

import { useState } from 'react';
import { Box, Stack, TextField, Chip, Typography, Autocomplete, Rating } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

interface SearchAndFiltersProps {
  onSearch: (value: string) => void;
  onCategoryChange: (categories: string[]) => void;
  onTagChange: (tags: string[]) => void;
  onRatingChange: (rating: number | null) => void;
}

const categories = [
  'AI & Machine Learning',
  'Data Analysis',
  'Productivity',
  'Finance',
  'Healthcare',
  'Education',
  'Marketing',
  'Development',
];

const tags = [
  'Beginner Friendly',
  'Advanced',
  'Popular',
  'New',
  'Trending',
  'Free',
  'Premium',
];

export default function SearchAndFilters({
  onSearch,
  onCategoryChange,
  onTagChange,
  onRatingChange,
}: SearchAndFiltersProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  const handleCategoryChange = (event: any, newValue: string[]) => {
    setSelectedCategories(newValue);
    onCategoryChange(newValue);
  };

  const handleTagChange = (event: any, newValue: string[]) => {
    setSelectedTags(newValue);
    onTagChange(newValue);
  };

  const handleRatingChange = (event: any, newValue: number | null) => {
    setSelectedRating(newValue);
    onRatingChange(newValue);
  };

  return (
    <Box sx={{ mb: 4 }}>
      {/* Search Bar */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search agents by name or description..."
          onChange={(e) => onSearch(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              backgroundColor: 'background.paper',
            },
          }}
        />
      </Box>

      {/* Filters */}
      <Stack spacing={2}>
        <Box>
          <Typography variant="subtitle2" fontWeight="bold" mb={1}>
            Categories
          </Typography>
          <Autocomplete
            multiple
            options={categories}
            value={selectedCategories}
            onChange={handleCategoryChange}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Select categories"
                size="small"
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  label={option}
                  {...getTagProps({ index })}
                  size="small"
                />
              ))
            }
          />
        </Box>

        <Box>
          <Typography variant="subtitle2" fontWeight="bold" mb={1}>
            Tags
          </Typography>
          <Autocomplete
            multiple
            options={tags}
            value={selectedTags}
            onChange={handleTagChange}
            renderInput={(params) => (
              <TextField {...params} placeholder="Select tags" size="small" />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  label={option}
                  {...getTagProps({ index })}
                  size="small"
                />
              ))
            }
          />
        </Box>

        <Box>
          <Typography variant="subtitle2" fontWeight="bold" mb={1}>
            Minimum Rating
          </Typography>
          <Rating
            value={selectedRating}
            onChange={handleRatingChange}
            precision={0.5}
          />
        </Box>
      </Stack>

      {/* Trending Section */}
      <Box mt={3}>
        <Typography
          variant="subtitle2"
          fontWeight="bold"
          sx={{ display: 'flex', alignItems: 'center', mb: 1 }}
        >
          <TrendingUpIcon sx={{ mr: 1 }} /> Trending Tags
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {['AI', 'Data Science', 'Automation', 'Finance'].map((tag) => (
            <Chip
              key={tag}
              label={tag}
              onClick={() => {
                const newTags = selectedTags.includes(tag)
                  ? selectedTags.filter((t) => t !== tag)
                  : [...selectedTags, tag];
                setSelectedTags(newTags);
                onTagChange(newTags);
              }}
              color={selectedTags.includes(tag) ? 'primary' : 'default'}
              size="small"
              sx={{ m: 0.5 }}
            />
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
