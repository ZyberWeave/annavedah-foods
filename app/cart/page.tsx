'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useCart } from '@/components/cart-context'

export default function CartPage() {
  const { items, remove, total } = useCart()
  const router = useRouter()

  return (
    <div className="container mx-auto px-4 pt-32 lg:pt-40 pb-16 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-accent">Cart</p>
          <h1 className="text-3xl font-bold text-primary md:text-4xl">Your selected products</h1>
        </div>
        <Link href="/products" className="text-sm font-semibold text-primary hover:text-accent transition-colors">
          Continue shopping
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="rounded-3xl border border-border bg-card p-8 text-center space-y-3">
          <p className="text-lg font-semibold text-foreground">Your cart is empty</p>
          <p className="text-muted-foreground">Browse our collection and add items to proceed.</p>
          <Button asChild className="h-11 px-6 font-semibold">
            <Link href="/products">Explore products</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-4">
            {items.map(({ product, qty }) => (
              <div key={product.slug} className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 md:flex-row md:items-center">
                <div className="relative h-28 w-28 rounded-xl bg-[url('/product-bg.png')] bg-cover bg-center border border-border/60 overflow-hidden">
                  <Image src={product.image} alt={product.name} fill className="object-contain p-3 drop-shadow-md" />
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="text-lg font-semibold text-foreground">{product.name}</h3>
                  <p className="text-sm text-muted-foreground">{product.category}</p>
                  <p className="text-sm text-muted-foreground">Qty: {qty}</p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-lg font-bold text-primary">Rs {product.price * qty}</p>
                  <Button variant="outline" size="sm" onClick={() => remove(product.id)}>
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-sm">
            <h3 className="text-xl font-semibold text-foreground">Summary</h3>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Subtotal</span>
              <span>Rs {total}</span>
            </div>
            <p className="text-xs text-muted-foreground">Shipping and taxes calculated at checkout.</p>
            <Button className="w-full h-12 font-semibold" onClick={() => router.push('/checkout')}>
              Proceed to Checkout →
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
