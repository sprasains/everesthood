// src/agents/exampleAgent.ts
// Example agent module. Add more agents in this directory!
export async function run(input: { topic: string }, mode: string, userId: string, creds?: any) {
  // Use creds.openAiApiKey or other service keys if needed
  const { topic } = input;
  // Simulate AI work
  return { title: `Post about ${topic}`, body: `This is a generated post about ${topic}.` };
}
