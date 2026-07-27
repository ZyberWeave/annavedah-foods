import { NextResponse } from 'next/server';
import { sendAutomatedEmail } from '@/lib/email-automation';
import { ANNAVEDAH_EMAIL_FLOWS, type EmailFlowId } from '@/lib/email-templates';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { flowId, recipient, ...payload } = body;

    if (!flowId || !ANNAVEDAH_EMAIL_FLOWS[flowId as EmailFlowId]) {
      return NextResponse.json({ error: 'Invalid or missing email flowId' }, { status: 400 });
    }

    const targetRecipient = recipient || payload.email || 'customer@example.com';
    const result = await sendAutomatedEmail(flowId as EmailFlowId, targetRecipient, payload);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to dispatch automated email' },
      { status: 500 }
    );
  }
}
