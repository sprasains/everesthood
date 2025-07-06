import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { agentRunId, output, webhookUrl } = await req.json();

    if (!agentRunId || !output || !webhookUrl) {
      return new NextResponse('Missing agentRunId, output, or webhookUrl', { status: 400 });
    }

    console.log(`Attempting to send agent output for run ${agentRunId} to webhook: ${webhookUrl}`);

    // In a real scenario, you would add more robust error handling, retries, etc.
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ agentRunId, output }),
    });

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text();
      console.error(`Failed to send webhook for run ${agentRunId}. Status: ${webhookResponse.status}, Response: ${errorText}`);
      return new NextResponse(`Failed to send webhook: ${errorText}`, { status: 500 });
    }

    console.log(`Successfully sent webhook for run ${agentRunId}.`);
    return new NextResponse('Webhook sent successfully', { status: 200 });
  } catch (error) {
    console.error('Error in agent webhook API:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
