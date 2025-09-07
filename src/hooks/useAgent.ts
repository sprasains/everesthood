import { type Agent, type AgentRun } from '@prisma/client';
import { api } from '@/utils/api';
import { useCallback } from 'react';
import { useToast } from '@/hooks/useToast';

// Types
export interface SearchFilters {
  query?: string;
  categories?: string[];
  tags?: string[];
  minRating?: number;
  limit?: number;
  offset?: number;
}

export interface UseAgentsReturn {
  agents: Agent[];
  isLoading: boolean;
  error: Error | null;
  total: number;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

export interface UseRunsReturn {
  runs: AgentRun[];
  isLoading: boolean;
  error: Error | null;
  total: number;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

// Hooks
export function useTrendingAgents(options?: {
  limit?: number;
  category?: string;
  tags?: string[];
  minRating?: number;
}) {
  const toast = useToast();
  const query = api.agent.getTrending.useQuery(
    {
      limit: options?.limit ?? 10,
      category: options?.category,
      tags: options?.tags,
      minRating: options?.minRating,
    },
    {
      onError: (error) => {
        toast.error('Failed to load trending agents');
        console.error('Error loading trending agents:', error);
      },
    }
  );

  return {
    agents: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refresh: query.refetch,
  };
}

export function useSearchAgents(filters: SearchFilters): UseAgentsReturn {
  const toast = useToast();
  const query = api.agent.search.useInfiniteQuery(
    {
      query: filters.query ?? '',
      categories: filters.categories,
      tags: filters.tags,
      minRating: filters.minRating,
      limit: filters.limit ?? 20,
    },
    {
      getNextPageParam: (lastPage, pages) => {
        if (lastPage.agents.length < (filters.limit ?? 20)) return undefined;
        return pages.length * (filters.limit ?? 20);
      },
      onError: (error) => {
        toast.error('Failed to search agents');
        console.error('Error searching agents:', error);
      },
    }
  );

  const loadMore = useCallback(async () => {
    if (query.hasNextPage) {
      await query.fetchNextPage();
    }
  }, [query]);

  const flattenedAgents =
    query.data?.pages.flatMap((page) => page.agents) ?? [];
  const total = query.data?.pages[0]?.total ?? 0;

  return {
    agents: flattenedAgents,
    isLoading: query.isLoading,
    error: query.error,
    total,
    hasMore: query.hasNextPage ?? false,
    loadMore,
    refresh: query.refetch,
  };
}

export function useAgentRuns(
  agentId: string,
  options?: {
    limit?: number;
    offset?: number;
    status?: Array<
      'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
    >;
  }
): UseRunsReturn {
  const toast = useToast();
  const query = api.agent.getRuns.useInfiniteQuery(
    {
      agentId,
      limit: options?.limit ?? 50,
      status: options?.status,
    },
    {
      getNextPageParam: (lastPage, pages) => {
        if (lastPage.runs.length < (options?.limit ?? 50)) return undefined;
        return pages.length * (options?.limit ?? 50);
      },
      onError: (error) => {
        toast.error('Failed to load agent runs');
        console.error('Error loading agent runs:', error);
      },
    }
  );

  const loadMore = useCallback(async () => {
    if (query.hasNextPage) {
      await query.fetchNextPage();
    }
  }, [query]);

  const flattenedRuns = query.data?.pages.flatMap((page) => page.runs) ?? [];
  const total = query.data?.pages[0]?.total ?? 0;

  return {
    runs: flattenedRuns,
    isLoading: query.isLoading,
    error: query.error,
    total,
    hasMore: query.hasNextPage ?? false,
    loadMore,
    refresh: query.refetch,
  };
}

export function useCreateAgent() {
  const toast = useToast();
  const utils = api.useContext();
  const mutation = api.agent.create.useMutation({
    onSuccess: () => {
      toast.success('Agent created successfully');
      void utils.agent.getTrending.invalidate();
    },
    onError: (error) => {
      toast.error('Failed to create agent');
      console.error('Error creating agent:', error);
    },
  });

  return mutation;
}

export function useStartRun() {
  const toast = useToast();
  const utils = api.useContext();
  const mutation = api.agent.startRun.useMutation({
    onSuccess: () => {
      toast.success('Agent run started');
      void utils.agent.getRuns.invalidate();
    },
    onError: (error) => {
      toast.error('Failed to start agent run');
      console.error('Error starting agent run:', error);
    },
  });

  return mutation;
}
