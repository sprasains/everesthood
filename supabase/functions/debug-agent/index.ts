import { createClient } from '@supabase/supabase-js';
import { isRedisBypassed } from '../../../lib/featureFlags';

export default async (req, res) => {
  const { agentId, input, state } = req.body;
  let redis: any;
  if (await isRedisBypassed()) {
    // eslint-disable-next-line no-console
    console.warn('[DEV] Redis is bypassed in debug-agent (feature flag). All operations are no-ops.');
    redis = {
      get: async () => null,
      set: async () => true,
      del: async () => true,
    };
  } else {
    const Redis = require('ioredis');
    redis = new Redis(process.env.REDIS_URL!);
  }
  const agent = await import(`../../../src/agents/${agentId}`);
  let currentState = state;
  if (!currentState) {
    currentState = await agent.init(input);
  }
  const nextState = await agent.runStep(currentState);
  await redis.set(`debug:${agentId}`, JSON.stringify(nextState), "EX", 600);
  res.json(nextState);
}; 