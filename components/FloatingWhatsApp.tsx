'use client'

import { useState, useEffect } from 'react'

const WHATSAPP_URL = 'https://wa.me/message/WPQ6RK3USIF2M1'

export default function FloatingWhatsApp() {
  const [isVisible, setIsVisible] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)

  useEffect(() => {
    // Show button after a short delay for a smooth entrance
    const timer = setTimeout(() => setIsVisible(true), 1500)
    // Show tooltip after 4 seconds to draw attention
    const tooltipTimer = setTimeout(() => setShowTooltip(true), 4000)
    // Hide tooltip after 8 seconds
    const hideTooltipTimer = setTimeout(() => setShowTooltip(false), 10000)

    return () => {
      clearTimeout(timer)
      clearTimeout(tooltipTimer)
      clearTimeout(hideTooltipTimer)
    }
  }, [])

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 transition-all duration-700 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
      }`}
    >
      {/* Tooltip */}
      <div
        className={`hidden sm:block bg-white text-[#2d1b15] text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg transition-all duration-500 whitespace-nowrap ${
          showTooltip
            ? 'translate-x-0 opacity-100 scale-100'
            : 'translate-x-4 opacity-0 scale-95 pointer-events-none'
        }`}
        style={{
          boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
        }}
      >
        <span>Chat with us on WhatsApp! 👋</span>
        {/* Arrow */}
        <div
          className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-white rotate-45"
          style={{ boxShadow: '2px -2px 4px rgba(0,0,0,0.05)' }}
        />
      </div>

      {/* WhatsApp Button */}
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        id="floating-whatsapp-btn"
        aria-label="Chat on WhatsApp"
        className="group relative flex items-center justify-center w-[60px] h-[60px] rounded-full shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-[0_8px_30px_rgba(37,211,102,0.5)]"
        style={{
          background: '#25D366',
        }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {/* Pulse ring animation */}
        <span className="absolute inset-0 rounded-full animate-wa-ping" style={{ background: '#25D366' }} />
        <span className="absolute inset-0 rounded-full animate-wa-ping-delayed" style={{ background: '#25D366' }} />

        {/* WhatsApp SVG Icon */}
        <svg
          viewBox="0 0 32 32"
          fill="white"
          className="w-8 h-8 relative z-10 drop-shadow-sm transition-transform duration-300 group-hover:scale-110"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16c0 3.5 1.128 6.744 3.046 9.378L1.054 31.29l6.118-1.958A15.898 15.898 0 0016.004 32C24.826 32 32 24.822 32 16S24.826 0 16.004 0zm9.336 22.616c-.39 1.1-1.932 2.014-3.178 2.282-.854.18-1.968.324-5.72-1.23-4.802-1.988-7.892-6.852-8.132-7.172-.23-.32-1.938-2.58-1.938-4.922 0-2.342 1.228-3.494 1.664-3.972.436-.478.952-.598 1.268-.598.316 0 .632.004.908.016.292.014.682-.11 1.068.814.39.938 1.33 3.248 1.448 3.486.118.238.196.516.038.834-.158.318-.238.516-.476.796-.238.278-.5.622-.714.834-.238.238-.486.496-.21.974.278.478 1.232 2.032 2.646 3.292 1.818 1.62 3.35 2.124 3.828 2.362.478.238.756.198 1.034-.118.278-.318 1.192-1.388 1.51-1.864.316-.478.634-.396 1.07-.238.436.158 2.77 1.306 3.248 1.544.478.238.796.358.914.556.118.198.118 1.148-.272 2.248z" />
        </svg>
      </a>
    </div>
  )
}
