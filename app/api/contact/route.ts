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

    // Send notification to admin
    await resend.emails.send({
      from: 'Annavedah Foods <noreply@annavedahfoods.com>',
      to: ADMIN_EMAILS,
      subject: `New Contact: ${reason || 'General'} — ${name}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px 20px;">
          <h2 style="color: #8b1a1a; margin-bottom: 24px;">New Contact Form Submission</h2>
          <div style="background: #faf6f0; border: 1px solid #e8ddd0; border-radius: 12px; padding: 24px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 12px; font-weight: bold; color: #2d1b15; width: 120px; vertical-align: top;">Name</td>
                <td style="padding: 8px 12px; color: #6b5347;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 12px; font-weight: bold; color: #2d1b15; vertical-align: top;">Email</td>
                <td style="padding: 8px 12px; color: #6b5347;"><a href="mailto:${email}" style="color: #8b1a1a;">${email}</a></td>
              </tr>
              ${phone ? `<tr>
                <td style="padding: 8px 12px; font-weight: bold; color: #2d1b15; vertical-align: top;">Phone</td>
                <td style="padding: 8px 12px; color: #6b5347;">${phone}</td>
              </tr>` : ''}
              <tr>
                <td style="padding: 8px 12px; font-weight: bold; color: #2d1b15; vertical-align: top;">Reason</td>
                <td style="padding: 8px 12px; color: #6b5347;">${reason || 'General'}</td>
              </tr>
              ${company ? `<tr>
                <td style="padding: 8px 12px; font-weight: bold; color: #2d1b15; vertical-align: top;">Company</td>
                <td style="padding: 8px 12px; color: #6b5347;">${company}</td>
              </tr>` : ''}
              <tr>
                <td style="padding: 8px 12px; font-weight: bold; color: #2d1b15; vertical-align: top;">Message</td>
                <td style="padding: 8px 12px; color: #6b5347; white-space: pre-line;">${message}</td>
              </tr>
            </table>
          </div>
          <p style="color: #999; font-size: 12px; margin-top: 20px;">Sent from annavedahfoods.com contact form</p>
        </div>
      `,
    });

    // Send confirmation to customer
    await resend.emails.send({
      from: 'Annavedah Foods <noreply@annavedahfoods.com>',
      to: email,
      subject: 'We received your message — Annavedah Foods',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #8b1a1a; font-size: 24px; margin: 0;">Annavedah Foods</h1>
          </div>
          <div style="background: #faf6f0; border: 1px solid #e8ddd0; border-radius: 16px; padding: 30px;">
            <p style="color: #2d1b15; font-size: 16px; margin: 0 0 12px;">Hi ${name},</p>
            <p style="color: #6b5347; font-size: 14px; line-height: 1.6;">
              Thank you for reaching out! We've received your message and our team will get back to you within one business day.
            </p>
            <p style="color: #6b5347; font-size: 14px; line-height: 1.6; margin-top: 16px;">
              In the meantime, feel free to explore our products at <a href="https://annavedahfoods.com/products" style="color: #8b1a1a;">annavedahfoods.com</a>.
            </p>
            <p style="color: #6b5347; font-size: 14px; margin-top: 20px;">
              Warm regards,<br/>
              <strong style="color: #2d1b15;">Team Annavedah</strong>
            </p>
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
