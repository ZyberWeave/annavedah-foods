import { NextResponse } from 'next/server';
import {
  ANNAVEDAH_WHATSAPP_FLOWS,
  buildWhatsAppMessage,
  buildWhatsAppWebUrl,
  buildWhatsAppApiPayload,
  type WhatsAppFlowId,
  type WhatsAppPayload,
} from '@/lib/whatsapp-automation';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { flowId, phone, customerName, orderId, productList, orderTotal, trackingLink, reviewLink, websiteLink, cartLink, paymentLink } = body;

    if (!flowId || !ANNAVEDAH_WHATSAPP_FLOWS[flowId as WhatsAppFlowId]) {
      return NextResponse.json({ error: 'Invalid or missing flowId' }, { status: 400 });
    }

    const payload: WhatsAppPayload = {
      customerName: customerName || 'Valued Customer',
      customerPhone: phone || '',
      orderId: orderId || '',
      productList: productList || '',
      orderTotal: orderTotal || '',
      trackingLink,
      reviewLink,
      websiteLink,
      cartLink,
      paymentLink,
    };

    const targetPhone = phone || '919876543210';
    const messageText = buildWhatsAppMessage(flowId as WhatsAppFlowId, payload);
    const webUrl = buildWhatsAppWebUrl(targetPhone, flowId as WhatsAppFlowId, payload);
    const apiPayload = buildWhatsAppApiPayload(targetPhone, flowId as WhatsAppFlowId, payload);

    return NextResponse.json({
      success: true,
      flowId,
      templateName: ANNAVEDAH_WHATSAPP_FLOWS[flowId as WhatsAppFlowId].templateName,
      recipient: targetPhone,
      messageText,
      webUrl,
      apiPayload,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to generate WhatsApp notification' },
      { status: 500 }
    );
  }
}
