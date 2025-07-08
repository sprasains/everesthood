import { useState } from 'react';

export function useFilterBar() {
  const [filters, setFilters] = useState({});
  return { filters, setFilters };
} 