'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart, PawPrint, ShieldCheck, Sparkles, HandHeart, Dog, Cat, Bird, Rabbit } from 'lucide-react'
import { motion, useScroll, useTransform, useInView, type Variants } from 'framer-motion'
import { useRef } from 'react'

const fadeInUp: Variants = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
}

const fadeInLeft: Variants = {
  initial: { opacity: 0, x: -60 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.8, ease: 'easeOut' } },
}

const fadeInRight: Variants = {
  initial: { opacity: 0, x: 60 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.8, ease: 'easeOut' } },
}

const staggerContainer: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
}

const staggerItem: Variants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.5, type: 'spring', stiffness: 200, damping: 15 } },
}

function AnimatedSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      initial="initial"
      animate={isInView ? 'animate' : 'initial'}
      variants={staggerContainer}
      className={className}
    >
      {children}
    </motion.div>
  )
}

const timelineSteps = [
  { icon: Sparkles, title: 'You Choose Annavedah', desc: 'Every purchase you make carries a purpose beyond your kitchen.' },
  { icon: Heart, title: 'A Portion Goes to Care', desc: 'A part of every sale is set aside for animal welfare contributions.' },
  { icon: HandHeart, title: 'Shelters Receive Support', desc: 'Pet care centres and shelters receive food, medical aid, and supplies.' },
  { icon: PawPrint, title: 'Lives Are Touched', desc: 'Rescued animals get the nourishment and attention they deserve.' },
]

const animalIcons = [
  { icon: Dog, label: 'Dogs' },
  { icon: Cat, label: 'Cats' },
  { icon: Bird, label: 'Birds' },
  { icon: Rabbit, label: 'Rabbits' },
]

