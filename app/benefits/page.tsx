import type { Metadata } from 'next'
import Link from 'next/link'
import { benefits } from '@/lib/content'

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

const benefitIcons = [
  // Nutrient Dense - molecule/atom icon in chart-1 color (brown/earth tone)
  <svg key="nutrient-dense" className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3" />
    <circle cx="6" cy="12" r="2" />
    <circle cx="18" cy="12" r="2" />
    <circle cx="12" cy="6" r="2" />
    <circle cx="12" cy="18" r="2" />
    <line x1="9" y1="9" x2="11" y2="11" />
    <line x1="15" y1="9" x2="13" y2="11" />
    <line x1="9" y1="15" x2="11" y2="13" />
    <line x1="15" y1="15" x2="13" y2="13" />
  </svg>,
  // Easy Integration - mixing/integration arrows in chart-3 color
  <svg key="easy-integration" className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    <circle cx="12" cy="12" r="1" />
  </svg>,
  // Ayurveda Inspired - ancient lotus/flower symbol in chart-4 color
  <svg key="ayurveda" className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
    <path d="M12 2v4M12 18v4M2 12h4M18 12h4M6.34 6.34l2.83 2.83M14.83 14.83l2.83 2.83M6.34 17.66l2.83-2.83M14.83 9.17l2.83-2.83" />
  </svg>,
  // Lab Tested - microscope/test tube in chart-5 color
  <svg key="lab-tested" className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2v4a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V2" />
    <path d="M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6" />
    <path d="M9 22h6" />
    <path d="M7 10h2M15 10h2M7 14h2M15 14h2M7 18h2M15 18h2" />
    <circle cx="12" cy="5" r="1" />
  </svg>
]

const benefitColors = [
  'text-chart-1', // Nutrient Dense - brown/earth tone
  'text-chart-2', // Dehydration - vibrant accent
  'text-chart-3', // Easy Integration - medium brown
  'text-chart-4', // Ayurveda - light tone
  'text-chart-5', // Lab Tested - medium tone
]

export default function BenefitsPage() {
  return (
    <div className="container mx-auto px-4 pt-[120px] lg:pt-[190px] pb-16 space-y-10">
      <div className="space-y-4 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-accent">Benefits</p>
        <h1 className="text-4xl font-bold text-primary md:text-5xl">Why families trust Annavedah</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Thoughtfully crafted blends that fit seamlessly into daily meals while protecting the integrity of every ingredient.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {benefits.map((benefit, index) => (
          <div key={benefit.title} className="group rounded-3xl border-2 border-border bg-card p-8 shadow-sm card-hover">
            <div className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 ${benefitColors[index] || 'text-primary'}`}>
              {benefitIcons[index] || <span className="font-bold">{index + 1}</span>}
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">{benefit.title}</h3>
            <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-border bg-gradient-to-r from-primary/10 via-background to-accent/10 p-10 text-center space-y-4">
        <h2 className="text-2xl font-bold text-primary">Ready to integrate traditional nutrition?</h2>
        <p className="text-muted-foreground">Start with one spoon a day. Explore our product range to find the blend that matches your goals.</p>
        <Link href="/products" className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90">
          Explore Products
        </Link>
      </div>
    </div>
  )
}
