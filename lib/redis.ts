// BullMQ queue and Redis client export for agent jobs
// Compatibility shim for older modules that imported getAgentJobQueue/getRedis
// Move to the new centralized queue/connection implementations under lib/queue.
import { agentQueue } from './queue/producer';
import { getRedis as getRedisConnection } from './queue/connection';

export async function getAgentJobQueue() {
  // agentQueue is initialized eagerly in producer; return as-is for compatibility
  return agentQueue as any;
}

export async function getRedis() {
  return getRedisConnection();
}
