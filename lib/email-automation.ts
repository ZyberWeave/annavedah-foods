import { isSafeHeaderValue } from '@/lib/email-utils';
import {
  ANNAVEDAH_EMAIL_FLOWS,
  type EmailFlowId,
  type EmailPayload,
  type EmailFlowDefinition,
} from '@/lib/email-templates';

export function getEmailFlowConfig(flowId: EmailFlowId): EmailFlowDefinition | undefined {
  return ANNAVEDAH_EMAIL_FLOWS[flowId];
}

export async function sendAutomatedEmail(flowId: EmailFlowId, recipientEmail: string, payload: EmailPayload, siteUrl = 'https://annavedah.com') {
  const config = getEmailFlowConfig(flowId);
  if (!config) {
    throw new Error(`Invalid email flowId: ${flowId}`);
  }

  if (!isSafeHeaderValue(recipientEmail)) {
    throw new Error('Invalid or unsafe email recipient header');
  }

  const subject = config.subject.replace(/{{Order_ID}}/g, payload.orderId || '').replace(/{{Ticket_ID}}/g, payload.ticketId || '');
  const htmlContent = config.renderHtml(payload, siteUrl);

  console.log(`[Email Engine] Triggering Flow ${config.flowNumber} (${config.id}) to ${recipientEmail}`);

  // If RESEND_API_KEY environment variable is configured, send via Resend
  if (process.env.RESEND_API_KEY) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Annavedah Foods <orders@annavedah.com>',
          to: [recipientEmail],
          subject,
          html: htmlContent,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json();
        console.warn('[Email Engine] Resend dispatch notice:', errJson);
      }
    } catch (err) {
      console.error('[Email Engine] Failed sending via Resend API:', err);
    }
  }

  return {
    success: true,
    flowId,
    flowNumber: config.flowNumber,
    category: config.category,
    recipient: recipientEmail,
    subject,
    html: htmlContent,
    timestamp: new Date().toISOString(),
  };
}
