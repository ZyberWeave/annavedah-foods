import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Leaf, FlaskConical, Wheat, PackageCheck, ShieldCheck,
  Truck, Microscope, Heart, Sun, Sparkles, ArrowRight,
  CheckCircle2, XCircle, Star
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Why Choose Us | Annavedah Foods',
  description: 'Discover the Annavedah difference - nutrient-dense, easy-to-use, Ayurveda-inspired, and lab-tested traditional nutrition products.',
  keywords: ['benefits', 'nutrient dense', 'Ayurveda inspired', 'lab tested', 'traditional nutrition', 'Annavedah difference'],
  openGraph: {
    title: 'Why Families Trust Annavedah',
    description: 'Thoughtfully crafted blends that fit seamlessly into daily meals while protecting the integrity of every ingredient.',
    type: 'website',
  },
}

const coreBenefits = [
  {
    icon: Leaf,
    title: 'Farm-Sourced & Pure',
    description: 'Everything is farm-sourced with no middlemen, ensuring the best quality and purity for your family.',
    details: [
      'Direct partnerships with local farmers',
      'Zero artificial additives or preservatives',
      'Complete traceability from soil to shelf',
    ],
    color: '#4a7c59',
    bgColor: '#4a7c59',
  },
  {
    icon: FlaskConical,
    title: 'Nutrient Focused',
    description: 'Products designed for practical daily nutrition with minimal processing steps and no hidden chemicals.',
    details: [
      'Traditional stone-grinding preserves nutrients',
      'No bleaching, polishing, or harsh treatments',
      'Rich in natural vitamins and minerals',
    ],
    color: '#8b1a1a',
    bgColor: '#8b1a1a',
  },
  {
    icon: Wheat,
    title: 'Traditional Range',
    description: 'Includes pure grains, pulses, powders, and pantry essentials — all in one trusted place.',
    details: [
      '100+ products across 7 categories',
      'Heritage recipes and Ayurvedic staples',
      'Seasonal and regional specialties',
    ],
    color: '#b8860b',
    bgColor: '#b8860b',
  },
  {
    icon: PackageCheck,
    title: 'Family Pack Options',
    description: 'Multiple pack sizes available across major categories for convenient household use.',
    details: [
      'From 100g trial packs to 1kg family sizes',
      'Eco-conscious, food-safe packaging',
      'Ideal for weekly and monthly meal planning',
    ],
    color: '#6b5347',
    bgColor: '#6b5347',
  },
]

const processSteps = [
  { icon: Sun, title: 'Sourced', desc: 'Handpicked from trusted local farms across Maharashtra' },
  { icon: Microscope, title: 'Tested', desc: 'Quality checks at every stage for purity and safety' },
  { icon: Sparkles, title: 'Processed', desc: 'Minimal traditional processing — sun-dried, stone-ground' },
  { icon: Truck, title: 'Delivered', desc: 'Sealed fresh and shipped directly to your doorstep' },
]

const comparisonRows = [
  { feature: 'Sourcing', us: 'Direct from farms', them: 'Bulk wholesalers' },
  { feature: 'Processing', us: 'Stone-ground, sun-dried', them: 'Machine-processed' },
  { feature: 'Additives', us: 'Zero chemicals', them: 'Preservatives & colors' },
  { feature: 'Traceability', us: 'Full farm-to-table', them: 'Unknown origin' },
  { feature: 'Freshness', us: 'Made in small batches', them: 'Mass production' },
  { feature: 'Pack Sizes', us: 'Flexible family packs', them: 'One size fits all' },
]

const trustStats = [
  { value: '100+', label: 'Products' },
  { value: '7', label: 'Categories' },
  { value: '5000+', label: 'Happy Families' },
  { value: '100%', label: 'Natural' },
]

