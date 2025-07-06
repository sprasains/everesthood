// LAYMAN: This agent just repeats back whatever you send it, like a parrot. Great for testing!
// BUSINESS: The echo agent is a simple demonstration of the agent execution pipeline. It helps verify that jobs are being processed end-to-end.
// TECHNICAL: Exports a 'run' function that takes input, mode, and userId, and returns a result object.

export async function run(input: any, mode: string, userId: string) {
  return {
    result: `Echo: ${input}`,
    mode,
    userId,
    timestamp: new Date().toISOString(),
  };
} 