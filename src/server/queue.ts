// Compatibility shim: re-export the new centralized queue instance for server-side imports.
import { agentQueue } from '../../lib/queue/producer';
import { getRedisConnection } from '../../lib/queue/connection';

const connection = getRedisConnection();

// Export `queue` to match existing imports in the codebase.
export const queue = agentQueue;

export { connection };
