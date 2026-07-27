export type WhatsAppFlowId =
  | 'cod_order_confirmation'
  | 'order_confirmed'
  | 'prepaid_order_confirmed'
  | 'order_shipped'
  | 'out_for_delivery'
  | 'order_delivered'
  | 'review_request'
  | 'reorder_reminder'
  | 'abandoned_cart'
  | 'order_cancelled'
  | 'payment_failed'
  | 'return_approved';

export type WhatsAppFlowConfig = {
  id: WhatsAppFlowId;
  flowNumber: number;
  title: string;
  templateName: string;
  trigger: string;
  description: string;
  delayNotice?: string;
  variables: string[];
  templateText: string;
  quickReplyButtons?: string[];
};

export type WhatsAppPayload = {
  customerName: string;
  customerPhone?: string;
  orderId?: string;
  productList?: string;
  orderTotal?: string | number;
  trackingLink?: string;
  reviewLink?: string;
  websiteLink?: string;
  cartLink?: string;
  paymentLink?: string;
};

export const ANNAVEDAH_WHATSAPP_FLOWS: Record<WhatsAppFlowId, WhatsAppFlowConfig> = {
  cod_order_confirmation: {
    id: 'cod_order_confirmation',
    flowNumber: 1,
    title: 'FLOW 1 – COD ORDER PLACED',
    templateName: 'cod_order_confirmation',
    trigger: 'Customer places an order using Cash on Delivery (COD)',
    description: 'Requires customer confirmation via WhatsApp before processing COD dispatch.',
    variables: ['Customer_Name', 'Order_ID', 'Product_List', 'Order_Total'],
    quickReplyButtons: ['✅ Confirm Order', '❌ Cancel Order'],
    templateText: `👋 Hello {{Customer_Name}},

Thank you for choosing Annavedah Foods! 🌿

We have successfully received your order.

🧾 Order ID: #{{Order_ID}}

📦 Order Summary
{{Product_List}}

💰 Order Total: ₹{{Order_Total}}

As you have selected Cash on Delivery (COD), we require your confirmation before processing your order.

Please choose one of the options below:

✅ Confirm Order

❌ Cancel Order

Once you confirm, we will immediately begin preparing your order for dispatch.

Thank you for trusting Annavedah Foods ❤️`,
  },

  order_confirmed: {
    id: 'order_confirmed',
    flowNumber: 2,
    title: 'FLOW 2 – COD ORDER CONFIRMED',
    templateName: 'order_confirmed',
    trigger: 'Customer clicks "Confirm Order" or staff confirms COD order',
    description: 'Confirms that COD order has entered preparation & packing state.',
    variables: ['Customer_Name', 'Order_ID'],
    templateText: `🎉 Thank you, {{Customer_Name}}!

Your order has been successfully confirmed.

🧾 Order ID: #{{Order_ID}}

We have started preparing your order with care.

Our team is now:

✅ Verifying your products

✅ Carefully packing your order

✅ Preparing it for shipment

You'll receive another WhatsApp message as soon as your package is shipped.

Thank you for choosing Annavedah Foods 🌿`,
  },

  prepaid_order_confirmed: {
    id: 'prepaid_order_confirmed',
    flowNumber: 3,
    title: 'FLOW 3 – PREPAID ORDER',
    templateName: 'prepaid_order_confirmed',
    trigger: 'Online payment (Razorpay / UPI / Card) is successful',
    description: 'Notifies customer of successful payment and order confirmation.',
    variables: ['Customer_Name', 'Order_ID'],
    templateText: `🎉 Thank you, {{Customer_Name}}!

Your payment has been received successfully.

🧾 Order ID: #{{Order_ID}}

💳 Payment Status: Successful

Your order is now confirmed and is being prepared for dispatch.

Our team is carefully packing your products and will ship them shortly.

We'll notify you once your order has been dispatched.

Thank you for shopping with Annavedah Foods ❤️`,
  },

  order_shipped: {
    id: 'order_shipped',
    flowNumber: 4,
    title: 'FLOW 4 – ORDER SHIPPED (Both COD & Prepaid)',
    templateName: 'order_shipped',
    trigger: 'Shipment created / AWB generated via Shiprocket',
    description: 'Sends live tracking link and order progress checklist.',
    variables: ['Customer_Name', 'Order_ID', 'Tracking_Link'],
    templateText: `📦 Great News, {{Customer_Name}}!

Your order has been shipped and is on its way.

🧾 Order ID: #{{Order_ID}}

🚚 Tracking Link
{{Tracking_Link}}

Delivery Progress

🛒 Order Confirmed ✅

📦 Packed ✅

🚚 Shipped ✅

🏠 Out for Delivery ⏳

🎉 Delivered ⏳

We're excited for you to receive your Annavedah Foods products!`,
  },

  out_for_delivery: {
    id: 'out_for_delivery',
    flowNumber: 5,
    title: 'FLOW 5 – OUT FOR DELIVERY',
    templateName: 'out_for_delivery',
    trigger: 'Courier marks status as Out for Delivery',
    description: 'Alerts customer to keep phone handy for delivery executive contact.',
    variables: ['Customer_Name', 'Order_ID'],
    templateText: `🚚 Hello {{Customer_Name}}!

Your order is Out for Delivery today.

🧾 Order ID: #{{Order_ID}}

Please keep your phone nearby as the delivery partner may contact you.

We hope you enjoy your products!

Thank you for choosing Annavedah Foods 🌿`,
  },

  order_delivered: {
    id: 'order_delivered',
    flowNumber: 6,
    title: 'FLOW 6 – ORDER DELIVERED',
    templateName: 'order_delivered',
    trigger: 'Courier marks status as Delivered',
    description: 'Delivered notification and warm thank-you message.',
    variables: ['Customer_Name'],
    templateText: `🎉 Your order has been delivered!

Hello {{Customer_Name}},

We hope your package has reached you safely.

Thank you for choosing Annavedah Foods.

We truly hope you enjoy our products.

If you have any questions or need assistance, we're always here to help.

Happy Healthy Eating! 🌿

Team
Annavedah Foods`,
  },

  review_request: {
    id: 'review_request',
    flowNumber: 7,
    title: 'FLOW 7 – REVIEW REQUEST (24 Hours After Delivery)',
    templateName: 'review_request',
    trigger: '24 hours elapsed post delivery',
    delayNotice: 'Automated 24h post-delivery trigger',
    description: 'Solicits authentic customer feedback and review rating.',
    variables: ['Customer_Name', 'Review_Link'],
    templateText: `❤️ Hi {{Customer_Name}},

We hope you're enjoying your order from Annavedah Foods!

Your feedback means the world to us and helps us serve you even better.

⭐ Would you take just a minute to share your experience?

👉 Leave a Review
{{Review_Link}}

Thank you for supporting an Indian brand that believes in quality, authenticity, and healthy living.

We look forward to serving you again! 🌿`,
  },

  reorder_reminder: {
    id: 'reorder_reminder',
    flowNumber: 8,
    title: 'FLOW 8 – THANK YOU + REORDER REMINDER',
    templateName: 'reorder_reminder',
    trigger: '15 days post delivery',
    delayNotice: 'Automated 15-day repeat purchase nudge',
    description: 'Drives repeat orders for organic pantry staples.',
    variables: ['Customer_Name', 'Website_Link'],
    templateText: `Hello {{Customer_Name}} 👋

Hope you're loving your Annavedah Foods products!

Running low?

Order again today and continue enjoying premium-quality products delivered to your doorstep.

🛒 Shop Now
{{Website_Link}}

Thank you for being a valued customer ❤️`,
  },

  abandoned_cart: {
    id: 'abandoned_cart',
    flowNumber: 9,
    title: 'FLOW 9 – ABANDONED CART',
    templateName: 'abandoned_cart',
    trigger: 'Customer leaves items in cart without checkout',
    description: 'Recovers abandoned shopping sessions via direct link.',
    variables: ['Customer_Name', 'Cart_Link'],
    templateText: `Hi {{Customer_Name}} 👋

Looks like you left something in your cart.

Your favourite products are still waiting for you.

Complete your purchase before they're gone!

🛒 Continue Shopping
{{Cart_Link}}

See you soon!

Team
Annavedah Foods`,
  },

  order_cancelled: {
    id: 'order_cancelled',
    flowNumber: 10,
    title: 'FLOW 10 – ORDER CANCELLED',
    templateName: 'order_cancelled',
    trigger: 'Order is cancelled by customer or admin',
    description: 'Cancellation confirmation with soft re-engagement link.',
    variables: ['Customer_Name', 'Order_ID', 'Website_Link'],
    templateText: `Hello {{Customer_Name}},

Your order #{{Order_ID}} has been cancelled successfully.

If this happened by mistake or you'd like to place a new order, we'd love to serve you again.

🛒 Shop Here
{{Website_Link}}

Thank you,
Team
Annavedah Foods`,
  },

  payment_failed: {
    id: 'payment_failed',
    flowNumber: 11,
    title: 'FLOW 11 – PAYMENT FAILED',
    templateName: 'payment_failed',
    trigger: 'Online payment transaction fails at checkout',
    description: 'Provides direct payment retry link for rapid recovery.',
    variables: ['Customer_Name', 'Order_ID', 'Payment_Link'],
    templateText: `Hi {{Customer_Name}},

Unfortunately, your payment for Order #{{Order_ID}} could not be completed.

No worries! You can try again using the link below.

💳 Complete Payment
{{Payment_Link}}

If you need any assistance, our support team is happy to help.`,
  },

  return_approved: {
    id: 'return_approved',
    flowNumber: 12,
    title: 'FLOW 12 – RETURN/REPLACEMENT APPROVED',
    templateName: 'return_approved',
    trigger: 'Admin approves return or replacement request',
    description: 'Reassures customer regarding return pickup and resolution.',
    variables: ['Customer_Name', 'Order_ID'],
    templateText: `Hello {{Customer_Name}},

Your return/replacement request for Order #{{Order_ID}} has been approved.

Our team will keep you updated throughout the process.

Thank you for your patience and for choosing Annavedah Foods.`,
  },
};

