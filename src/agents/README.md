# Agent Workflows

Place all agent workflow logic in this directory. Each agent should export a `run` function that can be dynamically imported and executed by the worker service.

Example agent module:

```ts
// src/agents/myAgent.ts
export async function run(input: any, mode: string, userId: string) {
  // Agent logic here
  return { result: 'Agent completed', input, mode, userId };
}
``` 