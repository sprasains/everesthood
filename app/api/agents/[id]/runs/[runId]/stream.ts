import { NextRequest } from 'next/server';
import { prisma } from '../../../../../prisma';

// GET /api/agents/[id]/runs/:runId/stream - SSE for live progress
export async function GET(req: NextRequest, { params }: { params: { id: string, runId: string } }) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let lastStep = 0;
      while (true) {
        const run = await prisma.agentRun.findUnique({
          where: { id: params.runId },
          include: { steps: true },
        });
        if (!run) break;
        const steps = run.steps.slice(lastStep);
        for (const step of steps) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(step)}\n\n`));
          lastStep++;
        }
        if (run.status === 'COMPLETED' || run.status === 'FAILED') break;
        await new Promise(res => setTimeout(res, 1000));
      }
      controller.close();
    }
  });
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
