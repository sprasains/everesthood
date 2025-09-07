import { agentRouter } from './routers/agent';
import { agentRunRouter } from './routers/agentRun';
import { createTRPCRouter } from './trpc';

export const appRouter = createTRPCRouter({
  agent: agentRouter,
  agentRun: agentRunRouter,
});

export type AppRouter = typeof appRouter;
