import { AgentRunInput, AgentRunOutput, StepResult, ToolCall } from './contracts';

// Orchestrator to run N steps, emit progress, capture tool logs
export async function runAgentWorkflow(
  steps: Array<{ name: string; run: (input: any, ctx: any) => Promise<any> }>,
  input: AgentRunInput,
  ctx: any,
  onProgress?: (step: StepResult) => void
): Promise<AgentRunOutput> {
  const results: StepResult[] = [];
  let tokensUsed = 0;
  let cost = 0;
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const startedAt = new Date().toISOString();
    let output, error, toolCalls: ToolCall[] = [];
    try {
      output = await step.run(input.input, ctx);
      // Example: collect tool logs from ctx
      if (ctx.toolLogs) toolCalls = ctx.toolLogs;
    } catch (e: any) {
      error = e?.message || String(e);
    }
    const finishedAt = new Date().toISOString();
    const stepResult: StepResult = {
      index: i,
      name: step.name,
      input: input.input,
      output,
      error,
      startedAt,
      finishedAt,
      toolCalls,
    };
    results.push(stepResult);
    if (onProgress) onProgress(stepResult);
    // Update tokens/cost if available
    if (output?.tokensUsed) tokensUsed += output.tokensUsed;
    if (output?.cost) cost += output.cost;
  }
  return {
    success: !results.some(r => r.error),
    output: results[results.length - 1]?.output,
    steps: results,
    tokensUsed,
    cost,
  };
}
