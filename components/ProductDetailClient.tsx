'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Check, Leaf, MessageCircle, PackageCheck, ShieldCheck, ShoppingBag, Truck } from 'lucide-react'
import { useCart } from '@/components/cart-context'
import type { BundleItem, PackPrice, Product } from '@/lib/content'
import type { ProductDetails } from '@/lib/product-details'
import { useProductsData } from '@/components/products-context'
import { useRecentlyViewed } from '@/components/recently-viewed-context'
import Breadcrumbs from '@/components/Breadcrumbs'
import ProductGallery from '@/components/ProductGallery'
import ProductTabs from '@/components/ProductTabs'
import ProductReviews from '@/components/ProductReviews'
import StickyAddToCart from '@/components/StickyAddToCart'
import WishlistButton from '@/components/WishlistButton'
import RecentlyViewed from '@/components/RecentlyViewed'

const formatPrice = (value: number) => new Intl.NumberFormat('en-IN').format(value)

export default function ProductDetailClient({ product, details }: { product: Product; details: ProductDetails | null }) {
  const [selectedPack, setSelectedPack] = useState(product.packPrices[0] || null)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const { add } = useCart()
  const { products } = useProductsData()
  const { push } = useRecentlyViewed()

  useEffect(() => {
    push(product.id)
  }, [product.id, push])

  const hasPrice = product.price > 0 || product.packPrices.length > 0
  const currentPrice = selectedPack ? selectedPack.price : product.price
  const introduction = details?.overview?.[0] || product.description

  const handleAddToCart = () => {
    if (!hasPrice) return
    add(product.id, selectedPack || undefined, qty)
    setAdded(true)
    window.setTimeout(() => setAdded(false), 2000)
  }

  const related = products
    .filter((item) => item.id !== product.id && item.category === product.category && (item.price > 0 || item.packPrices.length > 0))
    .slice(0, 4)

  return (
    <main className="overflow-hidden pb-24 lg:pb-20">
      <div className="mx-auto w-full max-w-[1440px] px-4 site-page-gap sm:px-6 lg:px-10">
        <div className="py-4 lg:py-6">
          <Breadcrumbs items={[{ label: product.category, href: `/products?category=${encodeURIComponent(product.category)}` }, { label: product.name }]} />
        </div>

        <section className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(420px,.92fr)] lg:gap-12 xl:gap-16">
          <ProductGallery images={[product.image]} alt={product.name} category={product.category} />

          <div className="lg:pt-3">
            <header className="border-b border-[#dfd2c4] pb-7">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#8b1a1a]">{product.category}</span>
                <a href="#reviews" className="inline-flex items-center gap-2 text-xs font-semibold text-[#6b5347] transition-colors hover:text-[#8b1a1a]">
                  <span className="h-px w-5 bg-[#c9a45c]" aria-hidden="true" /> Customer reviews
                </a>
              </div>
              <h1 className="mt-4 max-w-2xl text-4xl font-semibold leading-[0.94] tracking-[-0.025em] text-[#2d1b15] sm:text-5xl xl:text-6xl">{product.name}</h1>
              {(product.nameHindi || product.localName) && (
                <p className="mt-3 text-base text-[#755d50]">{[product.nameHindi, product.localName].filter(Boolean).join(' · ')}</p>
              )}
              <p className="mt-6 max-w-xl text-base leading-7 text-[#59443a]">{introduction}</p>
            </header>

            <div className="py-6">
              <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.22em] text-[#9d722f]">Why it belongs in your pantry</p>
              <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                {product.benefits.slice(0, 4).map((benefit) => (
                  <div key={benefit} className="flex items-start gap-3 text-sm leading-5 text-[#3f3029]">
                    <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-[#ece0c7] text-[#7d5b24]"><Check className="h-3 w-3" strokeWidth={2.5} /></span>
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {product.isGift && product.bundleItems && (
              <div className="mb-6 rounded-2xl border border-[#d9c7ad] bg-[#f5ecdd] p-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#8b1a1a]">Inside this gift box</p>
                <ul className="mt-4 divide-y divide-[#dfd2c4]">
                  {product.bundleItems.map((item: BundleItem) => {
                    const bundledProduct = products.find((candidate) => candidate.slug === item.productSlug)
                    return (
                      <li key={item.productSlug} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                        <span className="text-sm font-semibold text-[#2d1b15]">{bundledProduct ? bundledProduct.name : item.productSlug}</span>
                        <span className="text-xs font-bold text-[#8b1a1a]">Quantity {item.quantity}</span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}

            <section className="relative overflow-hidden rounded-[2rem] border border-[#dacbbb] bg-[#fffdf9] p-5 shadow-[0_24px_60px_-42px_rgba(67,31,20,0.65)] sm:p-7">
              <div className="absolute inset-y-0 left-0 w-1 bg-[#8b1a1a]" aria-hidden="true" />
              {hasPrice ? (
                <>
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#876c5c]">Your selection</p>
                      <p className="mt-1 text-4xl font-semibold tracking-tight text-[#8b1a1a]">₹{formatPrice(currentPrice)}</p>
                    </div>
                    {selectedPack && <p className="pb-1 text-sm font-semibold text-[#6b5347]">{selectedPack.size} pack</p>}
                  </div>

                  {product.packPrices.length > 0 && (
                    <fieldset className="mt-6">
                      <legend className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#6b5347]">Choose a pack size</legend>
                      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {product.packPrices.map((pack: PackPrice) => {
                          const isSelected = selectedPack?.size === pack.size
                          return (
                            <button
                              key={`${product.slug}-${pack.size}`}
                              type="button"
                              onClick={() => setSelectedPack(pack)}
                              aria-pressed={isSelected}
                              className={`relative min-h-20 rounded-xl border p-3 text-left transition-all ${isSelected ? 'border-[#8b1a1a] bg-[#8b1a1a] text-white shadow-md' : 'border-[#dfd2c4] bg-white text-[#2d1b15] hover:border-[#b98d47]'}`}
                            >
                              <span className="block text-sm font-bold">{pack.size}</span>
                              <span className={`mt-1 block text-xs font-semibold ${isSelected ? 'text-[#f5d998]' : 'text-[#8b1a1a]'}`}>₹{formatPrice(pack.price)}</span>
                              {isSelected && <Check className="absolute right-3 top-3 h-4 w-4 text-[#f5d998]" />}
                            </button>
                          )
                        })}
                      </div>
                    </fieldset>
                  )}

                  <div className="mt-6 grid gap-3 sm:grid-cols-[128px_minmax(0,1fr)]">
                    <div className="flex h-14 items-center justify-between rounded-xl border border-[#dfd2c4] bg-white" aria-label="Quantity selector">
                      <button type="button" onClick={() => setQty((value) => Math.max(1, value - 1))} className="h-full w-10 text-xl text-[#5c453a] hover:bg-[#faf6f0]" aria-label="Decrease quantity">−</button>
                      <span className="font-bold tabular-nums text-[#2d1b15]" aria-live="polite">{qty}</span>
                      <button type="button" onClick={() => setQty((value) => value + 1)} className="h-full w-10 text-xl text-[#5c453a] hover:bg-[#faf6f0]" aria-label="Increase quantity">+</button>
                    </div>
                    <button type="button" onClick={handleAddToCart} className="group flex h-14 items-center justify-center gap-3 rounded-xl bg-[#8b1a1a] px-6 text-base font-bold text-white shadow-[0_14px_30px_-16px_rgba(139,26,26,.75)] transition-all hover:bg-[#6d1414] hover:shadow-lg">
                      {added ? <Check className="h-5 w-5" /> : <ShoppingBag className="h-5 w-5" />}
                      <span aria-live="polite">{added ? 'Added to cart' : 'Add to cart'}</span>
                      {!added && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div><p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#9d722f]">Availability</p><h2 className="mt-1 text-2xl font-semibold text-[#2d1b15]">Price on request</h2></div>
                  <Link href="/contact" className="inline-flex h-12 items-center justify-center rounded-xl bg-[#8b1a1a] px-6 font-bold text-white hover:bg-[#6d1414]">Enquire now</Link>
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-[#e4d8cb] pt-4">
                <WishlistButton productId={product.id} variant="pill" className="!border-0 !p-0" />
                <Link href="/contact" className="inline-flex items-center gap-2 text-sm font-bold text-[#6f5143] hover:text-[#8b1a1a]"><MessageCircle className="h-4 w-4" /> Ask about this product</Link>
              </div>
            </section>

            <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[#dfd2c4] bg-[#dfd2c4] sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
              {[
                { icon: Leaf, label: 'Farm-led', sub: 'Carefully selected' },
                { icon: PackageCheck, label: 'Food-grade', sub: 'Securely packed' },
                { icon: Truck, label: 'Pan-India', sub: 'Tracked delivery' },
                { icon: ShieldCheck, label: 'FSSAI', sub: 'Quality standards' },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="bg-[#f6f0e7] px-3 py-4 text-center">
                  <Icon className="mx-auto h-4 w-4 text-[#9d722f]" />
                  <p className="mt-2 text-xs font-bold text-[#2d1b15]">{label}</p>
                  <p className="mt-0.5 text-[10px] text-[#766054]">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <ProductTabs product={product} details={details} />

        <section id="reviews" className="scroll-mt-48 py-16 lg:py-24">
          <div className="mb-8 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#9d722f]">Shared by our customers</p>
            <h2 className="mt-3 text-4xl font-semibold leading-none text-[#2d1b15]">From kitchens across India.</h2>
          </div>
          <ProductReviews productSlug={product.slug} />
        </section>

        {related.length > 0 && (
          <section className="border-t border-[#ded0c1] py-16 lg:py-24">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div><p className="text-xs font-bold uppercase tracking-[0.24em] text-[#9d722f]">Continue exploring</p><h2 className="mt-3 text-4xl font-semibold leading-none text-[#2d1b15]">More from this collection.</h2></div>
              <Link href={`/products?category=${encodeURIComponent(product.category)}`} className="inline-flex items-center gap-2 text-sm font-bold text-[#8b1a1a] hover:underline">View the collection <ArrowRight className="h-4 w-4" /></Link>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
              {related.map((item) => {
                const firstPack = item.packPrices[0]
                const price = firstPack?.price || item.price
                return (
                  <Link key={item.id} href={`/products/${item.slug}`} className="group block">
                    <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] border border-[#dfd2c4] bg-[#eee5d8]">
                      <div className="absolute inset-5 rounded-full border border-[#c9a45c]/25" aria-hidden="true" />
                      <Image src={item.image} alt={item.name} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-contain p-7 drop-shadow-xl transition-transform duration-500 group-hover:scale-105" />
                      <span className="absolute bottom-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#8b1a1a] text-white transition-transform group-hover:translate-x-1"><ArrowRight className="h-4 w-4" /></span>
                    </div>
                    <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#9d722f]">{item.category}</p>
                    <h3 className="mt-1 text-lg font-semibold leading-tight text-[#2d1b15] transition-colors group-hover:text-[#8b1a1a]">{item.name}</h3>
                    {price > 0 && <p className="mt-2 text-sm font-bold text-[#8b1a1a]">From ₹{formatPrice(price)}</p>}
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        <RecentlyViewed excludeId={product.id} />
      </div>

      <StickyAddToCart product={product} price={currentPrice} packLabel={selectedPack?.size} onAdd={handleAddToCart} disabled={!hasPrice} />
    </main>
  )
}
