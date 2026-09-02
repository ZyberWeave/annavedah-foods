/** @type {import('next').NextConfig} */
const scriptSources = [
  "'self'",
  "'unsafe-inline'",
  ...(process.env.NODE_ENV === 'development' ? ["'unsafe-eval'"] : []),
  'https://checkout.razorpay.com',
  'https://connect.facebook.net',
].join(' ')

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https:",
  "style-src 'self' 'unsafe-inline' https:",
  `script-src ${scriptSources}`,
  "connect-src 'self' https:",
  'frame-src https://api.razorpay.com https://checkout.razorpay.com',
].join('; ')

const nextConfig = {
  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        { key: 'Content-Security-Policy', value: contentSecurityPolicy },
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(self)' },
      ],
    }]
  },
  images: {
    // Re-enabled: Next.js will now serve optimized, lazily-loaded images
    formats: ['image/webp'],
  },
  serverExternalPackages: ['bcryptjs'],
  turbopack: {
    root: '.',
  },
}

export default nextConfig
