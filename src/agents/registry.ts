// LAYMAN: This file is like a phonebook for all the different types of agents our system can run.
// BUSINESS: The agent registry ensures that every agent workflow is discoverable and reusable, so new agents can be added or updated without changing the worker or API code.
// TECHNICAL: Maps agent IDs/types to dynamic import functions for safe, extensible agent execution by the worker service.

export const agentRegistry: Record<string, () => Promise<{ run: (input: any, mode: string, userId: string) => Promise<any> }>> = {
  // LAYMAN: The 'echo' agent just repeats back what you send it, like a parrot.
  // BUSINESS: This is a demo agent for testing the system end-to-end.
  // TECHNICAL: Imports the echo agent module, which exports a 'run' function.
  'echo': () => import('./echo'),
  // Add more agents here as your business grows!
}; 