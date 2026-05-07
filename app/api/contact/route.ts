import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const ADMIN_EMAILS = ['support@annavedah.com'];

export async function POST(req: Request) {
  try {
    const { name, email, phone, reason, company, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email, and message are required' }, { status: 400 });
    }

    const submittedAt = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST';
    const ticketRef = 'CT-' + Date.now().toString(36).toUpperCase();
    const reasonLabel = reason || 'General';

    // Send notification to admin
    await resend.emails.send({
      from: 'Annavedah Foods <noreply@annavedahfoods.com>',
      to: ADMIN_EMAILS,
      replyTo: email,
      subject: `📩 ${reasonLabel} — ${name} (${ticketRef})`,
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 640px; margin: 0 auto; background:#fff; border:1px solid #e8ddd0; border-radius:12px; overflow:hidden;">
          <div style="background:#8b1a1a; padding:20px 24px;">
            <h2 style="color:#fff; margin:0; font-size: 22px;">New Contact Form Submission</h2>
            <p style="color:#ffe4e6; margin:6px 0 0; font-size:13px;">Ref ${ticketRef} &middot; ${submittedAt}</p>
          </div>
          <div style="padding: 28px 32px;">
            <div style="background:#fffbeb; border-left:4px solid #d97706; padding:12px 16px; border-radius:6px; margin-bottom:20px;">
              <p style="margin:0; color:#78350f; font-size:13px; font-weight:600;">Reason: ${reasonLabel}</p>
            </div>
            <h3 style="color:#8b1a1a; border-bottom:1px solid #e8ddd0; padding-bottom:6px; margin-top:0;">Sender</h3>
            <table style="width: 100%; border-collapse: collapse; font-size:14px;">
              <tr><td style="padding:6px 0; color:#6b5347; width:120px;">Name</td><td style="padding:6px 0; color:#2d1b15; font-weight:600;">${name}</td></tr>
              <tr><td style="padding:6px 0; color:#6b5347;">Email</td><td style="padding:6px 0;"><a href="mailto:${email}" style="color:#8b1a1a;">${email}</a></td></tr>
              ${phone ? `<tr><td style="padding:6px 0; color:#6b5347;">Phone</td><td style="padding:6px 0;"><a href="tel:${phone}" style="color:#8b1a1a;">${phone}</a></td></tr>` : ''}
              ${company ? `<tr><td style="padding:6px 0; color:#6b5347;">Company</td><td style="padding:6px 0; color:#2d1b15;">${company}</td></tr>` : ''}
              <tr><td style="padding:6px 0; color:#6b5347;">Reason</td><td style="padding:6px 0; color:#2d1b15;">${reasonLabel}</td></tr>
              <tr><td style="padding:6px 0; color:#6b5347;">Submitted</td><td style="padding:6px 0; color:#2d1b15;">${submittedAt}</td></tr>
            </table>
            <h3 style="color:#8b1a1a; border-bottom:1px solid #e8ddd0; padding-bottom:6px; margin-top:24px;">Message</h3>
            <div style="background:#faf6f0; border:1px solid #e8ddd0; border-radius:8px; padding:16px; color:#2d1b15; line-height:1.6; white-space:pre-line; font-size:14px;">${message}</div>
            <div style="text-align:center; margin-top:28px;">
              <a href="mailto:${email}?subject=Re%3A%20${encodeURIComponent(reasonLabel)}%20%E2%80%94%20${encodeURIComponent(ticketRef)}" style="display:inline-block; background:#2d1b15; color:#fff; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:bold;">Reply to ${name.split(' ')[0]}</a>
            </div>
          </div>
          <div style="background:#faf6f0; padding:14px; text-align:center; border-top:1px solid #e8ddd0;">
            <p style="color:#a39189; font-size:12px; margin:0;">Sent via the contact form on annavedahfoods.com</p>
          </div>
        </div>
      `,
    });

    // Send confirmation to customer
    await resend.emails.send({
      from: 'Annavedah Foods <noreply@annavedahfoods.com>',
      to: email,
      subject: `We received your message — Ref ${ticketRef}`,
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background:#fff; border:1px solid #e8ddd0; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.04);">
          <div style="background:#faf6f0; padding:36px 20px; text-align:center; border-bottom:2px solid #c9a45c;">
            <img src="https://annavedahfoods.com/Logo.webp" alt="Annavedah Foods" style="height:54px; margin-bottom:14px;" />
            <h1 style="color:#8b1a1a; margin:0; font-size:26px;">Thanks for writing in!</h1>
            <p style="color:#6b5347; font-size:13px; margin:8px 0 0;">Reference ${ticketRef} &middot; ${submittedAt}</p>
          </div>
          <div style="padding:36px 32px;">
            <p style="color:#2d1b15; font-size:16px; margin:0 0 12px;">Hi ${name},</p>
            <p style="color:#6b5347; font-size:15px; line-height:1.6;">Your message has reached our team and we'll personally get back to you. Here's what you sent us, just so you have a copy:</p>

            <div style="background:#faf6f0; border:1px solid #e8ddd0; border-radius:10px; padding:16px; margin:20px 0;">
              <p style="margin:0 0 6px; font-size:12px; color:#a39189; text-transform:uppercase; letter-spacing:0.5px;">Topic — ${reasonLabel}</p>
              <p style="margin:0; color:#2d1b15; line-height:1.6; white-space:pre-line; font-size:14px;">${message}</p>
            </div>

            <h3 style="color:#2d1b15; font-size:16px; margin:24px 0 10px; border-bottom:1px solid #e8ddd0; padding-bottom:6px;">What happens next</h3>
            <ul style="color:#6b5347; font-size:14px; line-height:1.8; padding-left:20px; margin:0;">
              <li>Our customer-care team reviews every message personally — usually within <strong>1 business day</strong> (Mon–Sat, 10am–7pm IST).</li>
              <li>For order-related queries, please keep your order ID handy when we reply.</li>
              <li>If you don't see our reply, check your Promotions / Spam folder and mark us as Not Spam.</li>
            </ul>

            <h3 style="color:#2d1b15; font-size:16px; margin:24px 0 10px; border-bottom:1px solid #e8ddd0; padding-bottom:6px;">Other ways to reach us</h3>
            <p style="color:#6b5347; font-size:14px; line-height:1.7; margin:0;">
              ✉️ <a href="mailto:support@annavedahfoods.com" style="color:#8b1a1a;">support@annavedahfoods.com</a><br/>
              🌐 <a href="https://annavedahfoods.com" style="color:#8b1a1a;">annavedahfoods.com</a><br/>
              🛍️ <a href="https://annavedahfoods.com/products" style="color:#8b1a1a;">Browse our products</a>
            </p>

            <p style="color:#6b5347; font-size:14px; margin-top:24px;">Warm regards,<br/><strong style="color:#2d1b15;">Team Annavedah</strong></p>
          </div>
          <div style="background:#2d1b15; padding:18px; text-align:center;">
            <p style="color:#a39189; font-size:11px; margin:0;">© ${new Date().getFullYear()} Annavedah Foods. All rights reserved. This is an automated confirmation — please reply to reach a human.</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
