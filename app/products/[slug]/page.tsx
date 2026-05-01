'use client'

import { use, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { products } from '@/lib/content'
import { useCart } from '@/components/cart-context'
import { ShoppingCart, Check } from 'lucide-react'

type ProductPageProps = {
  params: Promise<{ slug: string }>
}

export default function ProductDetailPage(props: ProductPageProps) {
  const params = use(props.params)
  const product = products.find((item) => item.slug === params.slug)
  if (!product) {
    notFound()
  }
  const { add } = useCart()
  
  const [selectedPack, setSelectedPack] = useState(product.packPrices[0])
  const currentPrice = selectedPack ? selectedPack.price : product.price
  const hasPrice = currentPrice > 0

  return (
    <div className="container mx-auto px-4 pt-[120px] lg:pt-[190px] pb-16 space-y-12">
      <div className="grid gap-10 md:grid-cols-2 md:items-center">
        <div className="relative bg-[url('/product-bg.webp')] bg-cover bg-center border border-border rounded-3xl shadow-xl overflow-hidden">
          <div className="relative aspect-square">
            <Image src={product.image} alt={product.name} fill priority sizes="(max-width: 768px) 100vw, 50vw" className="object-contain p-8 drop-shadow-2xl" />
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-accent">{product.category}</p>
          <h1 className="text-4xl font-bold text-primary md:text-5xl">{product.name}</h1>
          {product.localName !== product.name && <p className="text-sm text-muted-foreground">{product.localName}</p>}
          <p className="text-lg text-foreground/80">{product.description}</p>
          {hasPrice ? (
            <div className="space-y-4">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-primary">Rs {currentPrice}</span>
              </div>
              {product.packPrices.length > 0 && (
                <div className="flex flex-wrap gap-3 pt-2">
                  {product.packPrices.map((pack) => (
                    <button
                      key={`${product.slug}-${pack.size}`}
                      onClick={() => setSelectedPack(pack)}
                      className={`group relative flex flex-col items-center justify-center min-w-[80px] px-4 py-2.5 border-2 rounded-2xl transition-all duration-300 ${
                        selectedPack?.size === pack.size 
                          ? 'border-[#8b1a1a] bg-[#8b1a1a] text-white shadow-lg scale-105 ring-2 ring-[#8b1a1a] ring-offset-2 ring-offset-[#faf6f0]' 
                          : 'border-[#e8ddd0] bg-white text-[#6b5347] hover:border-[#c9a45c] hover:shadow-md hover:-translate-y-0.5'
                      }`}
                    >
                      <span className={`text-sm font-extrabold tracking-tight ${selectedPack?.size === pack.size ? 'text-white' : 'text-[#2d1b15]'}`}>
                        {pack.size}
                      </span>
                      <span className={`text-xs font-bold mt-0.5 ${selectedPack?.size === pack.size ? 'text-white/90' : 'text-[#8b1a1a]'}`}>
                        ₹{pack.price}
                      </span>
                      
                      {selectedPack?.size === pack.size && (
                        <div className="absolute -top-2 -right-2 w-5 h-5 bg-[#c9a45c] rounded-full border-2 border-white shadow-sm flex items-center justify-center z-10">
                          <Check className="w-3 h-3 text-white" strokeWidth={3} />
                        </div>
                      )}
                    </button>
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
          <div className="flex gap-4 pt-4">
            <Button asChild variant="outline" className="h-14 px-8 border-2 border-[#c9a45c] text-[#8b1a1a] hover:bg-[#c9a45c]/10 font-bold rounded-xl text-lg transition-all">
              <Link href="/contact">Talk to us</Link>
            </Button>
            <Button 
              className="h-14 px-8 bg-[#8b1a1a] hover:bg-[#6d1414] text-white font-bold rounded-xl text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-1" 
              onClick={() => add(product.id, selectedPack)} 
              disabled={!hasPrice}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              {hasPrice ? 'Add to Cart' : 'Enquire for price'}
            </Button>
          </div>
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
