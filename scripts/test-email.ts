import { Resend } from 'resend';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendTestEmail() {
  const emails = ['zyberweave@gmail.com', 'annavedahfoods@gmail.com'];
  
  for (const email of emails) {
    try {
      const { data, error } = await resend.emails.send({
        from: 'Annavedah Foods <support@annavedahfoods.com>',
        to: email,
        subject: 'TEST: Welcome to Annavedah Foods!',
        html: `
          <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e8ddd0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.04);">
            <div style="background-color: #faf6f0; padding: 40px 20px; text-align: center; border-bottom: 2px solid #c9a45c;">
              <img src="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/Logo.webp" alt="Annavedah Foods Logo" style="height: 60px; width: auto; margin-bottom: 20px;" />
              <h1 style="color: #8b1a1a; margin: 0; font-size: 32px; letter-spacing: -0.5px;">Welcome to the Family!</h1>
            </div>
            <div style="padding: 40px 32px;">
              <h2 style="color: #2d1b15; font-size: 22px; margin-top: 0;">Hi Test User,</h2>
              <p style="color: #6b5347; font-size: 16px; line-height: 1.6;">We are absolutely thrilled to have you join Annavedah Foods. Our mission is to bring you clean, nutrient-dense traditional foods crafted for daily wellness.</p>
              <p style="color: #6b5347; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">Whether you're looking for heritage staples or pure organic blends, we promise uncompromising quality in every pack.</p>
              <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/products" style="display: inline-block; background-color: #8b1a1a; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 16px; letter-spacing: 0.5px;">Explore Our Collections</a>
              </div>
            </div>
            <div style="background-color: #2d1b15; padding: 24px; text-align: center;">
              <p style="color: #e8ddd0; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Annavedah Foods. All rights reserved.</p>
            </div>
          </div>
        `,
      });

      if (error) {
        console.error(`Failed to send to ${email}:`, error);
      } else {
        console.log(`Successfully sent test email to ${email}`);
      }
    } catch (err) {
      console.error('Error:', err);
    }
  }
}

sendTestEmail();
