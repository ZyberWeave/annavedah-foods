import { Resend } from 'resend';

// Provide a dummy key fallback during build/evaluation so Next.js static collection does not throw
const apiKey = process.env.RESEND_API_KEY || 're_placeholder_build_key';
export const resend = new Resend(apiKey);

export function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }
  return resend;
}
