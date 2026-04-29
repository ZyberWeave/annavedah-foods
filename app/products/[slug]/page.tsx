'use client'

import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { products } from '@/lib/content'
import { useCart } from '@/components/cart-context'

type ProductPageProps = {
  params: { slug: string }
}

export default function ProductDetailPage({ params }: ProductPageProps) {
  const product = products.find((item) => item.slug === params.slug)
  if (!product) {
    notFound()
  }
  const { add } = useCart()
  const hasPrice = product.price > 0

  return (
    <div className="container mx-auto px-4 py-16 space-y-12">
      <div className="grid gap-10 md:grid-cols-2 md:items-center">
        <div className="relative bg-white border border-border rounded-3xl shadow-xl overflow-hidden">
          <div className="relative aspect-square">
            <Image src={product.image} alt={product.name} fill className="object-contain p-6" />
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-accent">{product.category}</p>
          <h1 className="text-4xl font-bold text-primary md:text-5xl">{product.name}</h1>
          {product.localName !== product.name && <p className="text-sm text-muted-foreground">{product.localName}</p>}
          <p className="text-lg text-foreground/80">{product.description}</p>
          {hasPrice ? (
            <div className="space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-primary">From Rs {product.price}</span>
                {product.originalPrice > product.price && (
                  <span className="text-sm text-muted-foreground">up to Rs {product.originalPrice}</span>
                )}
              </div>
              {product.packPrices.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {product.packPrices.map((pack) => (
                    <span key={`${product.slug}-${pack.size}`} className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                      {pack.size}: Rs {pack.price}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800">
              Price on request
            </span>
          )}
          <div className="flex flex-wrap gap-2">
            {product.benefits.map((benefit) => (
              <span key={benefit} className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                {benefit}
              </span>
            ))}
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">Usage</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{product.usage}</p>
          </div>
          <Button asChild className="h-12 px-6 font-semibold w-fit">
            <Link href="/contact">Talk to us</Link>
          </Button>
          <Button className="h-12 px-6 font-semibold w-fit" onClick={() => add(product.id)} disabled={!hasPrice}>
            {hasPrice ? 'Add to cart' : 'Enquire for price'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-primary mb-3">Why it works</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {product.highlights.map((highlight) => (
              <li key={highlight} className="leading-relaxed">
                {highlight}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-primary mb-3">Good to pair with</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Warm milk or plant-based milk</li>
            <li>Soups, dals, or porridges</li>
            <li>Rotis, parathas, or breakfast batters</li>
          </ul>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-gradient-to-r from-primary/10 via-background to-accent/10 p-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-2xl font-bold text-primary">Need help choosing the right blend?</h3>
          <p className="text-muted-foreground">Tell us your goals and we will suggest the mix that fits your routine.</p>
        </div>
        <Button asChild variant="outline" className="h-11 px-6 border-primary text-primary hover:bg-primary/10">
          <Link href="/contact">Chat with us</Link>
        </Button>
      </div>
    </div>
  )
}
