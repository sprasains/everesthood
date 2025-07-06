import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { callingAgentRunId, targetAgentInstanceId, input } = await req.json();

    if (!callingAgentRunId || !targetAgentInstanceId || !input) {
      return new NextResponse('Missing callingAgentRunId, targetAgentInstanceId, or input', { status: 400 });
    }

    console.log(`Agent ${callingAgentRunId} is calling agent ${targetAgentInstanceId} with input:`, input);

    // In a real LangGraph setup, this would trigger the execution of the target agent.
    // For simulation, we'll just return a mock result.

    // Simulate fetching the target agent's configuration (e.g., its template)
    // const targetAgentTemplate = await prisma.agentTemplate.findUnique({ where: { id: targetAgentInstanceId } });
    // if (!targetAgentTemplate) {
    //   return new NextResponse('Target agent instance not found', { status: 404 });
    // }

    // Simulate the execution of the target agent
    const simulatedOutput = `Output from agent ${targetAgentInstanceId} for input: ${JSON.stringify(input)}.`;

    // Optionally, you might want to record this inter-agent communication
    // For example, in a log or a dedicated table.

    return NextResponse.json({
      status: 'success',
      output: simulatedOutput,
      calledAgentInstanceId: targetAgentInstanceId,
    });
  } catch (error) {
    console.error('Error in agent-to-agent communication API:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
