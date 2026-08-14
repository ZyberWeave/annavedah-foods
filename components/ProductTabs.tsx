import Link from 'next/link'
import type { Product } from '@/lib/content'
import type { ProductDetails } from '@/lib/product-details'
import { ArrowUpRight, Leaf, PackageCheck, RefreshCcw, ShieldCheck, Truck } from 'lucide-react'

type Props = {
  product: Product
  details: ProductDetails | null
}

function DetailList({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {items.map((item, index) => (
        <li key={`${index}-${item}`} className="flex gap-3 border-t border-[#dfd2c4] pt-3 text-sm leading-6 text-[#4d392f]">
          <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-[#9d722f]" aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

function SectionHeading({ index, eyebrow, title, inverted = false }: { index: string; eyebrow: string; title: string; inverted?: boolean }) {
  return (
    <div className="mb-6 flex items-start gap-4">
      <span className={`pt-1 text-xs font-bold tracking-[0.2em] ${inverted ? 'text-[#dab96f]' : 'text-[#9d722f]'}`}>{index}</span>
      <div>
        <p className={`text-[11px] font-bold uppercase tracking-[0.22em] ${inverted ? 'text-[#f0ce82]' : 'text-[#8b1a1a]'}`}>{eyebrow}</p>
        <h3 className={`mt-1 text-2xl font-semibold leading-tight sm:text-3xl ${inverted ? 'text-[#fffaf2]' : 'text-[#2d1b15]'}`}>{title}</h3>
      </div>
    </div>
  )
}

export default function ProductTabs({ product, details }: Props) {
  const overview = details?.overview?.length ? details.overview : [product.description]
  const features = details?.features?.length ? details.features : product.highlights
  const uses = details?.uses?.length ? details.uses : [product.usage]
  const storage = details?.storage?.length
    ? details.storage
    : ['Store in a cool, dry place in an airtight container. Use a clean, dry spoon.']
  const nutrition = details?.nutritionFacts?.length ? details.nutritionFacts : details?.nutrition || []

  return (
    <section id="product-story" className="scroll-mt-48 border-y border-[#ded0c1] py-16 lg:py-24">
      <div className="grid gap-12 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-16">
        <aside className="lg:sticky site-sticky-top h-fit">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#9d722f]">Product journal</p>
          <h2 className="mt-3 text-4xl font-semibold leading-[0.95] text-[#2d1b15]">Know what goes into your pantry.</h2>
          <p className="mt-5 text-sm leading-6 text-[#6b5347]">Every useful detail, brought into one continuous reading experience.</p>
          <nav className="mt-8 hidden border-l border-[#d7c5b3] pl-5 text-sm lg:grid lg:gap-3" aria-label="Product information">
            <a href="#story-overview" className="text-[#4d392f] transition-colors hover:text-[#8b1a1a]">The story</a>
            <a href="#story-composition" className="text-[#4d392f] transition-colors hover:text-[#8b1a1a]">Inside the pack</a>
            <a href="#story-use" className="text-[#4d392f] transition-colors hover:text-[#8b1a1a]">Ways to use</a>
            <a href="#story-delivery" className="text-[#4d392f] transition-colors hover:text-[#8b1a1a]">Delivery care</a>
          </nav>
        </aside>

        <div className="space-y-6">
          <article id="story-overview" className="scroll-mt-48 rounded-[2rem] bg-[#2f211b] px-6 py-8 text-[#fffaf2] sm:px-9 sm:py-10">
            <SectionHeading index="01" eyebrow="Origin and character" title={`The story of ${product.name}`} inverted />
            <div className="space-y-4 text-base leading-7 text-[#eee2d3]">
              {overview.map((paragraph, index) => <p key={`${index}-${paragraph}`}>{paragraph}</p>)}
            </div>
            {features.length > 0 && (
              <div className="mt-9 border-t border-white/15 pt-7 [&_li]:border-white/15 [&_li]:text-[#f5eadc]">
                <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.22em] text-[#dab96f]">Product characteristics</p>
                <DetailList items={features} />
              </div>
            )}
          </article>

          {(details?.speciality?.length || details?.cultivation?.length) ? (
            <div className="grid gap-6 md:grid-cols-2">
              {details?.speciality?.length ? (
                <article className="rounded-[2rem] border border-[#d9caba] bg-[#f4ede3] p-6 sm:p-8">
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#8b1a1a]">Distinctive by nature</p>
                  <div className="mt-5"><DetailList items={details.speciality} /></div>
                </article>
              ) : null}
              {details?.cultivation?.length ? (
                <article className="rounded-[2rem] border border-[#d9caba] bg-[#ece6d7] p-6 sm:p-8">
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#8b1a1a]">From the source</p>
                  <div className="mt-5"><DetailList items={details.cultivation} /></div>
                </article>
              ) : null}
            </div>
          ) : null}

          <article id="story-composition" className="scroll-mt-48 rounded-[2rem] border border-[#d9caba] bg-white p-6 sm:p-9">
            <SectionHeading index="02" eyebrow="Composition and quality" title="A closer look inside the pack" />
            <div className="grid gap-9 xl:grid-cols-2">
              <div>
                <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.22em] text-[#9d722f]">Ingredients and composition</p>
                {details?.ingredients?.length ? <DetailList items={details.ingredients} /> : (
                  <p className="text-sm leading-6 text-[#6b5347]">A product-specific ingredient list was not included in the supplied detail document. Please check the pack label for the final ingredient declaration.</p>
                )}
              </div>
              <div>
                <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.22em] text-[#9d722f]">Nutritional information</p>
                {nutrition.length ? <DetailList items={nutrition} /> : (
                  <p className="text-sm leading-6 text-[#6b5347]">Product-specific nutritional values are not available in the supplied detail document. Refer to the current pack label for declared values.</p>
                )}
              </div>
            </div>
            {(details?.quality?.length || details?.certification?.length) ? (
              <div className="mt-9 grid gap-6 border-t border-[#dfd2c4] pt-8 md:grid-cols-2">
                {details?.quality?.length ? <div><p className="mb-4 text-[11px] font-bold uppercase tracking-[0.22em] text-[#8b1a1a]">Quality indicators</p><DetailList items={details.quality} /></div> : null}
                {details?.certification?.length ? <div><p className="mb-4 text-[11px] font-bold uppercase tracking-[0.22em] text-[#8b1a1a]">Source and label notes</p><DetailList items={details.certification} /></div> : null}
              </div>
            ) : null}
            <p className="mt-8 text-xs italic leading-5 text-[#776154]">Product information is provided for general guidance and is not medical advice. Pack declarations take precedence.</p>
          </article>

          <article id="story-use" className="scroll-mt-48 overflow-hidden rounded-[2rem] border border-[#d9caba] bg-[#8b1a1a] text-white">
            <div className="grid md:grid-cols-[1.15fr_.85fr]">
              <div className="p-6 sm:p-9">
                <SectionHeading index="03" eyebrow="Everyday use" title="Make it part of your routine" inverted />
                <DetailList items={uses} />
                {details?.preparation?.length ? <div className="mt-8 border-t border-white/20 pt-7"><p className="mb-4 text-[11px] font-bold uppercase tracking-[0.22em] text-[#f0ce82]">Preparation</p><DetailList items={details.preparation} /></div> : null}
              </div>
              <div className="bg-[#6d1414] p-6 sm:p-9">
                <Leaf className="h-7 w-7 text-[#e3bd69]" />
                <p className="mt-10 text-[11px] font-bold uppercase tracking-[0.22em] text-[#f0ce82]">Keep it at its best</p>
                <div className="mt-4 [&_li]:border-white/20 [&_li]:text-[#fff5e7]"><DetailList items={storage} /></div>
              </div>
            </div>
          </article>

          <article id="story-delivery" className="scroll-mt-48 rounded-[2rem] border border-[#d9caba] bg-[#f7f1e8] p-6 sm:p-9">
            <SectionHeading index="04" eyebrow="From us to your shelf" title="Packed and delivered with care" />
            <div className="grid gap-px overflow-hidden rounded-2xl border border-[#ded0c1] bg-[#ded0c1] sm:grid-cols-2">
              {[
                { icon: Truck, title: 'Pan-India shipping', text: 'Free on orders ₹999+. Usually delivered in 3–7 business days.' },
                { icon: RefreshCcw, title: '7-day returns', text: 'Available for eligible unopened and undamaged items.' },
                { icon: PackageCheck, title: 'Secure packaging', text: 'Food-grade materials and careful outer packing.' },
                { icon: ShieldCheck, title: 'Payment flexibility', text: 'Secure online payment and cash on delivery options.' },
              ].map(({ icon: Icon, title, text }) => (
                <div key={title} className="flex gap-4 bg-[#fffdf9] p-5">
                  <Icon className="h-5 w-5 flex-none text-[#9d722f]" />
                  <div><p className="font-semibold text-[#2d1b15]">{title}</p><p className="mt-1 text-sm leading-5 text-[#6b5347]">{text}</p></div>
                </div>
              ))}
            </div>
            <Link href="/shipping" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#8b1a1a] hover:underline">
              Read shipping and return policies <ArrowUpRight className="h-4 w-4" />
            </Link>
          </article>
        </div>
      </div>
    </section>
  )
}
