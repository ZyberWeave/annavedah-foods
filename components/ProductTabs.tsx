'use client'

import { useState } from 'react'
import type { Product } from '@/lib/content'
import { Truck, RefreshCcw, ShieldCheck, Leaf } from 'lucide-react'

type Props = {
  product: Product
}

const tabs = [
  { id: 'description', label: 'Description' },
  { id: 'ingredients', label: 'Ingredients & Nutrition' },
  { id: 'usage', label: 'How to Use' },
  { id: 'shipping', label: 'Shipping & Returns' },
] as const

type TabId = (typeof tabs)[number]['id']

export default function ProductTabs({ product }: Props) {
  const [active, setActive] = useState<TabId>('description')

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
          <div className="space-y-4">
            <p className="text-[#2d1b15] leading-relaxed">{product.description}</p>
            <div>
              <h4 className="text-sm font-bold uppercase tracking-widest text-[#c9a45c] mb-3">Why it works</h4>
              <ul className="space-y-2">
                {product.highlights.map((h) => (
                  <li key={h} className="flex gap-2 text-[#2d1b15]">
                    <Leaf className="w-4 h-4 text-[#c9a45c] flex-shrink-0 mt-0.5" />
                    <span className="text-sm leading-relaxed">{h}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {product.benefits.map((b) => (
                <span key={b} className="rounded-full bg-[#c9a45c]/10 border border-[#c9a45c]/20 px-3 py-1 text-xs font-semibold text-[#8b1a1a]">
                  {b}
                </span>
              ))}
            </div>
          </div>
        )}

        {active === 'ingredients' && (
          <div className="space-y-5">
            <div>
              <h4 className="text-sm font-bold uppercase tracking-widest text-[#c9a45c] mb-2">Ingredients</h4>
              <p className="text-[#2d1b15]">100% pure {product.name}. Nothing added, nothing taken away. No preservatives, no artificial colors, no fillers.</p>
            </div>
            <div>
              <h4 className="text-sm font-bold uppercase tracking-widest text-[#c9a45c] mb-3">Typical nutritional values (per 100g)</h4>
              <div className="rounded-2xl border border-[#e8ddd0] overflow-hidden">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-[#e8ddd0]">
                    {[
                      ['Energy', '~ 350 kcal'],
                      ['Protein', '8 - 22 g'],
                      ['Carbohydrate', '40 - 70 g'],
                      ['Fat', '1 - 5 g'],
                      ['Dietary Fibre', '5 - 15 g'],
                    ].map(([k, v]) => (
                      <tr key={k} className="hover:bg-[#faf6f0]/40">
                        <td className="px-4 py-2.5 font-semibold text-[#2d1b15]">{k}</td>
                        <td className="px-4 py-2.5 text-right text-[#6b5347]">{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-[#6b5347] mt-2 italic">Indicative values. Actual values vary by season, harvest, and pack.</p>
            </div>
          </div>
        )}

        {active === 'usage' && (
          <div className="space-y-4">
            <p className="text-[#2d1b15] leading-relaxed">{product.usage}</p>
            <div className="grid sm:grid-cols-3 gap-3 pt-2">
              {[
                { title: 'Daily smoothie', desc: '1 tsp blended with milk or plant-milk and seasonal fruit.' },
                { title: 'Cooking boost', desc: 'Stir into dals, curries, or atta dough for added nutrition.' },
                { title: 'Warm drink', desc: 'Mix with warm water and a hint of jaggery for an evening tonic.' },
              ].map((c) => (
                <div key={c.title} className="rounded-xl border border-[#e8ddd0] bg-[#faf6f0]/40 p-4">
                  <p className="text-sm font-bold text-[#2d1b15] mb-1">{c.title}</p>
                  <p className="text-xs text-[#6b5347] leading-relaxed">{c.desc}</p>
                </div>
              ))}
            </div>
            <div className="bg-[#c9a45c]/10 border border-[#c9a45c]/30 rounded-xl p-4 mt-3">
              <p className="text-xs font-bold uppercase tracking-widest text-[#8b1a1a] mb-1">Storage</p>
              <p className="text-sm text-[#2d1b15]">Store in a cool, dry place in an airtight container. Use a clean dry spoon.</p>
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
