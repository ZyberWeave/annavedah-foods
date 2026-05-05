'use client'

import { useEffect, useState } from 'react'
import { X, Mail, Sparkles, Check } from 'lucide-react'

const STORAGE_KEY = 'annavedah_newsletter_dismissed'
const DELAY_MS = 12000

export default function NewsletterPopup() {
  const [show, setShow] = useState(false)
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const dismissed = localStorage.getItem(STORAGE_KEY)
    if (dismissed) return

    let triggered = false

    const showPopup = () => {
      if (triggered) return
      triggered = true
      setShow(true)
    }

    const t = setTimeout(showPopup, DELAY_MS)

    const onLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) showPopup()
    }
    document.addEventListener('mouseleave', onLeave)

    return () => {
      clearTimeout(t)
      document.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  const close = () => {
    setShow(false)
    localStorage.setItem(STORAGE_KEY, '1')
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return
    setSubmitted(true)
    localStorage.setItem(STORAGE_KEY, '1')
    setTimeout(() => setShow(false), 2200)
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={close} />
      <div className="relative w-full max-w-lg bg-[#faf6f0] rounded-3xl shadow-2xl overflow-hidden border-2 border-[#c9a45c]/40 animate-in zoom-in-95 duration-300">
        <button
          onClick={close}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white shadow-md transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-[#2d1b15]" />
        </button>

        <div className="bg-gradient-to-br from-[#8b1a1a] via-[#8b1a1a] to-[#6d1414] text-white px-8 pt-10 pb-8 text-center relative overflow-hidden">
          <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-[#c9a45c]/20" />
          <div className="absolute -bottom-8 -left-4 w-20 h-20 rounded-full bg-[#c9a45c]/10" />
          <div className="relative">
            <Sparkles className="w-10 h-10 mx-auto mb-3 text-[#c9a45c]" />
            <p className="text-[#f5e6c8] text-xs uppercase tracking-[0.3em] font-bold mb-1">Welcome offer</p>
            <h3 className="text-3xl font-bold mb-2">Get 10% Off</h3>
            <p className="text-white/90 text-sm">Your first order of authentic, farm-sourced essentials.</p>
          </div>
        </div>

        <div className="px-8 py-6">
          {submitted ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-green-100 mx-auto flex items-center justify-center mb-3">
                <Check className="w-7 h-7 text-green-600" strokeWidth={3} />
              </div>
              <p className="font-bold text-[#2d1b15] text-lg">You're in!</p>
              <p className="text-sm text-[#6b5347] mt-1">Check your inbox for your discount code.</p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b5347]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-[#e8ddd0] bg-white focus:outline-none focus:border-[#c9a45c] focus:ring-4 focus:ring-[#c9a45c]/10 text-[#2d1b15] font-medium"
                />
              </div>
              <button
                type="submit"
                className="w-full h-12 bg-[#8b1a1a] hover:bg-[#6d1414] text-white font-bold uppercase tracking-wider rounded-xl transition-colors"
              >
                Claim my 10% off
              </button>
              <button
                type="button"
                onClick={close}
                className="block w-full text-center text-xs text-[#6b5347] hover:text-[#8b1a1a] py-1"
              >
                No thanks, I'll pay full price
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
