/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        { key: 'Content-Security-Policy', value: "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; img-src 'self' data: blob: https:; font-src 'self' data: https:; style-src 'self' 'unsafe-inline' https:; script-src 'self' 'unsafe-inline' https://checkout.razorpay.com https://connect.facebook.net; connect-src 'self' https:; frame-src https://api.razorpay.com https://checkout.razorpay.com" },
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
