import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen pt-[120px] lg:pt-[190px] pb-16 flex items-center justify-center bg-[#faf6f0] px-4">
      <div className="max-w-lg w-full text-center">
        <h1 className="text-8xl font-bold text-[#c9a45c] mb-4">404</h1>
        <h2 className="text-2xl font-bold text-[#2d1b15] mb-4">Page Not Found</h2>
        <p className="text-[#6b5347] mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block px-8 py-3 bg-[#8b1a1a] hover:bg-[#6d1414] text-white font-bold rounded-xl transition-all"
        >
          Back to Home
        </Link>
      </div>
    </div>
  )
}
