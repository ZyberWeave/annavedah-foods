/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
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
