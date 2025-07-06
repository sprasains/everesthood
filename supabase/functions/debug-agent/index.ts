import { createClient } from '@supabase/supabase-js';
import Redis from 'ioredis';

export default async (req, res) => {
  const { agentId, input, state } = req.body;
  const redis = new Redis(process.env.REDIS_URL!);
  const agent = await import(`../../../src/agents/${agentId}`);
  let currentState = state;
  if (!currentState) {
    currentState = await agent.init(input);
  }
  const nextState = await agent.runStep(currentState);
  await redis.set(`debug:${agentId}`, JSON.stringify(nextState), "EX", 600);
  res.json(nextState);
}; 