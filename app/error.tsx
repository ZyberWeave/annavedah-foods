'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen site-page-gap pb-16 flex items-center justify-center bg-[#faf6f0] px-4">
      <div className="max-w-lg w-full text-center">
        <h1 className="text-6xl font-bold text-[#c9a45c] mb-4">Oops!</h1>
        <h2 className="text-2xl font-bold text-[#2d1b15] mb-4">Something went wrong</h2>
        <p className="text-[#6b5347] mb-8">
          We encountered an unexpected error. Please try again.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-8 py-3 bg-[#8b1a1a] hover:bg-[#6d1414] text-white font-bold rounded-xl transition-all"
          >
            Try Again
          </button>
          <a
            href="/"
            className="px-8 py-3 border-2 border-[#c9a45c] text-[#8b1a1a] hover:bg-[#c9a45c]/10 font-bold rounded-xl transition-all"
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  )
}