/**
 * Replaces template placeholders with actual values
 */
export function buildWhatsAppMessage(flowId: WhatsAppFlowId, payload: WhatsAppPayload, baseUrl = 'https://annavedah.com'): string {
  const config = ANNAVEDAH_WHATSAPP_FLOWS[flowId];
  if (!config) return '';

  const defaultWebsite = baseUrl;
  const defaultReview = `${baseUrl}/testimonials`;
  const defaultCart = `${baseUrl}/cart`;
  const defaultPayment = payload.orderId ? `${baseUrl}/checkout?retry=${payload.orderId}` : `${baseUrl}/checkout`;
  const defaultTracking = payload.orderId ? `${baseUrl}/order-tracking?id=${payload.orderId}` : `${baseUrl}/order-tracking`;

  let text = config.templateText;

  text = text.replace(/{{Customer_Name}}/g, payload.customerName || 'Valued Customer');
  text = text.replace(/{{Order_ID}}/g, payload.orderId || 'ORDER123');
  text = text.replace(/{{Product_List}}/g, payload.productList || 'Premium Organic Pantry Pack');
  text = text.replace(/{{Order_Total}}/g, String(payload.orderTotal ?? '0'));
  text = text.replace(/{{Tracking_Link}}/g, payload.trackingLink || defaultTracking);
  text = text.replace(/{{Review_Link}}/g, payload.reviewLink || defaultReview);
  text = text.replace(/{{Website_Link}}/g, payload.websiteLink || defaultWebsite);
  text = text.replace(/{{Cart_Link}}/g, payload.cartLink || defaultCart);
  text = text.replace(/{{Payment_Link}}/g, payload.paymentLink || defaultPayment);

  return text;
}

