import { escapeHtml } from '@/lib/email-utils';

export type EmailFlowCategory =
  | 'Onboarding & Auth'
  | 'Order Lifecycle'
  | 'Post-Purchase & Loyalty'
  | 'Support & B2B'
  | 'Internal Admin';

export type EmailFlowId =
  | 'welcome_email'
  | 'email_verification'
  | 'newsletter_confirmation'
  | 'cod_order_placed'
  | 'cod_order_confirmed'
  | 'prepaid_order_confirmed'
  | 'tax_invoice'
  | 'order_processing'
  | 'order_packed'
  | 'order_shipped'
  | 'out_for_delivery'
  | 'order_delivered'
  | 'review_request'
  | 'reorder_reminder'
  | 'wishlist_reminder'
  | 'abandoned_cart_1h'
  | 'cart_reminder_24h'
  | 'cart_discount_48h'
  | 'payment_failed'
  | 'order_cancelled'
  | 'refund_initiated'
  | 'refund_completed'
  | 'return_requested'
  | 'return_approved'
  | 'replacement_shipped'
  | 'replacement_delivered'
  | 'birthday_wishes'
  | 'anniversary_wishes'
  | 'festival_greetings'
  | 'new_product_launch'
  | 'back_in_stock'
  | 'price_drop_alert'
  | 'flash_sale'
  | 'limited_time_offer'
  | 'bulk_order_enquiry'
  | 'export_enquiry_ack'
  | 'contact_form_confirmation'
  | 'distributor_application'
  | 'career_application'
  | 'support_ticket_created'
  | 'support_ticket_closed'
  | 'password_reset'
  | 'change_email_request'
  | 'change_password_success'
  | 'account_deleted'
  | 'admin_low_stock_alert'
  | 'admin_new_order_notification'
  | 'admin_cod_confirmed_notice'
  | 'admin_daily_sales_report'
  | 'admin_business_report';

export type EmailPayload = {
  customerName?: string;
  email?: string;
  orderId?: string;
  productList?: string;
  orderTotal?: string | number;
  otpCode?: string;
  verificationLink?: string;
  trackingLink?: string;
  invoiceLink?: string;
  reviewLink?: string;
  reorderLink?: string;
  cartLink?: string;
  discountCode?: string;
  paymentLink?: string;
  refundAmount?: string | number;
  productName?: string;
  ticketId?: string;
  enquiryMessage?: string;
  adminReportDetails?: string;
  siteUrl?: string;
};

export type EmailFlowDefinition = {
  id: EmailFlowId;
  flowNumber: number;
  category: EmailFlowCategory;
  title: string;
  subject: string;
  trigger: string;
  description: string;
  delayNotice?: string;
  variables: string[];
  renderHtml: (payload: EmailPayload, siteUrl?: string) => string;
};

