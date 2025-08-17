import { NextResponse } from 'next/server';
import { httpRequest } from '../../../../../src/lib/http/client';

export async function POST(req: Request) {
  try {
    const { agentRunId, output, webhookUrl } = await req.json();

    if (!agentRunId || !output || !webhookUrl) {
      return new NextResponse('Missing agentRunId, output, or webhookUrl', {
        status: 400,
      });
    }

    console.log(
      `Attempting to send agent output for run ${agentRunId} to webhook: ${webhookUrl}`
    );

    // Use httpRequest for retries and timeouts
    try {
      await httpRequest({
        url: webhookUrl,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data: { agentRunId, output },
        timeoutMs: 10000,
        retries: 2,
      });
      console.log(`Successfully sent webhook for run ${agentRunId}.`);
      return new NextResponse('Webhook sent successfully', { status: 200 });
    } catch (err: any) {
      console.error(
        `Failed to send webhook for run ${agentRunId}:`,
        err?.message || err
      );
      return new NextResponse(
        `Failed to send webhook: ${err?.message || 'Unknown error'}`,
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in agent webhook API:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