export default function BenefitsPage() {
  return (
    <div className="min-h-screen bg-[#faf6f0]">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden site-page-gap-wide pb-12 md:pb-20">
        <div className="absolute inset-0 opacity-30 pattern-overlay" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#c9a45c]/15 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#8b1a1a]/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#8b1a1a]/10 text-[#8b1a1a] text-sm font-semibold tracking-wide uppercase">
              <ShieldCheck className="w-4 h-4" /> The Annavedah Difference
            </span>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#2d1b15] leading-tight">
              Why Families{' '}
              <span className="relative inline-block">
                <span className="relative z-10 text-[#8b1a1a]">Trust</span>
                <span className="absolute bottom-1 left-0 w-full h-3 bg-[#c9a45c]/30 -z-0 rounded" />
              </span>{' '}
              Annavedah
            </h1>

            <p className="text-lg md:text-xl text-[#6b5347] max-w-2xl mx-auto leading-relaxed">
              Thoughtfully crafted blends that fit seamlessly into daily meals while protecting the integrity of every ingredient.
            </p>

            <div className="mx-auto grid max-w-2xl grid-cols-2 gap-4 pt-4 md:grid-cols-4">
              {trustStats.map((s) => (
                <div key={s.label} className="flex min-h-[88px] w-full flex-col items-center justify-center px-4 py-3 bg-white/70 rounded-2xl border border-[#e8ddd0] backdrop-blur-sm">
                  <span className="text-2xl md:text-3xl font-bold text-[#8b1a1a]">{s.value}</span>
                  <span className="text-center text-xs text-[#6b5347] font-medium uppercase tracking-wide">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Core Benefits Grid ── */}
      <section className="container mx-auto px-4 pb-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-[#2d1b15]">What Sets Us Apart</h2>
          <p className="text-[#6b5347] mt-3 max-w-xl mx-auto">Every product we offer reflects a commitment to purity, tradition, and your family&apos;s wellbeing.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {coreBenefits.map((b, i) => {
            const Icon = b.icon
            return (
              <div
                key={b.title}
                className="group relative bg-white rounded-3xl p-8 border border-[#e8ddd0] shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 overflow-hidden"
              >
                {/* Decorative corner accent */}
                <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-[80px] opacity-[0.07] transition-opacity group-hover:opacity-[0.12]" style={{ background: b.bgColor }} />

                <div className="flex items-start gap-5">
                  <div className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg" style={{ background: `linear-gradient(135deg, ${b.color}, ${b.color}dd)` }}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <h3 className="text-xl font-bold text-[#2d1b15]">{b.title}</h3>
                    <p className="text-[#6b5347] leading-relaxed">{b.description}</p>
                    <ul className="space-y-2 pt-2">
                      {b.details.map((d) => (
                        <li key={d} className="flex items-start gap-2 text-sm text-[#6b5347]">
                          <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: b.color }} />
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Process Timeline ── */}
      <section className="py-20 bg-gradient-to-b from-white to-[#faf6f0]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-[#2d1b15]">From Farm to Your Table</h2>
            <p className="text-[#6b5347] mt-3 max-w-xl mx-auto">A transparent, minimal-step journey that preserves the natural goodness of every ingredient.</p>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Desktop timeline */}
            <div className="hidden md:grid grid-cols-4 gap-0 relative">
              {/* Connecting line */}
              <div className="absolute top-8 left-[12.5%] right-[12.5%] h-[2px] bg-gradient-to-r from-[#c9a45c]/30 via-[#8b1a1a]/40 to-[#4a7c59]/30" />

              {processSteps.map((step, i) => {
                const Icon = step.icon
                return (
                  <div key={step.title} className="relative flex flex-col items-center text-center px-4">
                    <div className="relative z-10 w-16 h-16 rounded-full bg-white border-2 border-[#c9a45c] flex items-center justify-center text-[#8b1a1a] shadow-md mb-5">
                      <Icon className="w-7 h-7" />
                      <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#8b1a1a] text-white text-xs font-bold flex items-center justify-center">{i + 1}</span>
                    </div>
                    <h4 className="font-bold text-[#2d1b15] text-lg mb-1">{step.title}</h4>
                    <p className="text-sm text-[#6b5347]">{step.desc}</p>
                  </div>
                )
              })}
            </div>

            {/* Mobile timeline */}
            <div className="md:hidden space-y-6">
              {processSteps.map((step, i) => {
                const Icon = step.icon
                return (
                  <div key={step.title} className="flex items-start gap-4">
                    <div className="relative flex-shrink-0 w-12 h-12 rounded-full bg-white border-2 border-[#c9a45c] flex items-center justify-center text-[#8b1a1a] shadow-md">
                      <Icon className="w-5 h-5" />
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#8b1a1a] text-white text-[10px] font-bold flex items-center justify-center">{i + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-[#2d1b15]">{step.title}</h4>
                      <p className="text-sm text-[#6b5347]">{step.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Comparison Table ── */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-[#2d1b15]">Annavedah vs. The Market</h2>
          <p className="text-[#6b5347] mt-3 max-w-xl mx-auto">See how our commitment to quality stacks up against typical market offerings.</p>
        </div>

        <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-[#e8ddd0] shadow-lg overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-3 bg-[#2d1b15] text-white font-bold text-sm md:text-base">
            <div className="p-4 md:p-5">Feature</div>
            <div className="p-4 md:p-5 text-center bg-[#8b1a1a] flex items-center justify-center gap-2">
              <Star className="w-4 h-4 text-[#c9a45c]" /> Annavedah
            </div>
            <div className="p-4 md:p-5 text-center">Typical Brands</div>
          </div>
          {/* Rows */}
          {comparisonRows.map((row, i) => (
            <div key={row.feature} className={`grid grid-cols-3 text-sm md:text-base ${i % 2 === 0 ? 'bg-[#faf6f0]/50' : 'bg-white'} ${i < comparisonRows.length - 1 ? 'border-b border-[#e8ddd0]' : ''}`}>
              <div className="p-4 md:p-5 font-semibold text-[#2d1b15]">{row.feature}</div>
              <div className="p-4 md:p-5 text-center flex items-center justify-center gap-2 text-[#4a7c59] font-medium bg-[#4a7c59]/[0.04]">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline">{row.us}</span>
              </div>
              <div className="p-4 md:p-5 text-center flex items-center justify-center gap-2 text-[#999]">
                <XCircle className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline">{row.them}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Promise Banner ── */}
      <section className="py-16 bg-gradient-to-r from-[#2d1b15] via-[#3d2a22] to-[#2d1b15] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pattern-overlay" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <Heart className="w-10 h-10 text-[#c9a45c] mx-auto" />
            <h2 className="text-3xl md:text-4xl font-bold text-white">Our Promise to You</h2>
            <p className="text-lg text-[#d4c4b0] leading-relaxed">
              Every product carries our guarantee of purity. No synthetic additives, no shortcuts. Just honest, farm-fresh food crafted with care for your family&apos;s health and happiness.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              {['100% Natural', 'No Preservatives', 'Lab Tested', 'Eco Packaging'].map((tag) => (
                <span key={tag} className="px-4 py-2 rounded-full border border-[#c9a45c]/40 text-[#c9a45c] text-sm font-medium">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-[#e8ddd0] shadow-xl p-10 md:p-14 text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold text-[#2d1b15]">
            Ready to Experience the Difference?
          </h2>
          <p className="text-[#6b5347] text-lg max-w-xl mx-auto">
            Start with one spoon a day. Explore our product range to find the blend that matches your family&apos;s goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 bg-[#8b1a1a] hover:bg-[#6d1414] text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-[#8b1a1a]/20 hover:shadow-xl hover:-translate-y-0.5"
            >
              Explore Products <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/heritage"
              className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-[#8b1a1a] text-[#8b1a1a] hover:bg-[#8b1a1a]/5 px-8 py-4 rounded-xl font-bold text-lg transition-all"
            >
              Our Heritage
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
