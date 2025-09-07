interface AgentRunResult {
  id: string;
  agentId: string;
  userId: string;
  status:
    | 'PENDING'
    | 'RUNNING'
    | 'COMPLETED'
    | 'FAILED'
    | 'CANCELLED'
    | 'AWAITING_INPUT';
  startTime: Date;
  endTime?: Date;
  duration?: number;
  cost?: number;
  credits?: number;
  error?: string;
  results?: unknown;
  createdAt: Date;
  updatedAt: Date;
}

interface ListRunsResponse {
  runs: AgentRunResult[];
  nextCursor?: string;
}

export type { AgentRunResult, ListRunsResponse };
