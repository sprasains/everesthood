import React from 'react';
import { Box, TextField, Chip, FormControl, InputLabel, Select, MenuItem, Rating } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { InputAdornment } from '@mui/material';

interface SearchAndFiltersProps {
  onSearch: (value: string) => void;
  onCategoryChange: (categories: string[]) => void;
  onTagChange: (tags: string[]) => void;
  onRatingChange: (rating: number | null) => void;
}

const categories = [
  'AI Tools',
  'Automation',
  'Data Analysis',
  'Development',
  'Productivity',
  'Social',
];

const popularTags = [
  'trending',
  'new',
  'productivity',
  'automation',
  'analytics',
  'ai',
  'code',
  'social',
];

export default function SearchAndFilters({
  onSearch,
  onCategoryChange,
  onTagChange,
  onRatingChange,
}: SearchAndFiltersProps) {
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>([]);
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
  const [rating, setRating] = React.useState<number | null>(null);

  const handleCategoryChange = (event: any) => {
    const value = event.target.value as string[];
    setSelectedCategories(value);
    onCategoryChange(value);
  };

  const handleTagClick = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(newTags);
    onTagChange(newTags);
  };

  const handleRatingChange = (_event: any, newValue: number | null) => {
    setRating(newValue);
    onRatingChange(newValue);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Search */}
      <TextField
        fullWidth
        placeholder="Search agents..."
        onChange={(e) => onSearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      {/* Categories */}
      <FormControl fullWidth>
        <InputLabel>Categories</InputLabel>
        <Select
          multiple
          value={selectedCategories}
          onChange={handleCategoryChange}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {(selected as string[]).map((value) => (
                <Chip key={value} label={value} />
              ))}
            </Box>
          )}
        >
          {categories.map((category) => (
            <MenuItem key={category} value={category}>
              {category}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Rating Filter */}
      <Box>
        <InputLabel>Minimum Rating</InputLabel>
        <Rating
          value={rating}
          onChange={handleRatingChange}
          precision={0.5}
        />
      </Box>

      {/* Popular Tags */}
      <Box>
        <InputLabel sx={{ mb: 1 }}>Popular Tags</InputLabel>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {popularTags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              onClick={() => handleTagClick(tag)}
              color={selectedTags.includes(tag) ? 'primary' : 'default'}
              variant={selectedTags.includes(tag) ? 'filled' : 'outlined'}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
}
