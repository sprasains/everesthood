// lib/agentLogs.ts
export async function saveAgentLog(log: any) {
  // Save to DB, file, or external service
  // Example: await prisma.agentLog.create({ data: log });
  console.log('Agent log:', log);
}
