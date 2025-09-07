// server/queue.ts
// Compatibility shim: re-export the new centralized queue and connection helpers
// so older modules that require/import `server/queue` keep working.
import { JobScheduler } from 'bullmq';
import { agentQueue } from '../lib/queue/producer';
import { getRedisConnection } from '../lib/queue/connection';

// Lazy create a connection instance from the new connection factory
const connection = getRedisConnection();

// Provide a best-effort JobScheduler for consumers that expect one.
let agentJobScheduler: JobScheduler | undefined;
try {
  agentJobScheduler = new JobScheduler(
    (agentQueue as any).name || 'agent-run',
    {
      connection,
    }
  );
} catch (err) {
  // If JobScheduler can't be constructed in this environment, export undefined
  // Consumers should handle missing scheduler gracefully.
  agentJobScheduler = undefined;
}

export { agentQueue as agentJobQueue, agentJobScheduler, connection };
