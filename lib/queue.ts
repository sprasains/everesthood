// lib/queue.ts
// Compatibility shim: re-export the new queue/connection APIs so older imports
// that reference `lib/queue` keep working.
import { agentQueue } from './queue/producer';
import { getRedisConnection } from './queue/connection';
import { JobScheduler } from 'bullmq';

const connection = getRedisConnection();

let agentJobScheduler: JobScheduler | undefined;
try {
  agentJobScheduler = new JobScheduler(
    (agentQueue as any).name || 'agent-run',
    {
      connection,
    }
  );
} catch (err) {
  agentJobScheduler = undefined;
}

export { agentQueue, agentJobScheduler, connection };
