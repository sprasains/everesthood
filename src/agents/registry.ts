import { AgentRunInput, AgentRunOutput } from './contracts';

// LAYMAN: This file is like a phonebook for all the different types of agents our system can run.
// BUSINESS: The agent registry ensures that every agent workflow is discoverable and reusable, so new agents can be added or updated without changing the worker or API code.
// TECHNICAL: Maps agent IDs/types to dynamic import functions for safe, extensible agent execution by the worker service.

export type AgentDefinition = {
  key: string;
  name: string;
  run: (input: AgentRunInput, ctx: any) => Promise<AgentRunOutput>;
};

// Example registry (immutable)
export const agentRegistry: ReadonlyArray<AgentDefinition> = [
  {
    key: 'echo',
    name: 'Echo Agent',
    run: async (input, ctx) => ({ success: true, output: input.input }),
  },
  // Add more agents here as your business grows!
];