/**
 * Builds standard WhatsApp click-to-chat deep link
 */
export function buildWhatsAppWebUrl(phone: string, flowId: WhatsAppFlowId, payload: WhatsAppPayload, baseUrl = 'https://annavedah.com'): string {
  const messageText = buildWhatsAppMessage(flowId, payload, baseUrl);
  const cleanPhone = phone.replace(/\D/g, '');
  const formattedPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
  return `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(messageText)}`;
}

/**
 * Formats a Meta Cloud API / Wati / Aisensy compatible JSON payload for API triggers
 */
export function buildWhatsAppApiPayload(phone: string, flowId: WhatsAppFlowId, payload: WhatsAppPayload, baseUrl = 'https://annavedah.com') {
  const config = ANNAVEDAH_WHATSAPP_FLOWS[flowId];
  const cleanPhone = phone.replace(/\D/g, '');
  const formattedPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;

  return {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: formattedPhone,
    type: 'template',
    template: {
      name: config.templateName,
      language: { code: 'en' },
      components: [
        {
          type: 'body',
          parameters: config.variables.map((v) => {
            let val = '';
            if (v === 'Customer_Name') val = payload.customerName || 'Customer';
            else if (v === 'Order_ID') val = payload.orderId || '';
            else if (v === 'Product_List') val = payload.productList || '';
            else if (v === 'Order_Total') val = String(payload.orderTotal || '0');
            else if (v === 'Tracking_Link') val = payload.trackingLink || `${baseUrl}/order-tracking`;
            else if (v === 'Review_Link') val = payload.reviewLink || `${baseUrl}/testimonials`;
            else if (v === 'Website_Link') val = payload.websiteLink || baseUrl;
            else if (v === 'Cart_Link') val = payload.cartLink || `${baseUrl}/cart`;
            else if (v === 'Payment_Link') val = payload.paymentLink || `${baseUrl}/checkout`;
            return { type: 'text', text: val };
          }),
        },
      ],
    },
    quick_replies: config.quickReplyButtons || [],
    raw_message_text: buildWhatsAppMessage(flowId, payload, baseUrl),
  };
}
