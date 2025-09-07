import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import { api } from '@/utils/api';
import { toast } from 'react-hot-toast';
import type { AgentRunResult, ListRunsResponse } from '@/types/agentRun';
import { TRPCClientError } from '@trpc/client';

export function useAgentRun(runId?: string) {
  const router = useRouter();
  const utils = api.useContext();

  const startMutation = api.agentRun.startRun.useMutation({
    onSuccess: (data: AgentRunResult) => {
      toast.success('Agent run started');
      void utils.agentRun.getRun.invalidate({ runId: data.id });
      void router.push(`/runs/${data.id}`);
    },
    onError: (error: TRPCClientError<any>) => {
      toast.error(`Failed to start agent run: ${error.message}`);
    },
  });

  const cancelMutation = api.agentRun.cancelRun.useMutation({
    onSuccess: () => {
      toast.success('Agent run cancelled');
      void utils.agentRun.getRun.invalidate({ runId: runId! });
    },
    onError: (error: TRPCClientError<any>) => {
      toast.error(`Failed to cancel agent run: ${error.message}`);
    },
  });

  const { data: runData, isLoading: isLoadingRun } =
    api.agentRun.getRun.useQuery(
      { runId: runId! },
      {
        enabled: !!runId,
        refetchInterval: (data: AgentRunResult | undefined) =>
          data?.status === 'PENDING' || data?.status === 'RUNNING'
            ? 1000
            : false,
      }
    );

  const { data: runsData, isLoading: isLoadingRuns } =
    api.agentRun.listRuns.useQuery(
      { limit: 10 },
      {
        enabled: !runId,
        refetchInterval: (data: ListRunsResponse | undefined) =>
          data?.runs.some(
            (run: AgentRunResult) =>
              run.status === 'PENDING' || run.status === 'RUNNING'
          )
            ? 1000
            : false,
      }
    );

  const startRun = useCallback(
    async (agentId: string, params?: Record<string, any>) => {
      await startMutation.mutateAsync({ agentId, params });
    },
    [startMutation]
  );

  const cancelRun = useCallback(
    async (runId: string) => {
      await cancelMutation.mutateAsync({ runId });
    },
    [cancelMutation]
  );

  return {
    run: runData,
    runs: runsData?.runs || [],
    nextCursor: runsData?.nextCursor,
    isLoadingRun,
    isLoadingRuns,
    startRun,
    cancelRun,
  };
}
