'use client'

import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react'
import { products, type Product } from '@/lib/content'

type CartItem = {
  product: Product
  qty: number
  selectedPack?: { size: string; price: number }
}

type CartContextValue = {
  items: CartItem[]
  add: (id: number, pack?: { size: string; price: number }) => void
  remove: (id: number, size?: string) => void
  total: number
  count: number
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const isFirstRender = useRef(true)

  // Initialization: load from local storage, then sync from database
  useEffect(() => {
    const localCart = localStorage.getItem('annavedah_cart')
    if (localCart) {
      try { setItems(JSON.parse(localCart)) } catch {}
    }

    fetch('/api/cart')
      .then(res => res.json())
      .then(data => {
        if (data.cart && data.cart.length > 0) {
          setItems(data.cart)
          localStorage.setItem('annavedah_cart', JSON.stringify(data.cart))
        } else if (localCart) {
          fetch('/api/cart', {
            method: 'POST',
            body: JSON.stringify({ items: JSON.parse(localCart) }),
            headers: { 'Content-Type': 'application/json' }
          }).catch(() => {})
        }
      })
      .catch(() => {})
  }, [])

  // Sync state changes to local storage and database
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    localStorage.setItem('annavedah_cart', JSON.stringify(items))

    const timer = setTimeout(() => {
      fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
      }).catch(() => {})
    }, 1000)

    return () => clearTimeout(timer)
  }, [items])

  const add = (id: number, pack?: { size: string; price: number }) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === id && item.selectedPack?.size === pack?.size)
      if (existing) {
        return prev.map((item) =>
          item.product.id === id && item.selectedPack?.size === pack?.size
            ? { ...item, qty: item.qty + 1 }
            : item,
        )
      }
      const product = products.find((p) => p.id === id)
      if (!product || product.price <= 0) return prev
      return [...prev, { product, qty: 1, selectedPack: pack }]
    })
  }

  const remove = (id: number, size?: string) => {
    setItems((prev) => prev.filter((item) => !(item.product.id === id && item.selectedPack?.size === size)))
  }

  const total = items.reduce((sum, item) => sum + (item.selectedPack ? item.selectedPack.price : item.product.price) * item.qty, 0)
  const count = items.reduce((sum, item) => sum + item.qty, 0)

  return (
    <CartContext.Provider value={{ items, add, remove, total, count }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
