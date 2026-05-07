'use client'

import { useEffect, useState } from 'react'
import { Phone } from 'lucide-react'

const messages = [
  { en: 'FREE shipping on orders over ₹999', tag: 'सात्त्विक | पौष्टिक | परिपूर्ण | प्राकृतिक' },
  { en: 'Use code WELCOME10 for 10% off your first order', tag: 'सात्त्विक | पौष्टिक | परिपूर्ण | प्राकृतिक' },
  { en: 'Authentic farm-sourced • FSSAI certified', tag: 'सात्त्विक | पौष्टिक | परिपूर्ण | प्राकृतिक' },
]

export default function AnnouncementBar() {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % messages.length), 4500)
    return () => clearInterval(t)
  }, [])

  const current = messages[idx]

  return (
    <div className="bg-[#8b1a1a] text-white">
      <div className="container mx-auto px-4 h-9 flex items-center justify-between text-[10px] tracking-widest uppercase font-semibold">
        <span className="hidden sm:block text-[#f5e6c8] font-medium tracking-normal">
          {current.tag}
        </span>
        <span className="sm:hidden text-[#f5e6c8] font-medium tracking-normal text-[9px]">
          {current.tag}
        </span>
        <span
          key={idx}
          className="hidden md:block animate-in fade-in slide-in-from-top-1 duration-500 text-white/90 text-[10px]"
        >
          {current.en}
        </span>
        <a
          href="tel:+919763456100"
          className="flex items-center gap-1.5 text-[#f5e6c8] hover:text-white transition-colors"
        >
          <Phone className="w-3 h-3" />
          +91 97634 56100
        </a>
      </div>
    </div>
  )
}
