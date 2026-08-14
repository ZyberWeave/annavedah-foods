import Link from 'next/link'
import type { Product } from '@/lib/content'
import type { ProductDetails } from '@/lib/product-details'

type Props = {
  product: Product
  details: ProductDetails | null
}

function DetailList({ items, columns = true }: { items: string[]; columns?: boolean }) {
  return (
    <ul className={columns ? 'grid gap-x-10 sm:grid-cols-2' : ''}>
      {items.map((item, index) => (
        <li key={`${index}-${item}`} className="border-t border-[#d8cabd] py-3 text-sm leading-6 text-[#4d392f]">
          {item}
        </li>
      ))}
    </ul>
  )
}

function SectionTitle({ number, label, title }: { number: string; label: string; title: string }) {
  return (
    <header className="grid gap-3 pb-8 sm:grid-cols-[80px_minmax(0,1fr)] sm:gap-6">
      <span className="text-xs font-bold tracking-[0.2em] text-[#9d722f]">{number}</span>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#8b1a1a]">{label}</p>
        <h3 className="mt-2 max-w-2xl text-3xl font-semibold leading-[1.05] text-[#2d1b15] sm:text-4xl">{title}</h3>
      </div>
    </header>
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
    <section id="product-story" className="scroll-mt-48 border-t border-[#cab9aa] pt-16 lg:pt-24">
      <div className="grid gap-10 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-16">
        <aside className="h-fit lg:sticky site-sticky-top">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#9d722f]">Product notes</p>
          <h2 className="mt-4 text-4xl font-semibold leading-[0.98] text-[#2d1b15]">Everything worth knowing.</h2>
          <nav className="mt-8 hidden border-t border-[#cab9aa] text-sm lg:block" aria-label="Product information">
            {[
              ['01', 'The product', '#story-overview'],
              ['02', 'Inside the pack', '#story-composition'],
              ['03', 'How to use', '#story-use'],
              ['04', 'Delivery', '#story-delivery'],
            ].map(([number, label, href]) => (
              <a key={href} href={href} className="grid grid-cols-[40px_1fr] border-b border-[#ded2c6] py-3 text-[#4d392f] transition-colors hover:text-[#8b1a1a]">
                <span className="text-xs text-[#9d722f]">{number}</span><span>{label}</span>
              </a>
            ))}
          </nav>
        </aside>

        <div>
          <article id="story-overview" className="scroll-mt-48 border-t border-[#2d1b15] py-10 first:pt-0 first:border-t-0 sm:py-14">
            <SectionTitle number="01" label="Origin and character" title={`The story of ${product.name}`} />
            <div className="grid gap-8 sm:grid-cols-[80px_minmax(0,1fr)] sm:gap-6">
              <div />
              <div>
                <div className="max-w-3xl space-y-5 text-base leading-7 text-[#4d392f]">
                  {overview.map((paragraph, index) => <p key={`${index}-${paragraph}`}>{paragraph}</p>)}
                </div>
                {features.length > 0 && (
                  <div className="mt-10">
                    <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.22em] text-[#9d722f]">Product characteristics</p>
                    <DetailList items={features} />
                  </div>
                )}
              </div>
            </div>

            {(details?.speciality?.length || details?.cultivation?.length) ? (
              <div className="mt-12 grid gap-10 border-t border-[#cab9aa] pt-10 md:grid-cols-2">
                {details?.speciality?.length ? (
                  <div>
                    <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.22em] text-[#8b1a1a]">What sets it apart</p>
                    <DetailList items={details.speciality} columns={false} />
                  </div>
                ) : null}
                {details?.cultivation?.length ? (
                  <div>
                    <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.22em] text-[#8b1a1a]">From the source</p>
                    <DetailList items={details.cultivation} columns={false} />
                  </div>
                ) : null}
              </div>
            ) : null}
          </article>

          <article id="story-composition" className="scroll-mt-48 border-t border-[#2d1b15] py-10 sm:py-14">
            <SectionTitle number="02" label="Composition and quality" title="A closer look inside the pack" />
            <div className="grid gap-10 md:grid-cols-2">
              <div>
                <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.22em] text-[#9d722f]">Ingredients and composition</p>
                {details?.ingredients?.length ? <DetailList items={details.ingredients} columns={false} /> : (
                  <p className="border-t border-[#d8cabd] pt-4 text-sm leading-6 text-[#6b5347]">A product-specific ingredient list was not included in the supplied detail document. Please check the pack label for the final ingredient declaration.</p>
                )}
              </div>
              <div>
                <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.22em] text-[#9d722f]">Nutritional information</p>
                {nutrition.length ? <DetailList items={nutrition} columns={false} /> : (
                  <p className="border-t border-[#d8cabd] pt-4 text-sm leading-6 text-[#6b5347]">Product-specific nutritional values are not available in the supplied detail document. Refer to the current pack label for declared values.</p>
                )}
              </div>
            </div>
            {(details?.quality?.length || details?.certification?.length) ? (
              <div className="mt-12 grid gap-10 border-t border-[#cab9aa] pt-10 md:grid-cols-2">
                {details?.quality?.length ? <div><p className="mb-5 text-[11px] font-bold uppercase tracking-[0.22em] text-[#8b1a1a]">Quality indicators</p><DetailList items={details.quality} columns={false} /></div> : null}
                {details?.certification?.length ? <div><p className="mb-5 text-[11px] font-bold uppercase tracking-[0.22em] text-[#8b1a1a]">Source and label notes</p><DetailList items={details.certification} columns={false} /></div> : null}
              </div>
            ) : null}
            <p className="mt-8 border-t border-[#d8cabd] pt-4 text-xs italic leading-5 text-[#776154]">Product information is provided for general guidance and is not medical advice. Pack declarations take precedence.</p>
          </article>

          <article id="story-use" className="scroll-mt-48 border-t border-[#2d1b15] py-10 sm:py-14">
            <SectionTitle number="03" label="Everyday use" title="Make it part of your routine" />
            <div className="grid gap-10 md:grid-cols-[1.2fr_.8fr]">
              <div>
                <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.22em] text-[#9d722f]">Suggested uses</p>
                <DetailList items={uses} columns={false} />
                {details?.preparation?.length ? <div className="mt-10"><p className="mb-5 text-[11px] font-bold uppercase tracking-[0.22em] text-[#8b1a1a]">Preparation</p><DetailList items={details.preparation} columns={false} /></div> : null}
              </div>
              <div className="border-l border-[#cab9aa] pl-6 md:pl-10">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#8b1a1a]">Storage</p>
                <div className="mt-5"><DetailList items={storage} columns={false} /></div>
              </div>
            </div>
          </article>

          <article id="story-delivery" className="scroll-mt-48 border-y border-[#2d1b15] py-10 sm:py-14">
            <SectionTitle number="04" label="From us to your shelf" title="Packed and delivered with care" />
            <dl className="grid border-t border-[#cab9aa] sm:grid-cols-2">
              {[
                ['Pan-India shipping', 'Free on orders ₹999+. Usually delivered in 3–7 business days.'],
                ['7-day returns', 'Available for eligible unopened and undamaged items.'],
                ['Secure packaging', 'Food-grade materials and careful outer packing.'],
                ['Payment flexibility', 'Secure online payment and cash on delivery options.'],
              ].map(([title, text], index) => (
                <div key={title} className={`border-b border-[#cab9aa] py-5 sm:px-6 ${index % 2 === 0 ? 'sm:border-r sm:pl-0' : 'sm:pr-0'}`}>
                  <dt className="font-semibold text-[#2d1b15]">{title}</dt>
                  <dd className="mt-1 text-sm leading-6 text-[#6b5347]">{text}</dd>
                </div>
              ))}
            </dl>
            <Link href="/shipping" className="mt-6 inline-block border-b border-[#8b1a1a] pb-1 text-sm font-bold text-[#8b1a1a]">Read shipping and return policies</Link>
          </article>
        </div>
      </div>
    </section>
  )
}
