'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'
import { products, type Product } from '@/lib/content'

type CartItem = {
  product: Product
  qty: number
}

type CartContextValue = {
  items: CartItem[]
  add: (id: number) => void
  remove: (id: number) => void
  total: number
  count: number
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  const add = (id: number) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === id)
      if (existing) {
        return prev.map((item) =>
          item.product.id === id ? { ...item, qty: item.qty + 1 } : item,
        )
      }
      const product = products.find((p) => p.id === id)
      if (!product || product.price <= 0) return prev
      return [...prev, { product, qty: 1 }]
    })
  }

  const remove = (id: number) => {
    setItems((prev) => prev.filter((item) => item.product.id !== id))
  }

  const total = items.reduce((sum, item) => sum + item.product.price * item.qty, 0)
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
