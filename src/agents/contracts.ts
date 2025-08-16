// Agent execution contracts and types
export type AgentRunInput = {
  userId: string;
  agentInstanceId: string;
  input: any;
  context?: any;
};

export type AgentRunOutput = {
  success: boolean;
  output: any;
  error?: string;
  steps?: StepResult[];
  tokensUsed?: number;
  cost?: number;
};

export type ToolCall = {
  tool: string;
  params: any;
  result?: any;
  error?: string;
};

export type StepResult = {
  index: number;
  name: string;
  input: any;
  output: any;
  error?: string;
  startedAt: string;
  finishedAt: string;
  toolCalls?: ToolCall[];
};
