import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: { agentInstanceId: string } }) {
  try {
    const { agentInstanceId } = params;
    const authHeader = req.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new NextResponse('Unauthorized: Missing or invalid Authorization header', { status: 401 });
    }

    const apiKey = authHeader.substring(7); // Remove 'Bearer '

    // Validate API Key and get user ID
    const apiUser = await prisma.apiKey.findUnique({
      where: {
        key: apiKey,
      },
      select: {
        userId: true,
      },
    });

    if (!apiUser) {
      return new NextResponse('Unauthorized: Invalid API Key', { status: 401 });
    }

    const userId = apiUser.userId;

    // Get agent input from request body
    const { input, mode } = await req.json(); // Assuming input and mode are passed for the simulated agent

    if (!input || !mode) {
      return new NextResponse('Missing input or mode in request body', { status: 400 });
    }

    // Here, you would typically invoke the actual LangGraph agent execution logic.
    // For this task, we'll simulate calling the /api/v1/ai/process endpoint internally.
    // In a real scenario, the agentInstanceId would map to a specific agent configuration.

    // Simulate calling the internal AI processing endpoint
    const internalResponse = await fetch(`${req.nextUrl.origin}/api/v1/ai/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Pass the user ID for internal processing, as the /ai/process route expects a session
        // In a production system, you'd have a more robust internal authentication mechanism
        'X-Internal-User-Id': userId, 
      },
      body: JSON.stringify({
        inputText: input,
        mode: mode,
        // For simplicity, we are not passing runId or humanInput here for initial trigger
        // The /ai/process route would handle creating a new AgentRun record.
      }),
    });

    if (!internalResponse.ok) {
      const errorData = await internalResponse.json();
      return new NextResponse(errorData.message || 'Failed to invoke agent internally', { status: internalResponse.status });
    }

    const agentResult = await internalResponse.json();

    return NextResponse.json({
      message: 'Agent triggered successfully',
      agentInstanceId: agentInstanceId,
      result: agentResult.result,
      runId: agentResult.runId, // Pass back the runId if the agent supports human-in-the-loop
      humanInputPrompt: agentResult.humanInputPrompt, // Pass back human input prompt if agent paused
    });
  } catch (error) {
    console.error('Error triggering agent via API:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