export default function DonationCommitmentPage() {
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  return (
    <div className="bg-[#faf6f0] min-h-screen pb-0 pt-0">

      {/* ══════ HERO ══════ */}
      <section ref={heroRef} className="relative h-[70vh] md:h-[80vh] overflow-hidden">
        <motion.div className="absolute inset-0" style={{ y: heroY }}>
          <Image src="/commitment-hero.png" alt="Annavedah — compassion beyond commerce" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-b from-[#2d1b15]/60 via-[#2d1b15]/40 to-[#faf6f0]" />
        </motion.div>

        <motion.div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4" style={{ opacity: heroOpacity }}>
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#c9a45c]/30 backdrop-blur-md border border-[#c9a45c]/40 mb-6"
            initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, type: 'spring', stiffness: 150 }}
          >
            <PawPrint className="w-10 h-10 text-white" />
          </motion.div>

          <motion.h1
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight"
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Our Donation{' '}
            <span className="text-[#c9a45c]">Commitment</span>
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-white/80 max-w-2xl font-light leading-relaxed"
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Because compassion should never be limited.
          </motion.p>

          <motion.div
            className="mt-10"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center pt-2">
              <div className="w-1.5 h-3 bg-[#c9a45c] rounded-full" />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ══════ PHILOSOPHY ══════ */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <AnimatedSection className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div className="space-y-8" variants={fadeInLeft}>
              <motion.span variants={scaleIn} className="inline-block px-4 py-1.5 bg-[#8b1a1a]/10 text-[#8b1a1a] rounded-full text-sm font-semibold uppercase tracking-wider">
                The Core Philosophy
              </motion.span>
              <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-bold text-[#2d1b15] leading-tight">
                Every life deserves{' '}
                <span className="text-[#8b1a1a]">food, safety,</span> and attention
              </motion.h2>
              <motion.div variants={fadeInUp} className="space-y-5 text-lg text-[#6b5347] leading-relaxed">
                <p>Humans, despite struggles, have the ability to work, earn, and search for ways to meet their needs. But animals live differently.</p>
                <p>A pet, a rescued animal, or an abandoned life waiting in a shelter cannot ask for food, cannot earn, and cannot explain hunger. Their survival depends entirely on compassion.</p>
              </motion.div>
              <motion.blockquote
                variants={fadeInUp}
                className="border-l-4 border-[#c9a45c] pl-6 py-4 bg-gradient-to-r from-[#c9a45c]/10 to-transparent rounded-r-2xl"
              >
                <p className="text-xl font-semibold text-[#2d1b15] italic leading-relaxed">
                  &ldquo;If we are able to serve food to people, we should also remember those who cannot ask for it themselves.&rdquo;
                </p>
                <p className="text-sm text-[#8b1a1a] font-bold mt-3 uppercase tracking-wider">— Founder, Annavedah Foods</p>
              </motion.blockquote>
            </motion.div>

            <motion.div variants={fadeInRight} className="relative">
              <motion.div
                className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border-4 border-[#c9a45c]/20"
                whileHover={{ scale: 1.02, rotate: 1 }}
                transition={{ duration: 0.4 }}
              >
                <Image src="/commitment-care.png" alt="Caring for rescued animals" fill className="object-cover" />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 4 }}
                />
              </motion.div>
              <motion.div
                className="absolute -bottom-6 -left-6 w-40 h-40 border-4 border-[#c9a45c]/20 rounded-3xl -z-10"
                animate={{ rotate: [0, 5, 0] }}
                transition={{ duration: 6, repeat: Infinity }}
              />
              <motion.div
                className="absolute -top-6 -right-6 w-24 h-24 bg-[#8b1a1a]/10 rounded-full -z-10"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
            </motion.div>
          </AnimatedSection>
        </div>
      </section>

      {/* ══════ ANIMALS WE SUPPORT ══════ */}
      <section className="py-16 bg-gradient-to-r from-[#8b1a1a] to-[#6d1414] relative overflow-hidden">
        <motion.div
          className="absolute inset-0 opacity-10"
          animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
          transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse' }}
          style={{ backgroundImage: 'radial-gradient(circle, #c9a45c 1px, transparent 1px)', backgroundSize: '50px 50px' }}
        />
        <div className="container mx-auto px-4 relative z-10">
          <AnimatedSection className="text-center">
            <motion.h3 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-white mb-4">
              Every Life <span className="text-[#c9a45c]">Matters</span>
            </motion.h3>
            <motion.p variants={fadeInUp} className="text-white/70 text-lg mb-12 max-w-xl mx-auto">
              Whether it is a dog, cat, bird, rabbit, or any other animal receiving care in shelters — every life deserves compassion.
            </motion.p>
            <motion.div variants={staggerContainer} className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {animalIcons.map((a, i) => (
                <motion.div
                  key={a.label}
                  variants={scaleIn}
                  whileHover={{ scale: 1.1, y: -8 }}
                  className="flex flex-col items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
                >
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: i * 0.4 }}
                  >
                    <a.icon className="w-10 h-10 text-[#c9a45c]" />
                  </motion.div>
                  <span className="text-white font-semibold">{a.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </AnimatedSection>
        </div>
      </section>

      {/* ══════ HOW IT WORKS TIMELINE ══════ */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-16">
            <motion.span variants={scaleIn} className="inline-block px-4 py-1.5 bg-[#8b1a1a]/10 text-[#8b1a1a] rounded-full text-sm font-semibold uppercase tracking-wider mb-4">
              How It Works
            </motion.span>
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-bold text-[#2d1b15]">
              From Your <span className="text-[#8b1a1a]">Table</span> to Their <span className="text-[#c9a45c]">Bowl</span>
            </motion.h2>
          </AnimatedSection>

          <AnimatedSection className="relative max-w-4xl mx-auto">
            {/* Vertical line */}
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#c9a45c] via-[#8b1a1a] to-[#c9a45c] md:-translate-x-0.5 hidden md:block" />
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#c9a45c] via-[#8b1a1a] to-[#c9a45c] md:hidden" />

            <div className="space-y-12 md:space-y-16">
              {timelineSteps.map((step, i) => (
                <motion.div
                  key={step.title}
                  variants={i % 2 === 0 ? fadeInLeft : fadeInRight}
                  className={`relative flex items-start gap-6 md:gap-0 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                >
                  {/* Mobile icon */}
                  <div className="flex-shrink-0 md:hidden z-10">
                    <motion.div
                      className="w-12 h-12 rounded-full bg-gradient-to-br from-[#8b1a1a] to-[#6d1414] flex items-center justify-center shadow-lg border-4 border-[#faf6f0]"
                      whileHover={{ scale: 1.2 }}
                    >
                      <step.icon className="w-5 h-5 text-[#c9a45c]" />
                    </motion.div>
                  </div>

                  {/* Content */}
                  <div className={`md:w-[45%] ${i % 2 === 0 ? 'md:text-right md:pr-12' : 'md:text-left md:pl-12'}`}>
                    <motion.div
                      className="bg-white rounded-2xl p-6 shadow-lg border border-[#e8ddd0] hover:border-[#c9a45c] transition-colors duration-300"
                      whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                    >
                      <span className="text-xs font-bold text-[#c9a45c] uppercase tracking-widest">Step {i + 1}</span>
                      <h4 className="text-xl font-bold text-[#2d1b15] mt-1 mb-2">{step.title}</h4>
                      <p className="text-[#6b5347] leading-relaxed">{step.desc}</p>
                    </motion.div>
                  </div>

                  {/* Desktop center icon */}
                  <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 z-10">
                    <motion.div
                      className="w-14 h-14 rounded-full bg-gradient-to-br from-[#8b1a1a] to-[#6d1414] flex items-center justify-center shadow-xl border-4 border-[#faf6f0]"
                      whileHover={{ scale: 1.2, rotate: 10 }}
                    >
                      <step.icon className="w-6 h-6 text-[#c9a45c]" />
                    </motion.div>
                  </div>

                  {/* Spacer for the other side */}
                  <div className="hidden md:block md:w-[45%]" />
                </motion.div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ══════ FOOD WITH RESPONSIBILITY ══════ */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <AnimatedSection className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div variants={fadeInLeft} className="relative order-2 lg:order-1">
              <motion.div
                className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.4 }}
              >
                <Image src="/commitment-connection.png" alt="Food and compassion connection" fill className="object-cover" />
              </motion.div>
            </motion.div>

            <motion.div className="space-y-8 order-1 lg:order-2" variants={fadeInRight}>
              <motion.span variants={scaleIn} className="inline-block px-4 py-1.5 bg-[#c9a45c]/15 text-[#8b1a1a] rounded-full text-sm font-semibold uppercase tracking-wider">
                Food With Responsibility
              </motion.span>
              <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-[#2d1b15] leading-tight">
                When food reaches one home, kindness can reach <span className="text-[#8b1a1a]">another life</span>
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-lg text-[#6b5347] leading-relaxed">
                The same trust customers place in our products allows us to extend support where it is needed most.
              </motion.p>
              <motion.div variants={staggerContainer} className="space-y-4">
                <motion.p variants={fadeInUp} className="font-semibold text-[#8b1a1a]">
                  Each purchase helps us participate in something meaningful:
                </motion.p>
                {[
                  'Supporting food needs for sheltered animals',
                  'Contributing to pet care and welfare centres',
                  'Encouraging kindness beyond commerce',
                  'Turning everyday purchases into small acts of care',
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    variants={staggerItem}
                    className="flex items-start gap-4 bg-[#faf6f0] p-4 rounded-xl border border-[#e8ddd0] hover:border-[#c9a45c] transition-colors"
                    whileHover={{ x: 6 }}
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#c9a45c]/20 flex items-center justify-center mt-0.5">
                      <ShieldCheck className="w-4 h-4 text-[#8b1a1a]" />
                    </div>
                    <span className="text-[#6b5347] font-medium">{item}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>

      {/* ══════ FOUNDER'S BELIEF ══════ */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#f0e8dc] to-[#faf6f0]" />
        <motion.div
          className="absolute top-10 right-10 w-72 h-72 bg-[#c9a45c]/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <div className="container mx-auto px-4 relative z-10">
          <AnimatedSection className="max-w-3xl mx-auto text-center space-y-8">
            <motion.div variants={scaleIn}>
              <Heart className="w-12 h-12 text-[#8b1a1a] mx-auto" />
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-bold text-[#2d1b15]">
              Our Founder&apos;s <span className="text-[#8b1a1a]">Belief</span>
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl md:text-2xl text-[#6b5347] leading-relaxed italic">
              Animals love without conditions. They depend without words. And often, they wait for care that only human kindness can provide.
            </motion.p>
            <motion.div
              variants={fadeInUp}
              className="bg-white rounded-3xl p-8 md:p-10 shadow-xl border border-[#e8ddd0]"
            >
              <p className="text-xl font-semibold text-[#8b1a1a] leading-relaxed">
                For us, giving back to pet care centres is not a campaign. It is a responsibility we genuinely want to carry forward.
              </p>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>



      {/* ══════ CTA ══════ */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-[#8b1a1a] to-[#6d1414] relative overflow-hidden">
        <motion.div
          className="absolute inset-0 opacity-5"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}
        />
        <motion.div
          className="absolute top-20 left-20 w-60 h-60 bg-[#c9a45c]/15 rounded-full blur-3xl"
          animate={{ scale: [1, 1.4, 1] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <div className="container mx-auto px-4 relative z-10">
          <AnimatedSection className="max-w-3xl mx-auto text-center space-y-8">
            <motion.div variants={scaleIn}>
              <PawPrint className="w-12 h-12 text-[#c9a45c] mx-auto" />
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-bold text-white leading-tight">
              Every Purchase Carries <span className="text-[#c9a45c]">Care</span>
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg md:text-xl text-white/80 leading-relaxed max-w-2xl mx-auto">
              When you choose Annavedah Foods, you are choosing more than food for your family.
              You are becoming part of a small but meaningful effort to support animals across India.
            </motion.p>
            <motion.p variants={fadeInUp} className="text-xl font-bold text-[#c9a45c]">
              Together, ordinary purchases can create extraordinary care.
            </motion.p>
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 bg-[#c9a45c] hover:bg-[#b8943f] text-[#2d1b15] px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Shop Products
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 border-2 border-white/30 hover:border-white/60 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all hover:-translate-y-0.5"
              >
                Get In Touch
              </Link>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  )
}