// Standard Brand Header & Footer Wrapper HTML
function wrapBrandEmailLayout(opts: {
  title: string;
  previewText?: string;
  bodyContentHtml: string;
  siteUrl?: string;
}): string {
  const base = opts.siteUrl || 'https://annavedah.com';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(opts.title)}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #faf6f0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #2d1b15; -webkit-font-smoothing: antialiased; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e8ddd0; box-shadow: 0 4px 12px rgba(45, 27, 21, 0.05); }
    .header { background: linear-gradient(135deg, #8b1a1a 0%, #6d1414 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
    .header-logo { font-family: Georgia, serif; font-size: 26px; font-weight: bold; letter-spacing: 1px; color: #f5e6c8; margin: 0; }
    .header-sub { font-size: 11px; text-transform: uppercase; tracking: 2px; color: #c9a45c; margin-top: 4px; font-weight: bold; }
    .content { padding: 32px 28px; font-size: 15px; line-height: 1.6; color: #2d1b15; }
    .button { display: inline-block; background-color: #8b1a1a; color: #ffffff !important; font-weight: bold; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-size: 14px; text-align: center; margin: 20px 0; box-shadow: 0 4px 10px rgba(139, 26, 26, 0.2); }
    .button:hover { background-color: #6d1414; }
    .badge { display: inline-block; background-color: #faf6f0; color: #8b1a1a; border: 1px solid #c9a45c; font-weight: bold; padding: 4px 12px; border-radius: 20px; font-size: 12px; margin-bottom: 12px; }
    .summary-box { background-color: #faf6f0; border-left: 4px solid #c9a45c; padding: 16px 20px; border-radius: 0 12px 12px 0; margin: 20px 0; }
    .footer { background-color: #2d1b15; color: #e8ddd0; padding: 28px 24px; text-align: center; font-size: 12px; line-height: 1.8; }
    .footer a { color: #c9a45c; text-decoration: none; font-weight: font-bold; }
    .social-links { margin-bottom: 16px; }
    .social-links a { margin: 0 8px; font-size: 13px; }
  </style>
</head>
<body>
  <div style="background-color: #faf6f0; padding: 24px 12px;">
    <div class="container">
      <!-- Header -->
      <div class="header">
        <h1 class="header-logo">ANNAVEDAH FOODS</h1>
        <div class="header-sub">Pure · Organic · Authentic Wellness</div>
      </div>

      <!-- Main Body -->
      <div class="content">
        ${opts.bodyContentHtml}
      </div>

      <!-- Footer -->
      <div class="footer">
        <div class="social-links">
          <a href="${base}">Official Website</a> •
          <a href="https://wa.me/919876543210">WhatsApp Support</a> •
          <a href="${base}/testimonials">Reviews</a>
        </div>
        <p style="margin: 4px 0;">Annavedah Foods Pvt Ltd • Crafted with care in India 🌿</p>
        <p style="margin: 4px 0; color: #a39282;">Need help? Contact support at <a href="mailto:support@annavedah.com">support@annavedah.com</a> or +91 98765 43210</p>
        <p style="margin-top: 12px; font-size: 11px; color: #7a6b5d;">
          <a href="${base}/privacy">Privacy Policy</a> | <a href="${base}/terms">Terms of Service</a> | <a href="${base}">Unsubscribe</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// Master collection generator for 50 Email Flows
export function buildEmailFlowDefinition(flowId: EmailFlowId, category: EmailFlowCategory, flowNumber: number, title: string, subject: string, trigger: string, description: string, variables: string[], bodyContentBuilder: (p: EmailPayload, siteUrl: string) => string): EmailFlowDefinition {
  return {
    id: flowId,
    flowNumber,
    category,
    title,
    subject,
    trigger,
    description,
    variables,
    renderHtml: (payload: EmailPayload, siteUrl = 'https://annavedah.com') => {
      const inner = bodyContentBuilder(payload, siteUrl);
      return wrapBrandEmailLayout({
        title,
        bodyContentHtml: inner,
        siteUrl,
      });
    },
  };
}

// Sample implementation mapping of key flows for Annavedah Foods
export const ANNAVEDAH_EMAIL_FLOWS: Record<EmailFlowId, EmailFlowDefinition> = {
  welcome_email: buildEmailFlowDefinition(
    'welcome_email',
    'Onboarding & Auth',
    1,
    'Welcome Email',
    'Welcome to Annavedah Foods! 🌿',
    'Customer creates an account or subscribes to newsletter',
    'Introduces brand heritage, organic purity values, and offers product catalog exploration.',
    ['Customer_Name'],
    (p, url) => `
      <div class="badge">Welcome to the Family</div>
      <h2 style="color: #2d1b15; font-size: 22px; margin-top: 0;">Namaste, ${escapeHtml(p.customerName || 'Friend')}! 🙏</h2>
      <p>Thank you for joining <strong>Annavedah Foods</strong>. We are passionate about bringing traditional Indian food wisdom and 100% natural, unadulterated organic nutrition straight to your kitchen.</p>
      <div class="summary-box">
        <h4 style="margin: 0 0 8px 0; color: #8b1a1a;">Why Choose Annavedah Foods?</h4>
        <ul style="margin: 0; padding-left: 20px; font-size: 14px;">
          <li>100% Stone-Ground Organic Spices & Powders</li>
          <li>Zero Artificial Preservatives, Colors or Fillers</li>
          <li>Directly Sourced from Farm Cooperatives</li>
        </ul>
      </div>
      <p>Explore our handcrafted range of wellness powders, stone-ground attas, and curated organic gift boxes.</p>
      <div style="text-align: center;">
        <a href="${url}/products" class="button">Shop Organic Products Now</a>
      </div>
    `
  ),

  email_verification: buildEmailFlowDefinition(
    'email_verification',
    'Onboarding & Auth',
    2,
    'Email Verification',
    'Verify Your Email Address - Annavedah Foods',
    'New account registration or security verification',
    'Provides secure verification button and OTP code for account validation.',
    ['Customer_Name', 'OTP_Code', 'Verification_Link'],
    (p) => `
      <div class="badge">Account Verification</div>
      <h2 style="color: #2d1b15; margin-top: 0;">Verify Your Email Address</h2>
      <p>Hello ${escapeHtml(p.customerName || 'User')}, please confirm your email address to activate your Annavedah Foods account.</p>
      ${p.otpCode ? `<div style="text-align: center; background: #faf6f0; border: 2px dashed #c9a45c; padding: 16px; border-radius: 12px; font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #8b1a1a; margin: 20px 0;">${escapeHtml(p.otpCode)}</div>` : ''}
      <div style="text-align: center;">
        <a href="${escapeHtml(p.verificationLink || '#')}" class="button">Verify Email Address</a>
      </div>
      <p style="font-size: 12px; color: #6b5347;">This code is valid for 10 minutes. If you did not create an account, please ignore this email.</p>
    `
  ),

  newsletter_confirmation: buildEmailFlowDefinition(
    'newsletter_confirmation',
    'Onboarding & Auth',
    3,
    'Newsletter Subscription Confirmation',
    'You\'re Successfully Subscribed to Annavedah Foods! 🍃',
    'Customer signs up for newsletter updates',
    'Confirms newsletter subscription and promises recipes, wellness tips, and exclusive offers.',
    ['Customer_Name'],
    (p, url) => `
      <div class="badge">Subscription Confirmed</div>
      <h2>Thank You for Subscribing!</h2>
      <p>Hi ${escapeHtml(p.customerName || 'Subscriber')}, you are now subscribed to Annavedah Foods newsletter.</p>
      <p>Here is what you can look forward to:</p>
      <ul style="line-height: 1.8;">
        <li>🥗 Authentic Ayurvedic & Organic Recipes</li>
        <li>🎁 Exclusive Insider Discounts & Flash Sale Alerts</li>
        <li>🌱 Organic Superfood Health Insights</li>
      </ul>
      <div style="text-align: center;">
        <a href="${url}/blog" class="button">Read Healthy Living Blog</a>
      </div>
    `
  ),

  cod_order_placed: buildEmailFlowDefinition(
    'cod_order_placed',
    'Order Lifecycle',
    4,
    'COD Order Confirmation Request',
    'Please Confirm Your COD Order #{{Order_ID}} - Annavedah Foods',
    'Customer places a Cash on Delivery (COD) order',
    'Asks customer to confirm or cancel order via 1-click email action buttons.',
    ['Customer_Name', 'Order_ID', 'Product_List', 'Order_Total'],
    (p, url) => `
      <div class="badge">Action Required: Confirm COD</div>
      <h2>Please Confirm Your Cash on Delivery Order</h2>
      <p>Hello ${escapeHtml(p.customerName || 'Customer')}, thank you for choosing Annavedah Foods!</p>
      <p>Order ID: <strong>#${escapeHtml(p.orderId || 'AV-1001')}</strong></p>
      <div class="summary-box">
        <strong>Order Summary:</strong><br>
        ${escapeHtml(p.productList || 'Organic Pantry Items').replace(/\n/g, '<br>')}<br><br>
        <strong>Total Amount: ₹${escapeHtml(String(p.orderTotal || '0'))}</strong>
      </div>
      <p>Since you chose Cash on Delivery, please confirm your order so we can dispatch it right away:</p>
      <div style="text-align: center; gap: 12px;">
        <a href="${url}/cod-confirm?id=${escapeHtml(p.orderId || '')}&action=confirm" class="button" style="background-color: #2e7d32;">✅ Confirm Order</a>
        <a href="${url}/cod-confirm?id=${escapeHtml(p.orderId || '')}&action=cancel" class="button" style="background-color: #c62828;">❌ Cancel Order</a>
      </div>
    `
  ),

  cod_order_confirmed: buildEmailFlowDefinition(
    'cod_order_confirmed',
    'Order Lifecycle',
    5,
    'COD Order Confirmed',
    'Your Order Has Been Confirmed! 🎉 - Annavedah Foods',
    'Customer confirms COD order',
    'Notifies customer that packing and verification has started.',
    ['Customer_Name', 'Order_ID'],
    (p) => `
      <div class="badge">Order Confirmed</div>
      <h2>Order #${escapeHtml(p.orderId || 'AV-1001')} Confirmed!</h2>
      <p>Hi ${escapeHtml(p.customerName || 'Customer')}, your order is confirmed and is now being packed carefully by our team.</p>
      <p>We are verifying quality, sealing packaging, and preparing for courier handover.</p>
    `
  ),

  prepaid_order_confirmed: buildEmailFlowDefinition(
    'prepaid_order_confirmed',
    'Order Lifecycle',
    6,
    'Prepaid Order Confirmation',
    'Payment Received – Your Order is Confirmed - Annavedah Foods',
    'Online payment succeeds',
    'Confirms payment and provides order details.',
    ['Customer_Name', 'Order_ID', 'Order_Total'],
    (p) => `
      <div class="badge">Payment Successful</div>
      <h2>Payment Received for Order #${escapeHtml(p.orderId || 'AV-1001')}</h2>
      <p>Hi ${escapeHtml(p.customerName || 'Customer')}, we have successfully received your payment of ₹${escapeHtml(String(p.orderTotal || '0'))}.</p>
      <p>Your order is confirmed and is being prepared for immediate dispatch.</p>
    `
  ),

  tax_invoice: buildEmailFlowDefinition(
    'tax_invoice',
    'Order Lifecycle',
    7,
    'Tax Invoice Email',
    'Tax Invoice for Order #{{Order_ID}} - Annavedah Foods',
    'Order confirmed & invoice generated',
    'Provides official GST Tax Invoice breakdown and download link.',
    ['Customer_Name', 'Order_ID', 'Invoice_Link'],
    (p, url) => `
      <div class="badge">Tax Invoice</div>
      <h2>Tax Invoice for Order #${escapeHtml(p.orderId || 'AV-1001')}</h2>
      <p>Dear ${escapeHtml(p.customerName || 'Customer')}, please find your tax invoice for your recent order attached.</p>
      <div style="text-align: center;">
        <a href="${escapeHtml(p.invoiceLink || `${url}/account/orders`)}" class="button">Download Official Invoice PDF</a>
      </div>
    `
  ),

  order_processing: buildEmailFlowDefinition(
    'order_processing',
    'Order Lifecycle',
    8,
    'Order Processing',
    'We\'re Preparing Your Order #${Order_ID} - Annavedah Foods',
    'Order enters processing status',
    'Quality inspection and batch inventory allocation notification.',
    ['Customer_Name', 'Order_ID'],
    (p) => `
      <div class="badge">Processing</div>
      <h2>We're Preparing Your Package</h2>
      <p>Hi ${escapeHtml(p.customerName || 'Customer')}, our team is carefully inspecting and assembling your items for Order #${escapeHtml(p.orderId || '')}.</p>
    `
  ),

  order_packed: buildEmailFlowDefinition(
    'order_packed',
    'Order Lifecycle',
    9,
    'Order Packed',
    'Your Order is Packed & Ready to Ship 📦 - Annavedah Foods',
    'Order packed and sealed',
    'Notifies customer that package is awaiting courier pickup.',
    ['Customer_Name', 'Order_ID'],
    (p) => `
      <div class="badge">Packed</div>
      <h2>Package Sealed & Ready!</h2>
      <p>Hi ${escapeHtml(p.customerName || 'Customer')}, Order #${escapeHtml(p.orderId || '')} has been packed in eco-friendly protective packaging and is awaiting courier pickup.</p>
    `
  ),

  order_shipped: buildEmailFlowDefinition(
    'order_shipped',
    'Order Lifecycle',
    10,
    'Order Shipped',
    'Your Order is on the Way 🚚 #{{Order_ID}} - Annavedah Foods',
    'Shipment created via Shiprocket',
    'Provides live courier tracking link and AWB details.',
    ['Customer_Name', 'Order_ID', 'Tracking_Link'],
    (p, url) => `
      <div class="badge">In Transit</div>
      <h2>Order #${escapeHtml(p.orderId || 'AV-1001')} Has Been Shipped!</h2>
      <p>Hi ${escapeHtml(p.customerName || 'Customer')}, your package is on its way!</p>
      <div style="text-align: center;">
        <a href="${escapeHtml(p.trackingLink || `${url}/order-tracking`)}" class="button">Track Package Live</a>
      </div>
    `
  ),

  out_for_delivery: buildEmailFlowDefinition(
    'out_for_delivery',
    'Order Lifecycle',
    11,
    'Out for Delivery',
    'Your Order Will Arrive Today 🚚 - Annavedah Foods',
    'Courier marks Out for Delivery',
    'Reminds customer to keep phone nearby for delivery executive.',
    ['Customer_Name', 'Order_ID'],
    (p) => `
      <div class="badge">Arriving Today</div>
      <h2>Out for Delivery!</h2>
      <p>Hi ${escapeHtml(p.customerName || 'Customer')}, your package for Order #${escapeHtml(p.orderId || '')} is out for delivery today. Please keep your phone nearby.</p>
    `
  ),

  order_delivered: buildEmailFlowDefinition(
    'order_delivered',
    'Order Lifecycle',
    12,
    'Order Delivered',
    'Delivered Successfully! 🎉 Order #{{Order_ID}}',
    'Courier marks Delivered',
    'Confirms delivery and thanks customer for choosing Annavedah Foods.',
    ['Customer_Name', 'Order_ID'],
    (p) => `
      <div class="badge">Delivered</div>
      <h2>Your Package Has Arrived!</h2>
      <p>Hi ${escapeHtml(p.customerName || 'Customer')}, Order #${escapeHtml(p.orderId || '')} has been delivered successfully. We hope you enjoy your organic products!</p>
    `
  ),

  review_request: buildEmailFlowDefinition(
    'review_request',
    'Post-Purchase & Loyalty',
    13,
    'Review Request (24 Hours After Delivery)',
    'How Was Your Experience? ⭐ - Annavedah Foods',
    '24 hours post-delivery',
    'Asks customer for honest product feedback and rating.',
    ['Customer_Name', 'Review_Link'],
    (p, url) => `
      <div class="badge">Share Your Feedback</div>
      <h2>How Was Your Annavedah Experience?</h2>
      <p>Hi ${escapeHtml(p.customerName || 'Customer')}, we hope you're loving your organic products! Could you take 1 minute to leave us a review?</p>
      <div style="text-align: center;">
        <a href="${escapeHtml(p.reviewLink || `${url}/testimonials`)}" class="button">Leave a Review ⭐⭐⭐⭐⭐</a>
      </div>
    `
  ),

  reorder_reminder: buildEmailFlowDefinition(
    'reorder_reminder',
    'Post-Purchase & Loyalty',
    14,
    'Reorder Reminder (15–30 Days Later)',
    'Running Low? Time to Reorder Your Organic Pantry! 🌿',
    '15 to 30 days post-delivery',
    'Nudges repeat purchase for pantry staples.',
    ['Customer_Name', 'Reorder_Link'],
    (p, url) => `
      <div class="badge">Restock & Save</div>
      <h2>Running Low on Pantry Essentials?</h2>
      <p>Hi ${escapeHtml(p.customerName || 'Customer')}, hope you're enjoying your fresh organic powders! Time to restock your pantry?</p>
      <div style="text-align: center;">
        <a href="${escapeHtml(p.reorderLink || `${url}/products`)}" class="button">Reorder Favorite Products</a>
      </div>
    `
  ),

  wishlist_reminder: buildEmailFlowDefinition(
    'wishlist_reminder',
    'Post-Purchase & Loyalty',
    15,
    'Wishlist Reminder',
    'Your Wishlist Favorites Are Waiting! 🎁',
    'Saved wishlist items left unpurchased',
    'Reminds customers of items saved in wishlist.',
    ['Customer_Name'],
    (p, url) => `
      <div class="badge">Wishlist Saved</div>
      <h2>Still Thinking About These Items?</h2>
      <p>Hi ${escapeHtml(p.customerName || 'Customer')}, your saved wishlist items are still available.</p>
      <div style="text-align: center;">
        <a href="${url}/wishlist" class="button">View Saved Wishlist</a>
      </div>
    `
  ),

  abandoned_cart_1h: buildEmailFlowDefinition(
    'abandoned_cart_1h',
    'Post-Purchase & Loyalty',
    16,
    'Abandoned Cart (1 Hour Later)',
    'You Left Something Behind 🛒 - Annavedah Foods',
    '1 hour after cart abandonment',
    'First gentle reminder to return and complete checkout.',
    ['Customer_Name', 'Cart_Link'],
    (p, url) => `
      <div class="badge">Cart Reminder</div>
      <h2>Did Something Interrupt Your Order?</h2>
      <p>Hi ${escapeHtml(p.customerName || 'Customer')}, your organic pantry items are still waiting in your cart.</p>
      <div style="text-align: center;">
        <a href="${escapeHtml(p.cartLink || `${url}/cart`)}" class="button">Complete Your Order</a>
      </div>
    `
  ),

  cart_reminder_24h: buildEmailFlowDefinition(
    'cart_reminder_24h',
    'Post-Purchase & Loyalty',
    17,
    'Second Cart Reminder (24 Hours Later)',
    'Your Favorite Organic Products Are Ready For You 🌿',
    '24 hours after cart abandonment',
    'Second reminder before items sell out.',
    ['Customer_Name', 'Cart_Link'],
    (p, url) => `
      <div class="badge">Limited Stock</div>
      <h2>Don't Miss Out on Fresh Stock</h2>
      <p>Hi ${escapeHtml(p.customerName || 'Customer')}, items in your cart are selling fast. Secure your order today.</p>
      <div style="text-align: center;">
        <a href="${escapeHtml(p.cartLink || `${url}/cart`)}" class="button">Return to Cart</a>
      </div>
    `
  ),

  cart_discount_48h: buildEmailFlowDefinition(
    'cart_discount_48h',
    'Post-Purchase & Loyalty',
    18,
    'Cart Discount (48 Hours Later)',
    'Here\'s 10% OFF to Complete Your Purchase! 🎁',
    '48 hours after cart abandonment',
    'Offers incentive code to close abandoned cart.',
    ['Customer_Name', 'Discount_Code', 'Cart_Link'],
    (p, url) => `
      <div class="badge">Exclusive 10% Coupon</div>
      <h2>Enjoy 10% OFF Your Order</h2>
      <p>Hi ${escapeHtml(p.customerName || 'Customer')}, use coupon code <strong>${escapeHtml(p.discountCode || 'WELCOME10')}</strong> at checkout to get 10% OFF.</p>
      <div style="text-align: center;">
        <a href="${escapeHtml(p.cartLink || `${url}/cart`)}" class="button">Apply 10% Discount & Checkout</a>
      </div>
    `
  ),

  payment_failed: buildEmailFlowDefinition(
    'payment_failed',
    'Order Lifecycle',
    19,
    'Payment Failed',
    'Payment Failed – Complete Your Order #{{Order_ID}}',
    'Online payment fails',
    'Provides direct link to retry payment.',
    ['Customer_Name', 'Order_ID', 'Payment_Link'],
    (p, url) => `
      <div class="badge">Payment Pending</div>
      <h2>Payment Could Not Be Completed</h2>
      <p>Hi ${escapeHtml(p.customerName || 'Customer')}, your payment for Order #${escapeHtml(p.orderId || '')} failed. No charges were made.</p>
      <div style="text-align: center;">
        <a href="${escapeHtml(p.paymentLink || `${url}/checkout`)}" class="button">Retry Payment Now</a>
      </div>
    `
  ),

  order_cancelled: buildEmailFlowDefinition(
    'order_cancelled',
    'Order Lifecycle',
    20,
    'Order Cancelled',
    'Your Order #{{Order_ID}} Has Been Cancelled',
    'Order cancelled by user or admin',
    'Confirms cancellation and offers support or reordering.',
    ['Customer_Name', 'Order_ID'],
    (p, url) => `
      <div class="badge">Order Cancelled</div>
      <h2>Order #${escapeHtml(p.orderId || '')} Cancelled</h2>
      <p>Hi ${escapeHtml(p.customerName || 'Customer')}, your order has been cancelled successfully.</p>
      <div style="text-align: center;">
        <a href="${url}/products" class="button">Explore Products</a>
      </div>
    `
  ),

  refund_initiated: buildEmailFlowDefinition(
    'refund_initiated',
    'Order Lifecycle',
    21,
    'Refund Initiated',
    'Your Refund Has Been Initiated for Order #{{Order_ID}}',
    'Admin clicks Refund Order',
    'Notifies customer that refund transaction is initiated.',
    ['Customer_Name', 'Order_ID', 'Refund_Amount'],
    (p) => `
      <div class="badge">Refund Initiated</div>
      <h2>Refund Initiated (₹${escapeHtml(String(p.refundAmount || '0'))})</h2>
      <p>Hi ${escapeHtml(p.customerName || 'Customer')}, we have initiated a refund of ₹${escapeHtml(String(p.refundAmount || '0'))} to your original payment method.</p>
    `
  ),

  refund_completed: buildEmailFlowDefinition(
    'refund_completed',
    'Order Lifecycle',
    22,
    'Refund Completed',
    'Refund Successfully Processed - Annavedah Foods',
    'Payment gateway confirms refund processing',
    'Confirms refund credit to bank account.',
    ['Customer_Name', 'Order_ID', 'Refund_Amount'],
    (p) => `
      <div class="badge">Refund Credited</div>
      <h2>Refund Complete</h2>
      <p>Hi ${escapeHtml(p.customerName || 'Customer')}, your refund of ₹${escapeHtml(String(p.refundAmount || '0'))} has been processed and credited by the bank.</p>
    `
  ),

  return_requested: buildEmailFlowDefinition(
    'return_requested',
    'Order Lifecycle',
    23,
    'Return Request Received',
    'We\'ve Received Your Return Request for Order #{{Order_ID}}',
    'Customer submits return form',
    'Acknowledges return request submission.',
    ['Customer_Name', 'Order_ID'],
    (p) => `
      <div class="badge">Return Pending</div>
      <h2>Return Request Under Review</h2>
      <p>Hi ${escapeHtml(p.customerName || 'Customer')}, we have received your return request for Order #${escapeHtml(p.orderId || '')}. Our support team will update you within 24 hours.</p>
    `
  ),

  return_approved: buildEmailFlowDefinition(
    'return_approved',
    'Order Lifecycle',
    24,
    'Return Approved',
    'Your Return Request Has Been Approved - Annavedah Foods',
    'Admin approves return request',
    'Notifies customer of return pickup arrangements.',
    ['Customer_Name', 'Order_ID'],
    (p) => `
      <div class="badge">Return Approved</div>
      <h2>Return Approved</h2>
      <p>Hi ${escapeHtml(p.customerName || 'Customer')}, your return request for Order #${escapeHtml(p.orderId || '')} has been approved. Our courier partner will pick up the package shortly.</p>
    `
  ),

  replacement_shipped: buildEmailFlowDefinition(
    'replacement_shipped',
    'Order Lifecycle',
    25,
    'Replacement Shipped',
    'Your Replacement Order is Shipped 🚚',
    'Replacement order dispatched',
    'Provides tracking link for replacement package.',
    ['Customer_Name', 'Tracking_Link'],
    (p, url) => `
      <div class="badge">Replacement Dispatched</div>
      <h2>Replacement Item Dispatched!</h2>
      <p>Hi ${escapeHtml(p.customerName || 'Customer')}, your replacement package is on its way.</p>
      <div style="text-align: center;">
        <a href="${escapeHtml(p.trackingLink || `${url}/order-tracking`)}" class="button">Track Replacement</a>
      </div>
    `
  ),

  replacement_delivered: buildEmailFlowDefinition(
    'replacement_delivered',
    'Order Lifecycle',
    26,
    'Replacement Delivered',
    'Your Replacement Has Been Delivered Successfully 🎉',
    'Replacement package delivered',
    'Confirms replacement delivery.',
    ['Customer_Name'],
    (p) => `
      <div class="badge">Replacement Delivered</div>
      <h2>Replacement Delivered!</h2>
      <p>Hi ${escapeHtml(p.customerName || 'Customer')}, your replacement item has been delivered safely. Thank you for your patience!</p>
    `
  ),

  birthday_wishes: buildEmailFlowDefinition(
    'birthday_wishes',
    'Post-Purchase & Loyalty',
    27,
    'Birthday Email 🎂',
    'Happy Birthday from Annavedah Foods! 🎂🎁',
    'Customer birthday date trigger',
    'Sends birthday greetings with special discount coupon.',
    ['Customer_Name', 'Discount_Code'],
    (p, url) => `
      <div class="badge">Happy Birthday!</div>
      <h2>Wishing You a Wonderful Birthday! 🎂</h2>
      <p>Hi ${escapeHtml(p.customerName || 'Friend')}, team Annavedah Foods wishes you health, happiness, and prosperity!</p>
      <p>Here is a special birthday gift of 15% OFF your next order: <strong>${escapeHtml(p.discountCode || 'BDAY15')}</strong></p>
      <div style="text-align: center;">
        <a href="${url}/products" class="button">Treat Yourself Today</a>
      </div>
    `
  ),

  anniversary_wishes: buildEmailFlowDefinition(
    'anniversary_wishes',
    'Post-Purchase & Loyalty',
    28,
    'Anniversary Email',
    'Celebrating Your 1-Year Journey with Annavedah Foods! 🎉',
    'Customer 1-year joining anniversary',
    'Celebrates customer loyalty with celebratory discount.',
    ['Customer_Name'],
    (p, url) => `
      <div class="badge">Happy Anniversary</div>
      <h2>Thank You for Being Part of Our Journey!</h2>
      <p>Hi ${escapeHtml(p.customerName || 'Friend')}, today marks your 1-year anniversary with Annavedah Foods. We are honored to serve you organic nutrition.</p>
      <div style="text-align: center;">
        <a href="${url}/products" class="button">Explore New Arrivals</a>
      </div>
    `
  ),

  festival_greetings: buildEmailFlowDefinition(
    'festival_greetings',
    'Post-Purchase & Loyalty',
    29,
    'Festival Greetings',
    'Warm Festive Wishes & Exclusive Special Offer 🪔 - Annavedah Foods',
    'Festive holiday campaign (Diwali, Holi, Rakhi, etc.)',
    'Sends warm holiday greetings with festive discounts.',
    ['Customer_Name'],
    (p, url) => `
      <div class="badge">Festive Celebrations</div>
      <h2>Warm Festive Greetings from Annavedah Foods! 🪔</h2>
      <p>Hi ${escapeHtml(p.customerName || 'Friend')}, wishing you and your family joy, health, and sweetness this festive season!</p>
      <div style="text-align: center;">
        <a href="${url}/gifting" class="button">Shop Luxury Festive Hampers</a>
      </div>
    `
  ),

  new_product_launch: buildEmailFlowDefinition(
    'new_product_launch',
    'Post-Purchase & Loyalty',
    30,
    'New Product Launch',
    'Introducing Our Latest Organic Creation! 🌟',
    'New product added to catalog',
    'Announces new product availability to subscribers.',
    ['Customer_Name', 'Product_Name'],
    (p, url) => `
      <div class="badge">New Arrival</div>
      <h2>Introducing ${escapeHtml(p.productName || 'Our New Organic Product')}</h2>
      <p>Hi ${escapeHtml(p.customerName || 'Friend')}, we are thrilled to unveil our newest organic addition!</p>
      <div style="text-align: center;">
        <a href="${url}/products" class="button">Discover New Product</a>
      </div>
    `
  ),

  back_in_stock: buildEmailFlowDefinition(
    'back_in_stock',
    'Post-Purchase & Loyalty',
    31,
    'Back in Stock Alert',
    'Good News! Your Favorite Item is Back in Stock 📦',
    'Product inventory restocked',
    'Alerts waitlisted customers of stock availability.',
    ['Customer_Name', 'Product_Name'],
    (p, url) => `
      <div class="badge">Restocked</div>
      <h2>${escapeHtml(p.productName || 'Popular Product')} is Back in Stock!</h2>
      <p>Hi ${escapeHtml(p.customerName || 'Friend')}, the item you were waiting for is back in stock. Order before it sells out again!</p>
      <div style="text-align: center;">
        <a href="${url}/products" class="button">Order Now</a>
      </div>
    `
  ),

  price_drop_alert: buildEmailFlowDefinition(
    'price_drop_alert',
    'Post-Purchase & Loyalty',
    32,
    'Price Drop Alert',
    'Price Drop Alert on Products You Love! 📉',
    'Product price reduction',
    'Notifies customers of price reduction on catalog items.',
    ['Customer_Name', 'Product_Name'],
    (p, url) => `
      <div class="badge">Price Reduced</div>
      <h2>Price Drop on ${escapeHtml(p.productName || 'Organic Favorites')}!</h2>
      <p>Hi ${escapeHtml(p.customerName || 'Friend')}, we've just lowered prices on selected organic staples. Enjoy extra savings!</p>
      <div style="text-align: center;">
        <a href="${url}/products" class="button">Shop Discounted Items</a>
      </div>
    `
  ),

  flash_sale: buildEmailFlowDefinition(
    'flash_sale',
    'Post-Purchase & Loyalty',
    33,
    'Flash Sale Alert',
    '⚡ FLASH SALE: 24 Hours Only at Annavedah Foods!',
    'Flash sale event start',
    'Urgent announcement for time-limited flash sale discount.',
    ['Customer_Name'],
    (p, url) => `
      <div class="badge">24-Hour Flash Sale</div>
      <h2>Flash Sale Live Now! ⚡</h2>
      <p>Hi ${escapeHtml(p.customerName || 'Friend')}, enjoy mega savings for the next 24 hours across our entire organic catalog!</p>
      <div style="text-align: center;">
        <a href="${url}/products" class="button">Shop Flash Sale Now</a>
      </div>
    `
  ),

  limited_time_offer: buildEmailFlowDefinition(
    'limited_time_offer',
    'Post-Purchase & Loyalty',
    34,
    'Limited Time Offer',
    'Limited Time Offer: Free Organic Gift on Orders Above ₹999 🎁',
    'Promotional threshold campaign',
    'Promotes limited-time free gift with purchase.',
    ['Customer_Name'],
    (p, url) => `
      <div class="badge">Free Gift Offer</div>
      <h2>Get a Free Organic Gift Box!</h2>
      <p>Hi ${escapeHtml(p.customerName || 'Friend')}, place any order over ₹999 this week and get a free organic gift automatically included!</p>
      <div style="text-align: center;">
        <a href="${url}/products" class="button">Claim Free Gift</a>
      </div>
    `
  ),

  bulk_order_enquiry: buildEmailFlowDefinition(
    'bulk_order_enquiry',
    'Support & B2B',
    35,
    'Bulk Order Enquiry Acknowledgment',
    'We\'ve Received Your Bulk Order Enquiry - Annavedah Foods',
    'B2B customer submits corporate / bulk enquiry',
    'Confirms receipt of bulk order enquiry and promises B2B manager callback.',
    ['Customer_Name'],
    (p) => `
      <div class="badge">B2B Corporate Desk</div>
      <h2>Bulk Order Enquiry Received</h2>
      <p>Dear ${escapeHtml(p.customerName || 'Corporate Partner')}, thank you for reaching out for bulk & corporate gifting. Our team will contact you within 4 hours with custom wholesale pricing.</p>
    `
  ),

  export_enquiry_ack: buildEmailFlowDefinition(
    'export_enquiry_ack',
    'Support & B2B',
    36,
    'Export Enquiry Acknowledgment',
    'Annavedah Foods International Export Enquiry',
    'Overseas buyer submits export inquiry',
    'Confirms receipt of international trade & export enquiry.',
    ['Customer_Name'],
    (p) => `
      <div class="badge">Global Export Division</div>
      <h2>Export Enquiry Acknowledgment</h2>
      <p>Dear ${escapeHtml(p.customerName || 'Exporter')}, thank you for your interest in exporting Annavedah organic foods. Our international trade division will review your specifications shortly.</p>
    `
  ),

  contact_form_confirmation: buildEmailFlowDefinition(
    'contact_form_confirmation',
    'Support & B2B',
    37,
    'Contact Form Confirmation',
    'We\'ve Received Your Message - Annavedah Foods',
    'Customer submits contact us form',
    'Confirms message receipt with support ticket details.',
    ['Customer_Name', 'Enquiry_Message'],
    (p) => `
      <div class="badge">Support Inquiry</div>
      <h2>We Received Your Message!</h2>
      <p>Hi ${escapeHtml(p.customerName || 'Friend')}, thanks for writing to us. Here is a copy of your message:</p>
      <div class="summary-box">"${escapeHtml(p.enquiryMessage || 'Support Inquiry')}"</div>
      <p>Our customer care team will reply to you within 24 hours.</p>
    `
  ),

  distributor_application: buildEmailFlowDefinition(
    'distributor_application',
    'Support & B2B',
    38,
    'Dealer/Distributor Application Received',
    'Dealer & Distribution Partnership Application Received',
    'Distributor application form submission',
    'Confirms receipt of trade dealership application.',
    ['Customer_Name'],
    (p) => `
      <div class="badge">Partnership Network</div>
      <h2>Distributor Application Received</h2>
      <p>Dear ${escapeHtml(p.customerName || 'Applicant')}, thank you for applying to become an authorized Annavedah distributor. Our sales head will review your territory application.</p>
    `
  ),

  career_application: buildEmailFlowDefinition(
    'career_application',
    'Support & B2B',
    39,
    'Career Application Received',
    'Thank You for Applying to Annavedah Foods 🌿',
    'Job candidate submits resume',
    'Confirms job application receipt.',
    ['Customer_Name'],
    (p) => `
      <div class="badge">Careers Division</div>
      <h2>Application Received</h2>
      <p>Hi ${escapeHtml(p.customerName || 'Candidate')}, thank you for applying to join team Annavedah Foods. If your profile matches our requirements, HR will get in touch.</p>
    `
  ),

  support_ticket_created: buildEmailFlowDefinition(
    'support_ticket_created',
    'Support & B2B',
    40,
    'Support Ticket Created',
    'Support Ticket Created #{{Ticket_ID}} - Annavedah Foods',
    'Customer support ticket created',
    'Provides ticket tracking number.',
    ['Customer_Name', 'Ticket_ID'],
    (p) => `
      <div class="badge">Helpdesk Ticket</div>
      <h2>Support Ticket #${escapeHtml(p.ticketId || 'TICK-901')} Created</h2>
      <p>Hi ${escapeHtml(p.customerName || 'Customer')}, your support ticket has been created and assigned to a customer service executive.</p>
    `
  ),

  support_ticket_closed: buildEmailFlowDefinition(
    'support_ticket_closed',
    'Support & B2B',
    41,
    'Support Ticket Closed',
    'Support Ticket #${Ticket_ID} Resolved & Closed',
    'Support ticket marked resolved',
    'Confirms issue resolution.',
    ['Customer_Name', 'Ticket_ID'],
    (p) => `
      <div class="badge">Ticket Resolved</div>
      <h2>Support Ticket #${escapeHtml(p.ticketId || '')} Closed</h2>
      <p>Hi ${escapeHtml(p.customerName || 'Customer')}, your support ticket has been marked resolved. If you need further help, reply to this email.</p>
    `
  ),

  password_reset: buildEmailFlowDefinition(
    'password_reset',
    'Onboarding & Auth',
    42,
    'Password Reset Request',
    'Reset Your Annavedah Account Password',
    'Customer clicks Forgot Password',
    'Sends secure password reset link.',
    ['Customer_Name', 'Verification_Link'],
    (p, url) => `
      <div class="badge">Password Reset</div>
      <h2>Reset Your Account Password</h2>
      <p>Hi ${escapeHtml(p.customerName || 'User')}, we received a request to reset your Annavedah account password.</p>
      <div style="text-align: center;">
        <a href="${escapeHtml(p.verificationLink || `${url}/auth/reset-password`)}" class="button">Reset Password Now</a>
      </div>
    `
  ),

  change_email_request: buildEmailFlowDefinition(
    'change_email_request',
    'Onboarding & Auth',
    43,
    'Change Email Address',
    'Confirm Email Address Change Request',
    'Customer updates profile email',
    'Sends confirmation link to verify new email address.',
    ['Customer_Name', 'Verification_Link'],
    (p) => `
      <div class="badge">Security Update</div>
      <h2>Confirm Email Change</h2>
      <p>Hi ${escapeHtml(p.customerName || 'User')}, please click below to confirm your new email address.</p>
      <div style="text-align: center;">
        <a href="${escapeHtml(p.verificationLink || '#')}" class="button">Confirm New Email</a>
      </div>
    `
  ),

  change_password_success: buildEmailFlowDefinition(
    'change_password_success',
    'Onboarding & Auth',
    44,
    'Change Password Successful',
    'Your Password Was Changed Successfully - Annavedah Foods',
    'Password successfully updated',
    'Security alert confirming password change.',
    ['Customer_Name'],
    (p) => `
      <div class="badge">Security Alert</div>
      <h2>Password Updated Successfully</h2>
      <p>Hi ${escapeHtml(p.customerName || 'User')}, your password was changed. If you did not make this change, please contact security immediately at support@annavedah.com.</p>
    `
  ),

  account_deleted: buildEmailFlowDefinition(
    'account_deleted',
    'Onboarding & Auth',
    45,
    'Account Deletion Confirmation',
    'Your Annavedah Account Has Been Deleted',
    'Customer deletes account',
    'Confirms permanent account deletion.',
    ['Customer_Name'],
    (p) => `
      <div class="badge">Account Closed</div>
      <h2>Account Deleted</h2>
      <p>Hi ${escapeHtml(p.customerName || 'User')}, your account and associated personal data have been removed per your request. We hope to welcome you back in the future!</p>
    `
  ),

  admin_low_stock_alert: buildEmailFlowDefinition(
    'admin_low_stock_alert',
    'Internal Admin',
    46,
    'Low Stock Alert (Admin Email)',
    '⚠️ ALERT: Low Product Stock Detected - Annavedah Foods Admin',
    'Inventory drops below reorder threshold',
    'Alerts inventory manager of low stock batches.',
    ['Product_Name'],
    (p, url) => `
      <div class="badge" style="background: #ffebee; color: #c62828; border-color: #ef5350;">Inventory Warning</div>
      <h2>Low Stock Alert! ⚠️</h2>
      <p>Batch inventory for <strong>${escapeHtml(p.productName || 'Organic Item')}</strong> has fallen below minimum reorder levels.</p>
      <div style="text-align: center;">
        <a href="${url}/n7xk2mq9pf/products" class="button">Update Inventory Batches</a>
      </div>
    `
  ),

  admin_new_order_notification: buildEmailFlowDefinition(
    'admin_new_order_notification',
    'Internal Admin',
    47,
    'New Order Notification (Admin)',
    '🛒 New Order Received #${Order_ID} - ₹{{Order_Total}}',
    'New customer order placed',
    'Sends full order details, items summary, and shipping address to admin team.',
    ['Order_ID', 'Customer_Name', 'Product_List', 'Order_Total'],
    (p, url) => `
      <div class="badge">New Sales Order</div>
      <h2>New Order #${escapeHtml(p.orderId || 'AV-1001')}</h2>
      <p>Customer: <strong>${escapeHtml(p.customerName || 'Customer')}</strong></p>
      <div class="summary-box">
        <strong>Ordered Items:</strong><br>
        ${escapeHtml(p.productList || 'Items').replace(/\n/g, '<br>')}<br><br>
        <strong>Order Value: ₹${escapeHtml(String(p.orderTotal || '0'))}</strong>
      </div>
      <div style="text-align: center;">
        <a href="${url}/n7xk2mq9pf/orders" class="button">View Order in Admin Panel</a>
      </div>
    `
  ),

  admin_cod_confirmed_notice: buildEmailFlowDefinition(
    'admin_cod_confirmed_notice',
    'Internal Admin',
    48,
    'COD Confirmation Received (Admin)',
    '✅ Customer Confirmed COD Order #${Order_ID}',
    'Customer clicks Confirm COD Order button',
    'Alerts fulfillment team to initiate packing for confirmed COD order.',
    ['Order_ID', 'Customer_Name'],
    (p, url) => `
      <div class="badge" style="background: #e8f5e9; color: #2e7d32; border-color: #81c784;">COD Confirmed</div>
      <h2>COD Order #${escapeHtml(p.orderId || '')} Verified!</h2>
      <p>Customer <strong>${escapeHtml(p.customerName || '')}</strong> has explicitly confirmed their COD order. Proceed with dispatch.</p>
      <div style="text-align: center;">
        <a href="${url}/n7xk2mq9pf/orders" class="button">Print Shipping Label</a>
      </div>
    `
  ),

  admin_daily_sales_report: buildEmailFlowDefinition(
    'admin_daily_sales_report',
    'Internal Admin',
    49,
    'Daily Sales Report (Admin)',
    '📊 Daily Business Summary Report - Annavedah Foods',
    'Daily cron trigger at midnight',
    'Automated daily summary of total revenue, order count, top sellers, and pending fulfillments.',
    ['Admin_Report_Details'],
    (p) => `
      <div class="badge">Daily Executive Analytics</div>
      <h2>Daily Sales & Performance Report</h2>
      <div class="summary-box">
        ${escapeHtml(p.adminReportDetails || 'Daily Revenue: ₹24,800 | Orders: 18 | Top Seller: Moringa Powder').replace(/\n/g, '<br>')}
      </div>
    `
  ),

  admin_business_report: buildEmailFlowDefinition(
    'admin_business_report',
    'Internal Admin',
    50,
    'Weekly & Monthly Business Reports (Admin)',
    '📈 Executive Monthly Performance & Growth Report',
    'Weekly/Monthly cron trigger',
    'Comprehensive business intelligence report detailing customer growth, repeat order rate, conversion rate, and revenue trends.',
    ['Admin_Report_Details'],
    (p) => `
      <div class="badge">Monthly Performance Audit</div>
      <h2>Executive Business Intelligence Report</h2>
      <div class="summary-box">
        ${escapeHtml(p.adminReportDetails || 'Monthly Revenue: ₹6,48,000 | New Customers: 412 | Repeat Order Rate: 34.2%').replace(/\n/g, '<br>')}
      </div>
    `
  ),
};
