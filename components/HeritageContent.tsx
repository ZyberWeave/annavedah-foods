'use client'

import { useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import CountUp from 'react-countup'
import {
  Sparkles,
  Leaf,
  Wheat,
  Sun,
  Heart,
  Award,
  ArrowRight,
  Quote,
  Sprout,
  Sigma,
  ShieldCheck,
  Package,
  Scale,
  ChevronDown,
  MapPin,
  Star,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const fadeUp = {
  initial: { opacity: 0, y: 60 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
}

const fadeIn = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true },
  transition: { duration: 0.9 },
}

const pillars = [
  {
    devanagari: 'सात्त्विक',
    roman: 'Sattvic',
    meaning: 'Pure & Balanced',
    body: 'Foods grown without harsh inputs, prepared without shortcuts. The kind of nourishment our grandmothers would recognize.',
    icon: Leaf,
    accent: 'from-emerald-500 to-emerald-700',
    soft: 'bg-emerald-50 border-emerald-200',
    text: 'text-emerald-800',
  },
  {
    devanagari: 'पौष्टिक',
    roman: 'Paushtik',
    meaning: 'Nutrient-Rich',
    body: 'Whole grains, single-ingredient powders, traditional fats — preserved at their nutritional peak so your meals do real work.',
    icon: Wheat,
    accent: 'from-amber-500 to-amber-700',
    soft: 'bg-amber-50 border-amber-200',
    text: 'text-amber-800',
  },
  {
    devanagari: 'परिपूर्ण',
    roman: 'Paripurna',
    meaning: 'Complete & Whole',
    body: 'Nothing added, nothing taken away. We deliver food the way nature finished it — complete, unadulterated, and dignified.',
    icon: Sigma,
    accent: 'from-rose-500 to-rose-700',
    soft: 'bg-rose-50 border-rose-200',
    text: 'text-rose-800',
  },
  {
    devanagari: 'प्राकृतिक',
    roman: 'Prakritik',
    meaning: 'Natural & Pure',
    body: 'Sun-dried, stone-ground, slow-pressed. Methods refined over centuries, not shortcuts engineered for shelf life.',
    icon: Sun,
    accent: 'from-orange-500 to-orange-700',
    soft: 'bg-orange-50 border-orange-200',
    text: 'text-orange-800',
  },
]

const timeline = [
  {
    year: 'पुरानकाल',
    label: 'Ancient times',
    title: 'The wisdom takes root',
    body: 'Long before laboratories, our elders understood food as medicine — a knowledge encoded in the Ayurveda and the daily rituals of the Indian kitchen.',
  },
  {
    year: 'पारंपरिक',
    label: 'Through generations',
    title: 'Recipes pass through hands',
    body: 'Bhakri kneaded by grandmothers. Dals tempered with grandfather\'s spice mix. Quiet expertise transferred not in books, but in the warmth of family kitchens.',
  },
  {
    year: 'आधुनिक',
    label: 'The modern shift',
    title: 'Industrial food took over',
    body: 'Convenience came at the cost of integrity. Polished, bleached, chemically preserved — the food on most shelves no longer resembles what nourished generations.',
  },
  {
    year: '२०२६',
    label: 'Today',
    title: 'Annavedah brings it home',
    body: 'We partner directly with farmers, source heritage varieties, and preserve traditional methods — bringing the kitchen of our ancestors to your modern table.',
  },
]

const journeySteps = [
  { icon: Sprout, title: 'Direct from Farms', body: 'We meet our farmers in person. No middlemen, no anonymous supply chains. Every batch traceable to its soil.' },
  { icon: Sun, title: 'Slow & Traditional', body: 'Sun-drying, stone-grinding, low-temperature processing. Methods that protect aroma, color, and micronutrients.' },
  { icon: ShieldCheck, title: 'Tested for Purity', body: 'Every batch independently checked for purity, potency, and contaminants. FSSAI certified, no compromise.' },
  { icon: Package, title: 'Sealed & Sent', body: 'Food-grade airtight packaging. Sealed within 48 hours of processing so it reaches you the way it left the farm.' },
  { icon: Heart, title: 'On Your Table', body: 'From our soil to your kitchen — closing a loop that\'s been broken for too long. The way good food was always meant to travel.' },
]

const wisdomQuotes = [
  {
    sanskrit: 'अन्नं ब्रह्म इति व्यजानात्',
    translit: 'Annaṁ brahma iti vyajānāt',
    meaning: 'He understood that food itself is the divine.',
    source: 'Taittiriya Upanishad',
  },
  {
    sanskrit: 'सर्वे भवन्तु सुखिनः',
    translit: 'Sarve bhavantu sukhinaḥ',
    meaning: 'May all beings be nourished and happy.',
    source: 'Brihadaranyaka Upanishad',
  },
  {
    sanskrit: 'आहारशुद्धौ सत्त्वशुद्धिः',
    translit: 'Āhāraśuddhau sattvaśuddhiḥ',
    meaning: 'When food is pure, the mind is purified.',
    source: 'Chandogya Upanishad',
  },
]

const sourcing = [
  { region: 'Pune & Satara', kinds: 'Heritage grains · Pulses' },
  { region: 'Nashik Valley', kinds: 'Vegetable powders · Spices' },
  { region: 'Konkan Coast', kinds: 'Honey · Forest harvests' },
  { region: 'Western Ghats', kinds: 'A2 ghee · Dairy' },
  { region: 'Marathwada', kinds: 'Millets · Jowari · Bajra' },
]

export default function HeritageContent() {
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.15])

  return (
    <div className="bg-[#faf6f0] overflow-hidden">
      {/* ─── Hero ─────────────────────────────────────────── */}
      <section ref={heroRef} className="relative h-[100vh] min-h-[680px] overflow-hidden">
        <motion.div style={{ y: heroY, scale: heroScale }} className="absolute inset-0">
          <Image
            src="/Products/Hero_section.jpeg"
            alt="Annavedah heritage"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#2d1b15]/60 via-[#2d1b15]/40 to-[#faf6f0]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#2d1b15]/50 via-transparent to-transparent" />
        </motion.div>

        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative h-full container mx-auto px-4 flex flex-col justify-end pb-32 lg:pb-40"
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="max-w-3xl space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#c9a45c]/20 border border-[#c9a45c]/40 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-[#c9a45c]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#f5e6c8]">Our Heritage</span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-[0.95] tracking-tight">
              Wisdom of <span className="italic font-light">generations,</span>
              <br />
              <span className="text-[#c9a45c]">refined for today.</span>
            </h1>

            <p className="text-2xl md:text-3xl text-[#f5e6c8] font-light tracking-wide" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              अन्न · वेदाह
            </p>

            <p className="text-base md:text-lg text-white/85 max-w-xl leading-relaxed">
              Our name unites two ancient ideas — <span className="text-[#c9a45c] font-semibold">Anna</span>, the food
              that sustains, and <span className="text-[#c9a45c] font-semibold">Veda</span>, the knowledge that guides.
              Together, they describe the only kind of food worth eating.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button asChild className="h-12 px-6 bg-[#c9a45c] hover:bg-[#b8944d] text-[#2d1b15] font-bold rounded-xl">
                <Link href="/products">Explore the Collection</Link>
              </Button>
              <Button asChild variant="outline" className="h-12 px-6 border-2 border-white/40 bg-white/10 backdrop-blur-md text-white hover:bg-white/20 font-bold rounded-xl">
                <Link href="#story">Read Our Story</Link>
              </Button>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/70"
        >
          <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Scroll</span>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </motion.div>
      </section>

      {/* ─── Anna + Vedah Wordmark ───────────────────────────────── */}
      <section className="py-12 md:py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[#faf6f0] to-white" />
        <div className="container mx-auto px-4 relative">
          <motion.div {...fadeUp} className="max-w-4xl mx-auto text-center space-y-6 md:space-y-10">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#c9a45c]">The Name</p>

            <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
              <div className="text-center">
                <p className="text-6xl md:text-8xl font-bold text-[#8b1a1a]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  Anna
                </p>
                <p className="text-2xl md:text-3xl text-[#c9a45c] mt-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  अन्न
                </p>
                <p className="text-sm text-[#6b5347] mt-3 uppercase tracking-widest font-semibold">Food · Sustenance</p>
              </div>

              <div className="hidden md:block w-px h-32 bg-gradient-to-b from-transparent via-[#c9a45c] to-transparent" />
              <div className="md:hidden w-32 h-px bg-gradient-to-r from-transparent via-[#c9a45c] to-transparent" />

              <div className="text-center">
                <p className="text-6xl md:text-8xl font-bold text-[#8b1a1a]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  Vedah
                </p>
                <p className="text-2xl md:text-3xl text-[#c9a45c] mt-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  वेदाह
                </p>
                <p className="text-sm text-[#6b5347] mt-3 uppercase tracking-widest font-semibold">Knowledge · Wisdom</p>
              </div>
            </div>

            <p className="text-xl md:text-2xl text-[#2d1b15] leading-relaxed max-w-2xl mx-auto" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Food that knows what it is. Knowledge that knows what it nourishes. <em className="text-[#8b1a1a]">Annavedah</em>.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─── Stats ─────────────────────────────────────────────── */}
      <section className="py-10 md:py-20 bg-[#2d1b15] text-[#faf6f0] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-[#c9a45c] rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#8b1a1a] rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {[
              { value: 50, suffix: '+', label: 'Partner Farmers', icon: Sprout },
              { value: 5000, suffix: '+', label: 'Families Nourished', icon: Heart },
              { value: 60, suffix: '+', label: 'Heritage Products', icon: Wheat },
              { value: 100, suffix: '%', label: 'Lab-tested Pure', icon: ShieldCheck },
            ].map((stat, i) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="text-center"
                >
                  <Icon className="w-7 h-7 text-[#c9a45c] mx-auto mb-3" />
                  <p className="text-4xl md:text-6xl font-bold text-white tabular-nums">
                    <CountUp end={stat.value} duration={2.5} enableScrollSpy scrollSpyOnce />
                    <span className="text-[#c9a45c]">{stat.suffix}</span>
                  </p>
                  <p className="text-xs md:text-sm text-[#f5e6c8]/70 uppercase tracking-widest font-semibold mt-2">{stat.label}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── Four Pillars ───────────────────────────────────────── */}
      <section className="py-12 md:py-32 relative" id="pillars">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="text-center mb-16 max-w-2xl mx-auto space-y-4">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#c9a45c]">Four Pillars</p>
            <h2 className="text-4xl md:text-6xl font-bold text-[#2d1b15] tracking-tight">
              The principles we <span className="italic text-[#8b1a1a]">refuse</span> to compromise.
            </h2>
            <p className="text-lg text-[#6b5347]">
              Every product passes through the same four tests — drawn from millennia of Vedic understanding of what food should be.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pillars.map((pillar, i) => {
              const Icon = pillar.icon
              return (
                <motion.div
                  key={pillar.roman}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.7, delay: i * 0.1 }}
                  className={`group relative rounded-3xl border-2 ${pillar.soft} p-8 md:p-10 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 overflow-hidden`}
                >
                  <div className={`absolute -top-12 -right-12 w-48 h-48 rounded-full bg-gradient-to-br ${pillar.accent} opacity-10 group-hover:opacity-20 transition-opacity blur-2xl`} />

                  <div className="relative space-y-5">
                    <div className="flex items-start justify-between">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${pillar.accent} flex items-center justify-center shadow-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-5xl md:text-6xl font-bold text-[#2d1b15]/10 tabular-nums">0{i + 1}</span>
                    </div>

                    <div className="space-y-1">
                      <p className="text-3xl md:text-4xl font-bold text-[#2d1b15]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                        {pillar.devanagari}
                      </p>
                      <h3 className={`text-2xl font-bold ${pillar.text}`}>{pillar.roman}</h3>
                      <p className="text-sm text-[#6b5347] uppercase tracking-widest font-semibold">{pillar.meaning}</p>
                    </div>

                    <p className="text-base text-[#2d1b15]/80 leading-relaxed">{pillar.body}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── Story / Timeline ─────────────────────────────────── */}
      <section id="story" className="py-12 md:py-32 bg-gradient-to-b from-white via-[#faf6f0] to-white relative">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="text-center mb-10 md:mb-20 max-w-2xl mx-auto space-y-4">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#c9a45c]">Our Story</p>
            <h2 className="text-4xl md:text-6xl font-bold text-[#2d1b15] tracking-tight">
              A thread that runs through <span className="italic text-[#8b1a1a]">centuries.</span>
            </h2>
          </motion.div>

          <div className="relative max-w-4xl mx-auto">
            {/* Timeline spine */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#c9a45c]/0 via-[#c9a45c]/60 to-[#c9a45c]/0" />

            {timeline.map((event, i) => (
              <motion.div
                key={event.title}
                initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.7 }}
                className={`relative grid md:grid-cols-2 gap-4 md:gap-8 mb-8 md:mb-16 last:mb-0 ${i % 2 === 1 ? 'md:[&>div:first-child]:order-2' : ''}`}
              >
                {/* Spacer */}
                <div className="hidden md:block" />

                <div className={`pl-20 md:pl-0 ${i % 2 === 0 ? 'md:pl-12' : 'md:pr-12 md:text-right'}`}>
                  <div className={`absolute left-8 md:left-1/2 top-2 -translate-x-1/2 w-14 h-14 rounded-full bg-white border-4 border-[#c9a45c] flex items-center justify-center shadow-lg z-10`}>
                    <span className="text-xs font-bold text-[#8b1a1a]">{i + 1}</span>
                  </div>

                  <div className="rounded-2xl bg-white border-2 border-[#e8ddd0] p-4 md:p-7 hover:border-[#c9a45c] hover:shadow-xl transition-all">
                    <p className="text-2xl font-bold text-[#c9a45c] mb-1" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                      {event.year}
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#6b5347] mb-3">{event.label}</p>
                    <h3 className="text-xl md:text-2xl font-bold text-[#2d1b15] mb-2">{event.title}</h3>
                    <p className="text-sm text-[#6b5347] leading-relaxed">{event.body}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Founder Quote ─────────────────────────────────── */}
      <section className="py-12 md:py-32 bg-[#8b1a1a] text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#c9a45c]/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#f5e6c8]/10 rounded-full blur-[100px]" />
        </div>

        <div className="container mx-auto px-4 relative">
          <motion.div {...fadeUp} className="max-w-4xl mx-auto text-center space-y-8">
            <Quote className="w-12 h-12 text-[#c9a45c] mx-auto opacity-60" strokeWidth={1.5} />

            <blockquote className="text-2xl md:text-4xl lg:text-5xl font-light text-[#f5e6c8] leading-tight" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              <em>
                "We didn't start Annavedah to disrupt anything. We started it because we missed the food we grew up with —
                food that <span className="text-white not-italic font-semibold">tasted like soil and sun and someone who cared.</span>"
              </em>
            </blockquote>

            <div className="pt-6 flex flex-col items-center gap-2">
              <div className="w-16 h-px bg-[#c9a45c]" />
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-[#c9a45c]">Founder, Annavedah Foods</p>
              <p className="text-xs text-[#f5e6c8]/70">Maharashtra · 2026</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Farm-to-Home Journey ─────────────────────────────────── */}
      <section className="py-12 md:py-32 relative">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="text-center mb-8 md:mb-16 max-w-2xl mx-auto space-y-3 md:space-y-4">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#c9a45c]">From Farm to Home</p>
            <h2 className="text-4xl md:text-6xl font-bold text-[#2d1b15] tracking-tight">
              Every step, <span className="italic text-[#8b1a1a]">deliberate.</span>
            </h2>
            <p className="text-lg text-[#6b5347]">
              Five steps stand between our farms and your table. None of them are shortcuts.
            </p>
          </motion.div>

          <div className="relative">
            <div className="hidden lg:block absolute top-12 left-[10%] right-[10%] h-0.5 border-t-2 border-dashed border-[#c9a45c]/30" />

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
              {journeySteps.map((step, i) => {
                const Icon = step.icon
                return (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: i * 0.1 }}
                    className="relative text-center group"
                  >
                    <div className="relative inline-flex w-16 h-16 md:w-24 md:h-24 mb-3 md:mb-5">
                      <div className="absolute inset-0 rounded-full bg-[#c9a45c]/10 group-hover:scale-110 transition-transform duration-500" />
                      <div className="relative w-16 h-16 md:w-24 md:h-24 rounded-full bg-white border-2 border-[#c9a45c] flex items-center justify-center shadow-lg group-hover:shadow-2xl group-hover:-translate-y-1 transition-all duration-500">
                        <Icon className="w-6 h-6 md:w-9 md:h-9 text-[#8b1a1a]" />
                      </div>
                      <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 w-5 h-5 md:w-7 md:h-7 rounded-full bg-[#8b1a1a] text-white text-[10px] md:text-xs font-bold flex items-center justify-center shadow-md">
                        {i + 1}
                      </div>
                    </div>
                    <h3 className="text-sm md:text-lg font-bold text-[#2d1b15] mb-1 md:mb-2">{step.title}</h3>
                    <p className="text-xs md:text-sm text-[#6b5347] leading-relaxed">{step.body}</p>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Sourcing Map ─────────────────────────────────── */}
      <section className="py-12 md:py-32 bg-gradient-to-br from-[#faf6f0] via-white to-[#faf6f0] relative">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div {...fadeUp} className="space-y-6">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#c9a45c]">Where it comes from</p>
              <h2 className="text-4xl md:text-5xl font-bold text-[#2d1b15] tracking-tight leading-tight">
                Rooted in <span className="italic text-[#8b1a1a]">Maharashtra's</span> finest soils.
              </h2>
              <p className="text-lg text-[#6b5347] leading-relaxed">
                We don't source from anonymous warehouses. Every ingredient comes from a region we've visited, farmers we've broken bread with, soils we've stood on.
              </p>

              <ul className="space-y-3 pt-4">
                {sourcing.map((item, i) => (
                  <motion.li
                    key={item.region}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="flex items-start gap-4 p-4 rounded-2xl bg-white border-2 border-[#e8ddd0] hover:border-[#c9a45c] transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#c9a45c]/15 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4 text-[#8b1a1a]" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-[#2d1b15]">{item.region}</p>
                      <p className="text-sm text-[#6b5347]">{item.kinds}</p>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div {...fadeIn} className="relative">
              <div className="relative aspect-square rounded-3xl overflow-hidden border-2 border-[#e8ddd0] shadow-2xl bg-white">
                <Image
                  src="/Products/Hero_section.jpeg"
                  alt="Maharashtra's farms"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2d1b15]/70 via-transparent to-transparent" />

                {/* Floating stat card */}
                <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md rounded-2xl p-5 shadow-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <Award className="w-5 h-5 text-[#c9a45c]" />
                    <p className="text-xs font-bold uppercase tracking-widest text-[#8b1a1a]">Direct Sourcing</p>
                  </div>
                  <p className="text-2xl font-bold text-[#2d1b15]">Zero middlemen</p>
                  <p className="text-xs text-[#6b5347]">Fair prices for farmers · Better quality for you</p>
                </div>
              </div>
              <div className="absolute -z-10 -bottom-6 -right-6 w-full h-full rounded-3xl border-2 border-[#c9a45c]/30" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Wisdom Quotes ─────────────────────────────────── */}
      <section className="py-12 md:py-32 bg-[#faf6f0] relative">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="text-center mb-16 max-w-2xl mx-auto space-y-4">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#c9a45c]">Ancient Wisdom</p>
            <h2 className="text-4xl md:text-5xl font-bold text-[#2d1b15] tracking-tight">
              The texts that <span className="italic text-[#8b1a1a]">guide us.</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {wisdomQuotes.map((quote, i) => (
              <motion.div
                key={quote.translit}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="group relative rounded-3xl bg-white border-2 border-[#e8ddd0] p-8 hover:border-[#c9a45c] hover:shadow-2xl transition-all"
              >
                <Quote className="w-8 h-8 text-[#c9a45c] mb-4 opacity-50" strokeWidth={1.5} />
                <p className="text-3xl font-bold text-[#8b1a1a] mb-2 leading-tight" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  {quote.sanskrit}
                </p>
                <p className="text-sm italic text-[#6b5347] mb-4">— {quote.translit}</p>
                <p className="text-base text-[#2d1b15] leading-relaxed font-medium" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  "{quote.meaning}"
                </p>
                <p className="text-[10px] uppercase tracking-widest font-bold text-[#c9a45c] mt-5 pt-4 border-t border-[#e8ddd0]">
                  {quote.source}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Promise ─────────────────────────────────── */}
      <section className="py-12 md:py-32 relative">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 rounded-3xl bg-gradient-to-br from-[#2d1b15] via-[#3d2620] to-[#2d1b15] p-10 md:p-16 text-white relative overflow-hidden">
              <div className="absolute inset-0 opacity-30">
                <div className="absolute -top-20 -left-20 w-80 h-80 bg-[#c9a45c]/30 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-[#8b1a1a]/30 rounded-full blur-3xl" />
              </div>

              {[
                { icon: Leaf, title: 'Source', body: 'Farm-sourced with no middlemen. Direct partnerships with growers who share our standards on soil health and clean inputs.' },
                { icon: Scale, title: 'Process', body: 'Low-temperature dehydration, stone-grinding, sun-drying. Methods that preserve micronutrients while protecting the integrity of every grain.' },
                { icon: ShieldCheck, title: 'Test', body: 'Every batch independently tested for purity, potency, and consistency. FSSAI certified. Nothing reaches you that hasn\'t earned it.' },
              ].map((p, i) => {
                const Icon = p.icon
                return (
                  <motion.div
                    key={p.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: i * 0.15 }}
                    className="relative space-y-4"
                  >
                    <div className="w-12 h-12 rounded-xl bg-[#c9a45c]/20 border border-[#c9a45c]/40 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-[#c9a45c]" />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#c9a45c]">0{i + 1} · {p.title}</p>
                    <p className="text-sm text-[#f5e6c8]/90 leading-relaxed">{p.body}</p>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Final CTA ─────────────────────────────────── */}
      <section className="py-12 md:py-32 bg-gradient-to-b from-[#faf6f0] to-white relative">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="max-w-3xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-[#c9a45c]/15 border border-[#c9a45c]/30">
              <Star className="w-3.5 h-3.5 text-[#c9a45c] fill-[#c9a45c]" />
              <Star className="w-3.5 h-3.5 text-[#c9a45c] fill-[#c9a45c]" />
              <Star className="w-3.5 h-3.5 text-[#c9a45c] fill-[#c9a45c]" />
              <Star className="w-3.5 h-3.5 text-[#c9a45c] fill-[#c9a45c]" />
              <Star className="w-3.5 h-3.5 text-[#c9a45c] fill-[#c9a45c]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#8b1a1a] ml-2">Trusted by 5,000+ families</span>
            </div>

            <h2 className="text-4xl md:text-6xl font-bold text-[#2d1b15] tracking-tight leading-tight">
              Bring the kitchen of <span className="italic text-[#8b1a1a]">your ancestors</span> home.
            </h2>

            <p className="text-lg md:text-xl text-[#6b5347] leading-relaxed">
              Every product, every pack, every batch — carrying centuries of wisdom into your everyday meals.
            </p>

            <div className="flex flex-wrap justify-center gap-3 pt-4">
              <Button asChild className="h-14 px-8 bg-[#8b1a1a] hover:bg-[#6d1414] text-white font-bold rounded-xl text-base shadow-xl shadow-[#8b1a1a]/30">
                <Link href="/products">
                  Shop the Collection
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-14 px-8 border-2 border-[#c9a45c] text-[#8b1a1a] hover:bg-[#c9a45c]/10 font-bold rounded-xl text-base">
                <Link href="/contact">Talk to Us</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
