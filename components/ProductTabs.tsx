'use client'

import { useState } from 'react'
import type { Product } from '@/lib/content'
import type { ProductDetails } from '@/lib/product-details'
import { Truck, RefreshCcw, ShieldCheck, Leaf } from 'lucide-react'

type Props = {
  product: Product
  details: ProductDetails | null
}

const tabs = [
  { id: 'description', label: 'Description' },
  { id: 'ingredients', label: 'Ingredients & Nutrition' },
  { id: 'usage', label: 'How to Use' },
  { id: 'shipping', label: 'Shipping & Returns' },
] as const

type TabId = (typeof tabs)[number]['id']

function DetailList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 pl-5 list-disc marker:text-[#c9a45c]">
      {items.map((item, index) => (
        <li key={`${index}-${item}`} className="pl-1 text-sm leading-relaxed text-[#2d1b15]">
          {item}
        </li>
      ))}
    </ul>
  )
}

export default function ProductTabs({ product, details }: Props) {
  const [active, setActive] = useState<TabId>('description')
  const overview = details?.overview?.length ? details.overview : [product.description]
  const features = details?.features?.length ? details.features : product.highlights
  const uses = details?.uses?.length ? details.uses : [product.usage]
  const storage = details?.storage?.length
    ? details.storage
    : ['Store in a cool, dry place in an airtight container. Use a clean, dry spoon.']

  return (
    <div className="rounded-3xl border-2 border-[#e8ddd0] bg-white overflow-hidden">
      <div className="border-b border-[#e8ddd0] bg-[#faf6f0]/40 overflow-x-auto">
        <div className="flex min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={`relative px-6 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${
                active === tab.id
                  ? 'text-[#8b1a1a]'
                  : 'text-[#6b5347] hover:text-[#2d1b15]'
              }`}
            >
              {tab.label}
              {active === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8b1a1a]" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 md:p-8">
        {active === 'description' && (
          <div className="space-y-6">
            <div className="space-y-3">
              {overview.map((paragraph, index) => (
                <p key={`${index}-${paragraph}`} className="text-[#2d1b15] leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>

            {features.length > 0 && (
              <div>
                <h4 className="text-sm font-bold uppercase tracking-widest text-[#c9a45c] mb-3">
                  Product characteristics
                </h4>
                <DetailList items={features} />
              </div>
            )}

            {details?.speciality?.length ? (
              <div className="rounded-2xl border border-[#c9a45c]/30 bg-[#faf6f0]/60 p-5">
                <h4 className="text-sm font-bold uppercase tracking-widest text-[#8b1a1a] mb-3">
                  What makes it distinctive
                </h4>
                <DetailList items={details.speciality} />
              </div>
            ) : null}

            {details?.cultivation?.length ? (
              <div>
                <h4 className="text-sm font-bold uppercase tracking-widest text-[#c9a45c] mb-3">
                  Cultivation
                </h4>
                <DetailList items={details.cultivation} />
              </div>
            ) : null}

            <div>
              <h4 className="text-sm font-bold uppercase tracking-widest text-[#c9a45c] mb-3">
                At a glance
              </h4>
              <div className="flex flex-wrap gap-2">
                {product.benefits.map((benefit) => (
                  <span key={benefit} className="rounded-full bg-[#c9a45c]/10 border border-[#c9a45c]/20 px-3 py-1 text-xs font-semibold text-[#8b1a1a]">
                    {benefit}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {active === 'ingredients' && (
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-bold uppercase tracking-widest text-[#c9a45c] mb-3">
                Ingredients and composition
              </h4>
              {details?.ingredients?.length ? (
                <DetailList items={details.ingredients} />
              ) : (
                <p className="text-sm leading-relaxed text-[#6b5347]">
                  A product-specific ingredient list was not included in the supplied detail document. Please check the pack label for the final ingredient declaration.
                </p>
              )}
            </div>

            {details?.certification?.length ? (
              <div>
                <h4 className="text-sm font-bold uppercase tracking-widest text-[#c9a45c] mb-3">
                  Source and label notes
                </h4>
                <DetailList items={details.certification} />
              </div>
            ) : null}

            {details?.nutritionFacts?.length ? (
              <div>
                <h4 className="text-sm font-bold uppercase tracking-widest text-[#c9a45c] mb-3">
                  Nutritional values
                </h4>
                <DetailList items={details.nutritionFacts} />
              </div>
            ) : details?.nutrition?.length ? (
              <div>
                <h4 className="text-sm font-bold uppercase tracking-widest text-[#c9a45c] mb-3">
                  Nutritional properties
                </h4>
                <DetailList items={details.nutrition} />
              </div>
            ) : (
              <div className="rounded-2xl border border-[#e8ddd0] bg-[#faf6f0]/50 p-5">
                <p className="text-sm leading-relaxed text-[#6b5347]">
                  Product-specific nutritional values are not available in the supplied detail document. Refer to the current pack label for declared values.
                </p>
              </div>
            )}

            {details?.quality?.length ? (
              <div>
                <h4 className="text-sm font-bold uppercase tracking-widest text-[#c9a45c] mb-3">
                  Quality indicators
                </h4>
                <DetailList items={details.quality} />
              </div>
            ) : null}

            <p className="text-xs italic leading-relaxed text-[#6b5347]">
              Product information is provided for general guidance and is not medical advice. Pack declarations take precedence.
            </p>
          </div>
        )}

        {active === 'usage' && (
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-bold uppercase tracking-widest text-[#c9a45c] mb-3">
                Suggested uses
              </h4>
              <DetailList items={uses} />
            </div>

            {details?.preparation?.length ? (
              <div>
                <h4 className="text-sm font-bold uppercase tracking-widest text-[#c9a45c] mb-3">
                  Preparation
                </h4>
                <DetailList items={details.preparation} />
              </div>
            ) : null}

            <div className="bg-[#c9a45c]/10 border border-[#c9a45c]/30 rounded-xl p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-[#8b1a1a] mb-2">Storage</p>
              <DetailList items={storage} />
            </div>
          </div>
        )}

        {active === 'shipping' && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="flex gap-3 rounded-xl border border-[#e8ddd0] p-4">
                <Truck className="w-5 h-5 text-[#c9a45c] flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-[#2d1b15]">Pan-India shipping</p>
                  <p className="text-xs text-[#6b5347]">Free on orders ₹999+. 3-7 business days.</p>
                </div>
              </div>
              <div className="flex gap-3 rounded-xl border border-[#e8ddd0] p-4">
                <RefreshCcw className="w-5 h-5 text-[#c9a45c] flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-[#2d1b15]">7-day returns</p>
                  <p className="text-xs text-[#6b5347]">For unopened, undamaged items.</p>
                </div>
              </div>
              <div className="flex gap-3 rounded-xl border border-[#e8ddd0] p-4">
                <ShieldCheck className="w-5 h-5 text-[#c9a45c] flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-[#2d1b15]">Secure packaging</p>
                  <p className="text-xs text-[#6b5347]">Food-grade materials with leak-proof seal.</p>
                </div>
              </div>
              <div className="flex gap-3 rounded-xl border border-[#e8ddd0] p-4">
                <Leaf className="w-5 h-5 text-[#c9a45c] flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-[#2d1b15]">Cash on delivery</p>
                  <p className="text-xs text-[#6b5347]">Available on all orders. Small COD fee applies.</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-[#6b5347]">Read our full <a className="text-[#8b1a1a] font-semibold hover:underline" href="/shipping">shipping</a> and <a className="text-[#8b1a1a] font-semibold hover:underline" href="/returns">return</a> policies.</p>
          </div>
        )}
      </div>
    </div>
  )
}
