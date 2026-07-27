'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'

const POPUP_STORAGE_KEY = 'annavedah_first_time_popup_dismissed'

export default function FirstTimeCustomerPopup() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const dismissed = localStorage.getItem(POPUP_STORAGE_KEY)
    if (dismissed === 'true') return

    const timer = setTimeout(() => {
      setIsOpen(true)
    }, 2500)

    return () => clearTimeout(timer)
  }, [])

  const handleDismiss = () => {
    setIsOpen(false)
    if (typeof window !== 'undefined') {
      localStorage.setItem(POPUP_STORAGE_KEY, 'true')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-[#e8ddd0] animate-in zoom-in-95 duration-300">
        
        {/* Banner Header */}
        <div className="bg-[#2d1b15] p-6 text-center text-white relative">
          {/* Close Button - Cross Icon instead of text CLOSE */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 z-10 w-9 h-9 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors border border-white/20"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <span className="bg-[#8b1a1a] text-white text-[10px] font-extrabold uppercase tracking-widest px-3.5 py-1 rounded-full inline-block mb-3 shadow-sm border border-[#c9a45c]/30">
            FIRST-TIME CUSTOMER OFFER
          </span>

          <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white mb-2">
            GET 5% OFF YOUR FIRST ORDER
          </h3>

          <p className="text-white/80 text-xs leading-relaxed max-w-xs mx-auto">
            Register now to receive a 1-time personalized coupon code sent to your account via email.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <div className="bg-[#faf6f0] border border-[#e8ddd0] rounded-2xl p-4 text-center space-y-1.5">
            <p className="text-xs font-bold text-[#2d1b15] uppercase tracking-wider">
              100% REGISTRATION REQUIRED
            </p>
            <p className="text-xs text-[#6b5347] leading-relaxed">
              To prevent unauthorized coupon misuse, your 5% OFF coupon code is generated only after full account creation with email and verified mobile number.
            </p>
          </div>

          <div className="space-y-2.5 pt-1">
            <Link
              href="/register"
              onClick={handleDismiss}
              className="w-full bg-[#8b1a1a] hover:bg-[#6d1414] text-white font-bold text-xs uppercase tracking-wider py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center text-center block"
            >
              REGISTER NOW & CLAIM 5% OFF
            </Link>

            <Link
              href="/login"
              onClick={handleDismiss}
              className="w-full bg-transparent hover:bg-[#faf6f0] text-[#2d1b15] font-bold text-xs uppercase tracking-wider py-3 px-4 rounded-xl border border-[#e8ddd0] transition-all flex items-center justify-center text-center block"
            >
              ALREADY HAVE AN ACCOUNT? LOG IN
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
