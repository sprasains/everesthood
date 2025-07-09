import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AgentRunStatus } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const userId = session.user.id;
    const { inputText, mode, runId, humanInput } = await req.json();

    let agentRun;

    if (runId) {
      // Resuming an existing run
      agentRun = await prisma.agentRun.findUnique({
        where: { id: runId },
      });

      if (!agentRun || agentRun.status !== 'AWAITING_INPUT') {
        return new NextResponse('Invalid or non-pausable run ID', { status: 400 });
      }
      // Here, you would load the pausedState and inject humanInput
      // For simulation, we'll just continue with a new simulated result
    } else {
      // Starting a new run
      agentRun = await prisma.agentRun.create({
        data: {
          userId: userId,
          agentTemplateId: 'simulated-agent', // Replace with actual agent template ID
          status: 'RUNNING',
          input: { inputText, mode },
        },
      });
    }

    if (!inputText || !mode) {
      return new NextResponse('Missing inputText or mode', { status: 400 });
    }

    // Fetch user's current usage and limit
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        currentMonthExecutionCount: true,
        monthlyExecutionLimit: true,
        email: true,
      },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    // Quota Enforcement (Task 73)
    if (user.currentMonthExecutionCount >= user.monthlyExecutionLimit) {
      return new NextResponse('Monthly execution quota exceeded. Please upgrade your plan.', { status: 403 });
    }

    // Simulate AI processing (replace with actual AI logic)
    let simulatedResult;
    let newStatus: AgentRunStatus = 'COMPLETED';
    let humanPrompt: string | null = null;
    let agentState: any = null;

    // Simulate a condition where the agent might need human input
    if (inputText.toLowerCase().includes('pause')) {
      newStatus = 'AWAITING_INPUT';
      humanPrompt = 'I need more information to proceed. What else can you tell me?';
      agentState = { /* This would be the actual LangGraph state object */ input: inputText, mode };
      simulatedResult = 'Agent paused, awaiting human input.';
    } else if (runId && humanInput) {
      // If resuming, incorporate human input into the simulated result
      simulatedResult = `Resumed with human input: "${humanInput}". Final **${mode}** result for: "${inputText.substring(0, 50)}...".`;
    } else {
      simulatedResult = `This is a simulated **${mode}** result for: "${inputText.substring(0, 50)}...".`;
    }

    // Update AgentRun record
    const updatedAgentRun = await prisma.agentRun.update({
      where: { id: agentRun.id },
      data: {
        status: newStatus,
        output: newStatus === 'COMPLETED' ? simulatedResult : undefined,
        pausedState: agentState,
        humanInputPrompt: humanPrompt,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        webhookUrl: true,
        output: true,
        // nextAgentInstanceId: true, // Not a field on AgentRun
      },
    });

    // If the agent run is completed and a webhook URL is configured, send the output
    if (newStatus === 'COMPLETED' && updatedAgentRun.webhookUrl && updatedAgentRun.output) {
      try {
        // Use a base URL from environment or fallback to request header
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || req.headers.get('origin') || '';
        await fetch(`${baseUrl}/api/v1/agent-webhook`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            agentRunId: updatedAgentRun.id,
            output: updatedAgentRun.output,
            webhookUrl: updatedAgentRun.webhookUrl,
          }),
        });
        console.log(`Agent output for run ${updatedAgentRun.id} sent to webhook.`);
      } catch (webhookError) {
        console.error(`Failed to send webhook for run ${updatedAgentRun.id}:`, webhookError);
      }
    }

    // Fetch the AgentInstance for this run to get nextAgentInstanceId
    const agentInstance = await prisma.agentInstance.findFirst({
      where: { userId: userId },
      select: { nextAgentInstanceId: true },
    });

    // If the agent run is completed and a next agent is configured, trigger it (Task 64)
    if (newStatus === 'COMPLETED' && agentInstance?.nextAgentInstanceId && updatedAgentRun.output) {
      try {
        // Fetch the next agent instance to get its user ID (for internal authentication)
        const nextAgentInstance = await prisma.agentInstance.findUnique({
          where: { id: agentInstance.nextAgentInstanceId },
          select: { userId: true },
        });

        if (nextAgentInstance) {
          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || req.headers.get('origin') || '';
          await fetch(`${baseUrl}/api/v1/ai/process`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Internal-User-Id': nextAgentInstance.userId, // Pass user ID for internal auth
            },
            body: JSON.stringify({
              inputText: JSON.stringify(updatedAgentRun.output), // Pass output as input to next agent
              mode: 'auto', // Or a default mode for chained agents
              // No runId for a new chained run, it will create a new AgentRun record
            }),
          });
          console.log(`Chained agent ${agentInstance.nextAgentInstanceId} triggered by run ${updatedAgentRun.id}.`);
        }
      } catch (chainingError) {
        console.error(`Failed to trigger chained agent ${agentInstance?.nextAgentInstanceId}:`, chainingError);
      }
    }

    // Increment execution count (Task 72)
    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        currentMonthExecutionCount: {
          increment: 1,
        },
      },
    });

    // Quota Warning Notifications (Task 78)
    const newCount = updatedUser.currentMonthExecutionCount;
    const limit = updatedUser.monthlyExecutionLimit;

    if (limit > 0) { // Only send notifications if there's a limit set
      const eightyPercent = Math.floor(limit * 0.8);
      const ninetyFivePercent = Math.floor(limit * 0.95);

      if (newCount === eightyPercent) {
        await prisma.notification.create({
          data: {
            recipientId: userId,
            actorId: userId, // Self-triggered notification
            type: 'SYSTEM',
            entityId: null,
            isRead: false,
            // content: `You have used 80% of your monthly agent executions (${newCount}/${limit}). Consider upgrading!`, // Custom content
          },
        });
        // TODO: Add email notification logic here
        console.log(`User ${userId} reached 80% quota.`);
      } else if (newCount === ninetyFivePercent) {
        await prisma.notification.create({
          data: {
            recipientId: userId,
            actorId: userId, // Self-triggered notification
            type: 'SYSTEM',
            entityId: null,
            isRead: false,
            // content: `You have used 95% of your monthly agent executions (${newCount}/${limit}). Upgrade now to avoid interruptions!`, // Custom content
          },
        });
        // TODO: Add email notification logic here
        console.log(`User ${userId} reached 95% quota.`);
      } else if (newCount === limit) {
        await prisma.notification.create({
          data: {
            recipientId: userId,
            actorId: userId, // Self-triggered notification
            type: 'SYSTEM',
            entityId: null,
            isRead: false,
            // content: `You have reached your monthly agent execution limit (${newCount}/${limit}). Upgrade your plan to continue!`, // Custom content
          },
        });
        // TODO: Add email notification logic here
        console.log(`User ${userId} reached 100% quota.`);
      }
    }

    return NextResponse.json({ result: simulatedResult, runId: agentRun.id, humanInputPrompt: humanPrompt });
  } catch (error) {
    console.error('Error processing AI request:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
