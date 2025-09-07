import { z } from 'zod';

export const RunJobSchema = z.object({
  runId: z.string(),
  agentInstanceId: z.string(),
  userId: z.string(),
  input: z.any().optional(),
  requestId: z.string().optional(),
});

export const CronJobSchema = z.object({
  agentInstanceId: z.string(),
  schedule: z.string(),
  timezone: z.string().optional(),
});

export type RunJob = z.infer<typeof RunJobSchema>;
export type CronJob = z.infer<typeof CronJobSchema>;
