# UI Components Documentation

## Marketplace Components

### SearchAndFilters
A comprehensive search and filter component for marketplace pages.

```tsx
import { SearchAndFilters } from '@/components/marketplace/SearchAndFilters';

<SearchAndFilters
  onSearch={(value) => handleSearch(value)}
  onCategoryChange={(cats) => handleCategoryChange(cats)}
  onTagChange={(tags) => handleTagChange(tags)}
  onRatingChange={(rating) => handleRatingChange(rating)}
/>
```

**Props:**
- `onSearch: (value: string) => void` - Callback when search input changes
- `onCategoryChange: (categories: string[]) => void` - Callback when categories are selected/deselected
- `onTagChange: (tags: string[]) => void` - Callback when tags are selected/deselected
- `onRatingChange: (rating: number | null) => void` - Callback when rating filter changes

**Features:**
- Responsive design
- Real-time search input
- Multi-select categories with chips
- Popular tags filtering
- Rating-based filtering
- ARIA labels for accessibility
- Proper keyboard navigation

### TrendingAgents
Displays a grid of trending agent cards with statistics and interactions.

```tsx
import { TrendingAgents } from '@/components/marketplace/TrendingAgents';

<TrendingAgents
  agents={myAgents}
  onAgentClick={(id) => handleAgentClick(id)}
/>
```

**Props:**
- `agents?: Agent[]` - Optional list of agents to display (falls back to demo data if not provided)
- `onAgentClick?: (agentId: string) => void` - Optional callback when an agent card is clicked

**Features:**
- Responsive grid layout (1/2/3 columns based on screen size)
- Hover animations
- Usage statistics formatting (1.2k instead of 1234)
- Tag chips
- Rating display
- Performance optimized with React.memo and useCallback
- Fully accessible with keyboard navigation

## Agent Components

### RunsTable
Displays agent execution history with status and actions.

```tsx
import { RunsTable } from '@/components/agents/RunsTable';

<RunsTable
  runs={agentRuns}
  onViewRun={(id) => handleViewRun(id)}
  onCopyDiagnostics={(id) => handleCopyDiagnostics(id)}
/>
```

**Props:**
- `runs: Run[]` - Array of run records to display
- `onViewRun: (id: string) => void` - Callback when viewing a run
- `onCopyDiagnostics: (id: string) => void` - Callback when copying diagnostics

**Features:**
- Status indicators with appropriate colors
- Cost formatting
- Duration display
- Built-in troubleshooting guide for failed runs
- Tooltips for actions
- Sortable columns
- Accessible table structure
- Error state handling

### AgentBuilder
A step-by-step wizard for creating new agents.

```tsx
import { AgentBuilder } from '@/components/agents/AgentBuilder';

<AgentBuilder onSubmit={handleCreateAgent} />
```

**Props:**
- `onSubmit: (data: FormData) => void` - Callback when form is submitted

**Features:**
- 3-step wizard interface
- Form validation with error messages
- Tool selection with credentials management
- Summary review step
- Progress persistence
- Form state management with React Hook Form
- Proper error handling
- Loading states for async operations
- Responsive design
- Keyboard navigation support

## Best Practices

### Error Handling
All components implement proper error handling:
- Form validation with user-friendly messages
- API error handling with toast notifications
- Fallback UI for failed states
- Network error recovery

### Performance
Components are optimized for performance:
- Memoization of callbacks and expensive calculations
- Lazy loading of heavy components
- Efficient re-rendering with proper React hooks usage
- Image optimization for agent avatars

### Accessibility
All components follow WCAG guidelines:
- Proper ARIA labels and roles
- Keyboard navigation support
- Color contrast compliance
- Screen reader compatibility
- Focus management

### Styling
Components use a consistent styling approach:
- Theme-based styling with MUI
- Responsive design patterns
- Animation performance optimization
- Dark mode compatibility
- Design token usage

### Testing
Each component has:
- Unit tests for logic
- Integration tests for user interactions
- Accessibility tests
- Snapshot tests for UI consistency
- Loading/error state tests

## Usage Examples

### Complete Marketplace Page
```tsx
import { SearchAndFilters, TrendingAgents } from '@/components/marketplace';

export default function MarketplacePage() {
  const [filters, setFilters] = useState({
    search: '',
    categories: [],
    tags: [],
    rating: null,
  });

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <SearchAndFilters
            onSearch={(value) => setFilters({ ...filters, search: value })}
            onCategoryChange={(cats) => setFilters({ ...filters, categories: cats })}
            onTagChange={(tags) => setFilters({ ...filters, tags })}
            onRatingChange={(rating) => setFilters({ ...filters, rating })}
          />
        </Grid>
        <Grid item xs={12} md={9}>
          <TrendingAgents onAgentClick={handleAgentClick} />
        </Grid>
      </Grid>
    </Box>
  );
}
```

### Agent Creation Flow
```tsx
import { AgentBuilder } from '@/components/agents';

export default function CreateAgentPage() {
  const handleCreateAgent = async (data) => {
    try {
      await createAgent(data);
      toast.success('Agent created successfully');
      router.push('/agents');
    } catch (error) {
      toast.error('Failed to create agent');
      console.error(error);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <AgentBuilder onSubmit={handleCreateAgent} />
    </Box>
  );
}
```

## Known Issues and TODOs

- [ ] Add virtualization to RunsTable for large datasets
- [ ] Implement search debouncing in SearchAndFilters
- [ ] Add export functionality to RunsTable
- [ ] Implement sorting for TrendingAgents
- [ ] Add loading skeletons for all components
- [ ] Enhance error boundary implementation
- [ ] Add unit tests for edge cases
- [ ] Implement E2E tests with Playwright
- [ ] Add performance monitoring
- [ ] Implement analytics tracking
