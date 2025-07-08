import { useFilterBar } from '../../../src/hooks/useFilterBar';

export default function FilterBar({ filters, setFilters }: any) {
  const { filters: hookFilters, setFilters: hookSetFilters } = useFilterBar();
  return (
    <div>
      <h2>Filter Bar</h2>
      <button onClick={() => setFilters ? setFilters({}) : hookSetFilters({})}>Reset Filters</button>
    </div>
  );
} 