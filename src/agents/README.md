# Agent Workflows

Place all agent workflow logic in this directory. Each agent should export a `run` function that can be dynamically imported and executed by the worker service.

## Example Agent Module
```ts
// src/agents/myAgent.ts
export async function run(input: any, mode: string, userId: string) {
  // Agent logic here
  return { result: 'Agent completed', input, mode, userId };
}
```

## Best Practices
- Keep agent logic stateless and idempotent where possible
- Validate all input and handle errors gracefully
- Use async/await for all I/O and DB operations
- Log important events for debugging
- Return structured results for downstream processing

## System Integration
- Agents are executed by the worker service (see /worker)
- Jobs are enqueued via API or scheduler and processed from the Redis queue
- Agents can read/write to the database using Prisma
- Output can trigger notifications, webhooks, or further jobs

## Creative Use Cases
- Content summarization and enrichment
- Automated moderation or spam detection
- Personalized notifications or reminders
- Data aggregation and reporting
- Custom AI personas for unique user experiences

## Testing Agents
- Write unit tests for agent logic in `src/agents/__tests__`
- Use mock inputs to simulate real jobs
- Log output for review and debugging

---

For more advanced agent patterns, see the technical guide or open a discussion in the community! 