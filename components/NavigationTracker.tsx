'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

export default function NavigationTracker() {
  const pathname = usePathname()

  useEffect(() => {
    const plpPath = '/products'
    const storageKey = 'annavedah_product_filters'
    const pdpFlagKey = 'annavedah_from_pdp'

    const isPLP = pathname === plpPath
    const isPDP = pathname.startsWith(`${plpPath}/`)

    if (isPDP) {
      sessionStorage.setItem(pdpFlagKey, 'true')
    } else if (!isPLP) {
      // Navigated to a page outside /products and /products/[slug]
      sessionStorage.removeItem(storageKey)
      sessionStorage.removeItem(pdpFlagKey)
    }
  }, [pathname])

  return null
}
