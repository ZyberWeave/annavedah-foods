'use client'

import { useState, useEffect, useRef, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { banners, testimonials, categories } from '@/lib/content'
import { Search, Leaf, Heart, Star, ShoppingCart, Package, Users, Shield, Check, Sparkles, ChevronDown } from 'lucide-react'
import { useCart } from '@/components/cart-context'
import { useProductsData } from '@/components/products-context'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import AutoScroll from 'embla-carousel-auto-scroll'
import { motion, useAnimation, useInView, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion'
import CountUp from 'react-countup'
import InstagramFeed from '@/components/InstagramFeed'
import TrustBadges from '@/components/TrustBadges'
import { toast } from 'sonner'

// Enhanced Animation Variants
const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

const fadeInDown = {
  initial: { opacity: 0, y: -40 },
  animate: { opacity: 1, y: 0 }
}

const fadeInLeft = {
  initial: { opacity: 0, x: -60 },
  animate: { opacity: 1, x: 0 }
}

const fadeInRight = {
  initial: { opacity: 0, x: 60 },
  animate: { opacity: 1, x: 0 }
}

const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
}

const staggerItem = {
  initial: { opacity: 0, y: 30 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.6, 
      ease: "easeOut" as const
    }
  }
}

const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      duration: 0.5, 
      type: "spring" as const,
      stiffness: 200,
      damping: 15
    }
  }
}

const rotateIn = {
  initial: { opacity: 0, rotate: -10, scale: 0.9 },
  animate: { 
    opacity: 1, 
    rotate: 0, 
    scale: 1,
    transition: { duration: 0.7, ease: "easeOut" as const }
  }
}

const slideInFromBottom = {
  initial: { opacity: 0, y: 100 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.8, 
      ease: "easeOut" as const
    }
  }
}

// Floating animation for decorative elements
const floatingAnimation = {
  animate: {
    y: [0, -15, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut" as const
    }
  }
}

const pulseAnimation = {
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

// Counter component with intersection observer
function AnimatedCounter({ 
  end, 
  suffix = '', 
  prefix = '',
  duration = 2.5,
  decimals = 0
}: { 
  end: number | string
  suffix?: string
  prefix?: string
  duration?: number
  decimals?: number
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [hasStarted, setHasStarted] = useState(false)
  
  useEffect(() => {
    if (isInView && !hasStarted) {
      setHasStarted(true)
    }
  }, [isInView, hasStarted])
  
  // Handle non-numeric values like "Zero"
  if (typeof end === 'string' && isNaN(Number(end.replace(/[+%]/g, '')))) {
    return (
      <motion.span
        ref={ref}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      >
        {end}
      </motion.span>
    )
  }
  
  const numericEnd = typeof end === 'string' ? parseFloat(end.replace(/[+%]/g, '')) : end
  const extractedSuffix = typeof end === 'string' ? end.replace(/[0-9.]/g, '') : suffix
  
  return (
    <span ref={ref}>
      {hasStarted && (
        <CountUp
          start={0}
          end={numericEnd}
          duration={duration}
          decimals={decimals}
          prefix={prefix}
          suffix={extractedSuffix || suffix}
          useEasing={true}
          easingFn={(t, b, c, d) => {
            // Custom easing: ease out expo
            return c * (-Math.pow(2, -10 * t / d) + 1) + b
          }}
        />
      )}
    </span>
  )
}

// Parallax image component
function ParallaxImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })
  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"])
  
  return (
    <motion.div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.div style={{ y }} className="absolute inset-0">
        <Image src={src} alt={alt} fill className="object-cover" />
      </motion.div>
    </motion.div>
  )
}

// Magnetic button component for premium feel
function MagneticButton({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  const ref = useRef<HTMLButtonElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  
  const springConfig = { stiffness: 150, damping: 15 }
  const springX = useSpring(x, springConfig)
  const springY = useSpring(y, springConfig)
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    x.set((e.clientX - centerX) * 0.15)
    y.set((e.clientY - centerY) * 0.15)
  }
  
  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }
  
  return (
    <motion.button
      ref={ref}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={className}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.button>
  )
}

// Animated text reveal component
function AnimatedText({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  return (
    <motion.span
      className={className}
      initial="initial"
      animate="animate"
      variants={{
        initial: {},
        animate: {
          transition: {
            staggerChildren: 0.03,
            delayChildren: delay
          }
        }
      }}
    >
      {text.split('').map((char, index) => (
        <motion.span
          key={index}
          variants={{
            initial: { opacity: 0, y: 20 },
            animate: { 
              opacity: 1, 
              y: 0,
              transition: { duration: 0.4, ease: "easeOut" }
            }
          }}
          className="inline-block"
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </motion.span>
  )
}

function PLPProductCard({ product, index, add }: any) {
  const [selectedPack, setSelectedPack] = useState(product.packPrices[0])
  const currentPrice = selectedPack ? selectedPack.price : product.price

  return (
    <motion.div
      className="group bg-white rounded-2xl md:rounded-3xl border-2 border-[#e8ddd0] overflow-hidden hover:border-[#c9a45c] transition-colors duration-300 flex flex-col h-full"
      variants={staggerItem}
      layout
      whileHover={{ 
        y: -10, 
        boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
        transition: { duration: 0.3, ease: "easeOut" }
      }}
    >
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-[url('/product-bg.webp')] bg-cover bg-center border-b border-[#e8ddd0] group-hover:border-[#c9a45c] transition-colors duration-300">
        <Link href={`/products/${product.slug}`} className="block h-full w-full">
          <motion.div
            className="absolute inset-0"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 50vw, 33vw"
              className="object-contain p-3 md:p-6 drop-shadow-xl transition-all duration-500 group-hover:drop-shadow-2xl"
            />
          </motion.div>
        </Link>
        {product.badge && (
          <motion.div 
            className="absolute top-2 left-2 z-10 md:top-4 md:left-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 + 0.3 }}
          >
            <motion.span 
              className={`px-2 py-1 md:px-4 md:py-1.5 rounded-full text-[9px] md:text-xs font-bold uppercase tracking-wide inline-block ${
                product.badge === 'Bestseller' ? 'bg-[#c9a45c] text-[#2d1b15]' :
                product.badge === 'New' ? 'bg-[#8b1a1a] text-white' :
                'bg-[#2d1b15] text-white'
              }`}
              animate={product.badge === 'New' ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {product.badge}
            </motion.span>
          </motion.div>
        )}
      </div>

      {/* Product Info */}
      <motion.div 
        className="p-3 md:p-6 space-y-2 md:space-y-4 flex-1 flex flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: index * 0.05 }}
      >
        <div>
          <motion.span 
            className="block truncate text-[10px] md:text-xs text-[#c9a45c] font-medium uppercase tracking-wide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {product.category}
          </motion.span>
          <Link href={`/products/${product.slug}`} className="block group-hover:text-[#8b1a1a] transition-colors">
            <h3 className="text-sm sm:text-base md:text-2xl leading-tight font-bold text-[#2d1b15] group-hover:text-[#8b1a1a] line-clamp-2">{product.name}</h3>
          </Link>
          {product.nameHindi !== product.name && <p className="text-xs md:text-sm text-[#6b5347] line-clamp-1">{product.nameHindi}</p>}
        </div>
        
        <p className="hidden md:block text-[#6b5347] text-sm leading-relaxed flex-1">{product.description}</p>

        {product.packPrices.length > 0 && (
          <div className="flex flex-wrap gap-1 md:gap-2 pt-1 md:pt-2">
            {product.packPrices.map((pack: any) => (
              <button
                key={`${product.slug}-${pack.size}`}
                onClick={() => setSelectedPack(pack)}
                onPointerDown={(event) => event.stopPropagation()}
                className={`relative px-2 py-1 md:px-3 md:py-1.5 border-2 rounded-lg md:rounded-xl text-[10px] md:text-xs font-bold transition-all duration-300 ${
                  selectedPack?.size === pack.size 
                    ? 'border-[#8b1a1a] bg-[#8b1a1a]/5 text-[#8b1a1a] shadow-inner ring-1 ring-[#8b1a1a]' 
                    : 'border-[#e8ddd0] bg-white text-[#6b5347] hover:border-[#c9a45c] hover:shadow-sm'
                }`}
              >
                {pack.size}
                {selectedPack?.size === pack.size && (
                  <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#c9a45c] rounded-full border-2 border-white flex items-center justify-center z-10">
                    <Check className="w-2.5 h-2.5 text-white" strokeWidth={4} />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        <motion.div
          className="flex items-center justify-between pt-1 md:pt-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {currentPrice > 0 ? (
            <div className="flex items-baseline gap-2">
              <span className="text-xl md:text-3xl font-bold text-[#8b1a1a]">₹{currentPrice}</span>
            </div>
          ) : (
            <span className="text-[11px] md:text-sm font-semibold text-amber-700 bg-amber-100 px-2 md:px-3 py-1 rounded-full">
              Price on request
            </span>
          )}
        </motion.div>
        
        <div className="flex gap-1 md:gap-2 pt-3 md:pt-4 mt-auto border-t border-[#e8ddd0]/50">
          <Button asChild variant="outline" className="flex-1 h-9 md:h-12 px-2 border-2 border-[#c9a45c] text-[#8b1a1a] hover:bg-[#c9a45c]/10 font-semibold rounded-lg md:rounded-xl transition-all text-xs md:text-sm">
            <Link href={`/products/${product.slug}`} onPointerDown={(event) => event.stopPropagation()}>Details</Link>
          </Button>
          <Button 
            className="flex-1 h-9 md:h-12 px-2 bg-[#8b1a1a] hover:bg-[#6d1414] text-white font-semibold rounded-lg md:rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 text-xs md:text-sm"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation()
              add(product.id, selectedPack)
            }} 
            disabled={currentPrice <= 0}
          >
            <ShoppingCart className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1 md:mr-2" />
            {currentPrice > 0 ? 'Add' : 'Enquire'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function HomePage() {
  const router = useRouter()
  const { products } = useProductsData()
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentBanner, setCurrentBanner] = useState(0)
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterMessage, setNewsletterMessage] = useState('')
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false)
  const { add } = useCart()
  
  // Scroll progress for hero parallax
  const { scrollY } = useScroll()
  const heroScale = useTransform(scrollY, [0, 500], [1, 1.1])

  // Auto-rotate banners with smooth animation
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const nextBanner = () => setCurrentBanner((prev) => (prev + 1) % banners.length)
  const prevBanner = () => setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length)

  const handleNewsletterSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const email = String(formData.get('newsletterEmail') || newsletterEmail).trim().toLowerCase()

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setNewsletterSubmitted(false)
      setNewsletterMessage('Enter a valid email address.')
      return
    }

    try {
      const raw = localStorage.getItem('annavedah_newsletter_emails')
      const existing = raw ? JSON.parse(raw) : []
      const emails = Array.isArray(existing) ? existing : []
      if (!emails.includes(email)) {
        localStorage.setItem('annavedah_newsletter_emails', JSON.stringify([...emails, email]))
      }
    } catch {}

    setNewsletterSubmitted(true)
    setNewsletterMessage('You are subscribed. Watch your inbox for recipes and offers.')
    setNewsletterEmail('')
    toast.success('Subscribed to the Wellness Community.')
  }

  return (
    <div className="min-h-screen bg-[#faf6f0] text-[#2d1b15] site-page-gap-home">
      

      {/* Hero Section - Banner Slideshow */}
      <section className="relative overflow-hidden">
        <div className="relative w-full">
          {banners.map((b, i) => (
            <Link
              key={b.category}
              href={`/products?category=${encodeURIComponent(b.category)}`}
              aria-label={`Shop ${b.category}`}
              className={`block transition-opacity duration-700 ${
                i === currentBanner ? 'opacity-100 relative' : 'opacity-0 absolute inset-0 pointer-events-none'
              }`}
            >
              <Image
                src={b.desktop}
                alt={`${b.category} — Annavedah Foods`}
                width={1920}
                height={800}
                className="w-full h-auto"
                priority={i === 0}
              />
            </Link>
          ))}

          {/* Dots */}
          <div className="absolute bottom-3 md:bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentBanner(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-2 rounded-full transition-all ${
                  i === currentBanner ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>

          {/* Prev / Next */}
          <button
            onClick={prevBanner}
            aria-label="Previous slide"
            className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur z-10"
          >
            ‹
          </button>
          <button
            onClick={nextBanner}
            aria-label="Next slide"
            className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur z-10"
          >
            ›
          </button>
        </div>
      </section>

      {/* Stats Section with CountUp */}
      <motion.section
        className="py-6 md:py-16 bg-gradient-to-r from-[#8b1a1a] to-[#6d1414] relative overflow-hidden"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
      >
        {/* Animated background pattern */}
        <motion.div 
          className="absolute inset-0 opacity-10"
          animate={{ 
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
          style={{
            backgroundImage: `radial-gradient(circle, #c9a45c 1px, transparent 1px)`,
            backgroundSize: "50px 50px"
          }}
        />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-8"
            variants={staggerContainer}
          >
            {[
              { value: 'Pure', label: 'Farm-Sourced', icon: Leaf },
              { value: `${products.length}`, suffix: '+', label: 'Product Range', icon: Package },
              { value: '1000', suffix: '+', label: 'Happy Customers', icon: Users },
              { value: 'Zero', label: 'Artificial Additives', icon: Shield },
            ].map((stat, i) => (
              <motion.div
                key={i}
                className="flex flex-col items-center justify-center text-center group"
                variants={scaleIn}
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div
                  className="flex items-center justify-center mb-1 md:mb-4"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                >
                  <stat.icon className="w-5 h-5 md:w-8 md:h-8 text-[#c9a45c]" />
                </motion.div>
                <motion.div
                  className="text-lg md:text-5xl font-bold text-[#c9a45c] mb-0.5 md:mb-2"
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1, type: "spring", stiffness: 100 }}
                >
                  <AnimatedCounter
                    end={stat.value}
                    suffix={stat.suffix || ''}
                    duration={2.5}
                  />
                </motion.div>
                <motion.p
                  className="text-white/80 text-[10px] md:text-base leading-tight"
                  variants={fadeInUp}
                >
                  {stat.label}
                </motion.p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>



      {/* Products Section with enhanced animations */}
      <section id="products" className="py-12 md:py-24 bg-[#faf6f0]">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <motion.div 
            className="text-center mb-8 md:mb-16"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
          >
            <motion.span 
              className="inline-block px-4 py-1 bg-[#8b1a1a]/10 text-[#8b1a1a] rounded-full text-sm font-medium mb-4"
              variants={scaleIn}
            >
              Our Products
            </motion.span>
            <motion.h2 
              className="text-4xl md:text-5xl font-bold text-[#8b1a1a] mb-4"
              variants={fadeInUp}
            >
              Premium Collection
            </motion.h2>
            <motion.p 
              className="text-lg text-[#6b5347] max-w-2xl mx-auto"
              variants={fadeInUp}
            >
              Handcrafted with ancient wisdom, each product is a blend of tradition and purity
            </motion.p>
          </motion.div>

          {/* Search & Filter with animations */}
          <motion.div 
            className="mb-6 md:mb-12 space-y-4 md:space-y-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.div 
              className="relative max-w-xl mx-auto"
              whileFocus={{ scale: 1.02 }}
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b5347]" />
              <motion.input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border-2 border-[#e8ddd0] rounded-2xl focus:outline-none focus:border-[#c9a45c] transition-all text-lg"
                whileFocus={{ boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}
              />
            </motion.div>

            <div className="md:hidden relative max-w-xs mx-auto">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full appearance-none px-5 py-3 pr-12 rounded-2xl border-2 border-[#e8ddd0] bg-white text-sm font-semibold text-[#2d1b15] focus:outline-none focus:border-[#c9a45c] transition-colors cursor-pointer"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b5347] pointer-events-none" />
            </div>

            {/* Desktop: Buttons */}
            <motion.div 
              className="hidden md:flex gap-3 py-2 justify-center flex-wrap"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              {categories.map((category, index) => (
                <motion.button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-3 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                    selectedCategory === category
                      ? 'bg-[#8b1a1a] text-white shadow-lg'
                      : 'bg-white border-2 border-[#e8ddd0] text-[#2d1b15] hover:border-[#c9a45c] hover:text-[#8b1a1a]'
                  }`}
                  variants={staggerItem}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  layout
                >
                  {category}
                </motion.button>
              ))}
            </motion.div>
          </motion.div>

          {/* Products Grid with AnimatePresence */}
          <AnimatePresence mode="wait">
            {filteredProducts.length === 0 ? (
              <motion.div
                className="text-center py-16"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                key="no-results"
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: 3 }}
                >
                  <Search className="w-16 h-16 text-[#c9a45c]/50 mx-auto mb-4" />
                </motion.div>
                <p className="text-xl text-[#6b5347]">No products found matching your search.</p>
              </motion.div>
            ) : (
              <Carousel
                opts={{
                  align: "start",
                  loop: true,
                  dragFree: true,
                }}
                plugins={[
                  AutoScroll({
                    speed: 1.5,
                    stopOnInteraction: false,
                    stopOnMouseEnter: true,
                  })
                ]}
                className="w-full max-w-full relative cursor-grab active:cursor-grabbing"
              >
                <CarouselContent className="-ml-2 md:-ml-4">
                  {filteredProducts.map((product, index) => (
                    <CarouselItem key={product.id} className="basis-1/2 pl-2 py-2 md:basis-1/2 md:p-4 lg:basis-1/3">
                      <div className="h-full">
                        <PLPProductCard product={product} index={index} add={add} />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            )}
          </AnimatePresence>

          {/* View all CTA */}
          <motion.div
            className="mt-10 md:mt-14 flex justify-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Link
              href="/products"
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-[#8b1a1a] text-white font-semibold tracking-[0.18em] uppercase text-sm shadow-lg hover:bg-[#6d1414] hover:shadow-xl transition-all"
              style={{ fontFamily: "'Cinzel', 'Cormorant Garamond', serif" }}
            >
              <span aria-hidden className="text-[#c9a45c]">✦</span>
              View All Products
              <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* About/Heritage Section with enhanced animations */}
      <section id="about" className="py-12 md:py-24 bg-gradient-to-br from-[#8b1a1a] to-[#6d1414] text-white relative overflow-hidden">
        {/* Animated decorative pattern */}
        <motion.div 
          className="absolute inset-0 opacity-10"
          animate={{ 
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{ duration: 30, repeat: Infinity, repeatType: "reverse" }}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} 
        />
        
        {/* Floating orbs */}
        <motion.div
          className="absolute top-20 right-20 w-40 h-40 bg-[#c9a45c]/20 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 5, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-60 h-60 bg-[#c9a45c]/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 7, repeat: Infinity }}
        />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="grid lg:grid-cols-2 gap-8 md:gap-16 items-center"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {/* Image Side */}
            <motion.div 
              className="relative"
              variants={fadeInLeft}
            >
              <motion.div 
                className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-[#c9a45c]/30"
                whileHover={{ scale: 1.02, rotate: 1 }}
                transition={{ duration: 0.4 }}
              >
                <Image
                  src="/Logo.webp"
                  alt="Annavedah Heritage"
                  fill
                  className="object-cover"
                />
                {/* Shimmer overlay */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                />
              </motion.div>
              
              {/* Decorative element with animation */}
              <motion.div 
                className="absolute -bottom-8 -right-8 w-48 h-48 border-4 border-[#c9a45c]/30 rounded-3xl -z-10"
                animate={{ rotate: [0, 5, 0] }}
                transition={{ duration: 6, repeat: Infinity }}
              />
            </motion.div>

            {/* Content Side */}
            <motion.div 
              className="space-y-8"
              variants={fadeInRight}
            >
              <div>
                <motion.span 
                  className="inline-block px-4 py-1 bg-[#c9a45c]/20 text-[#c9a45c] rounded-full text-sm font-medium mb-4"
                  variants={scaleIn}
                >
                  Our Heritage
                </motion.span>
                <motion.h2 
                  className="text-4xl md:text-5xl font-bold mb-6 leading-tight"
                  variants={fadeInUp}
                >
                  Wisdom of <motion.span 
                    className="text-[#c9a45c]"
                    animate={{ 
                      textShadow: [
                        "0 0 20px rgba(201, 164, 92, 0.3)",
                        "0 0 40px rgba(201, 164, 92, 0.6)",
                        "0 0 20px rgba(201, 164, 92, 0.3)"
                      ]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    Generations
                  </motion.span>
                </motion.h2>
              </div>

              <motion.div 
                className="space-y-4 text-lg text-white/80 leading-relaxed"
                variants={staggerContainer}
              >
                <motion.p variants={fadeInUp}>
                  <strong className="text-[#c9a45c]">Annavedah</strong> brings together the timeless wisdom of traditional Indian nutrition with modern science. 
                  Our name combines "Anna" (अन्न - food) and "Veda" (वेद - knowledge), representing our commitment to the ancient knowledge of nourishment.
                </motion.p>
                <motion.p variants={fadeInUp}>
                  Each product is carefully crafted using time-honored methods that preserve the nutritional integrity and life force (प्राण) of every ingredient.
                </motion.p>
              </motion.div>

              <motion.div 
                className="grid grid-cols-2 gap-4 pt-4"
                variants={staggerContainer}
              >
                {[
                  { title: 'Sattvic', subtitle: 'सात्विक', desc: 'Pure & balanced foods' },
                  { title: 'Paushtik', subtitle: 'पौष्टिक', desc: 'Nutrient-rich formulas' },
                  { title: 'Paripurna', subtitle: 'परिपूर्ण', desc: 'Complete nourishment' },
                  { title: 'Prakritik', subtitle: 'प्राकृतिक', desc: 'Pure farm-sourced process' },
                ].map((item, i) => (
                  <motion.div 
                    key={i} 
                    className="p-4 bg-white/10 backdrop-blur rounded-2xl border border-white/20 hover:border-[#c9a45c]/50 transition-colors cursor-pointer"
                    variants={staggerItem}
                    whileHover={{ 
                      scale: 1.05, 
                      backgroundColor: "rgba(255,255,255,0.15)",
                      borderColor: "rgba(201, 164, 92, 0.5)"
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <motion.h4 
                      className="text-lg font-bold text-white"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      {item.title}
                    </motion.h4>
                    <p className="text-sm text-[#c9a45c]">{item.subtitle}</p>
                    <p className="text-xs text-white/60 mt-1">{item.desc}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section — Premium Bento Grid */}
      <motion.section
        className="py-12 md:py-28 relative overflow-hidden"
        style={{ background: 'linear-gradient(165deg, #faf6f0 0%, #f5ede2 40%, #faf6f0 100%)' }}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: "-50px" }}
        variants={staggerContainer}
      >
        {/* Decorative mandala watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-[0.03] pointer-events-none">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="95" stroke="#8b1a1a" strokeWidth="0.5" fill="none"/>
            <circle cx="100" cy="100" r="75" stroke="#8b1a1a" strokeWidth="0.5" fill="none"/>
            <circle cx="100" cy="100" r="55" stroke="#8b1a1a" strokeWidth="0.5" fill="none"/>
            <circle cx="100" cy="100" r="35" stroke="#8b1a1a" strokeWidth="0.5" fill="none"/>
            {[...Array(12)].map((_, i) => (
              <line key={i} x1="100" y1="5" x2="100" y2="195" stroke="#8b1a1a" strokeWidth="0.3" transform={`rotate(${i * 30} 100 100)`}/>
            ))}
            {[...Array(8)].map((_, i) => (
              <ellipse key={`e${i}`} cx="100" cy="100" rx="60" ry="30" stroke="#c9a45c" strokeWidth="0.3" fill="none" transform={`rotate(${i * 22.5} 100 100)`}/>
            ))}
          </svg>
        </div>

        {/* Floating decorative particles */}
        <motion.div
          className="absolute top-20 right-[15%] w-3 h-3 rounded-full bg-[#c9a45c]/30"
          animate={{ y: [0, -30, 0], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-40 left-[10%] w-2 h-2 rounded-full bg-[#8b1a1a]/20"
          animate={{ y: [0, -20, 0], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
        />
        <motion.div
          className="absolute bottom-32 right-[25%] w-4 h-4 rounded-full bg-[#c9a45c]/20"
          animate={{ y: [0, -25, 0], opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: 6, repeat: Infinity, delay: 2 }}
        />
        
        <div className="container mx-auto px-4 relative z-10">
          {/* Section Header */}
          <motion.div
            className="text-center mb-10 md:mb-20"
            variants={fadeInUp}
          >
            <motion.div
              className="inline-flex items-center gap-3 px-5 py-2 bg-[#8b1a1a]/8 border border-[#8b1a1a]/15 rounded-full text-sm font-medium mb-6 text-[#8b1a1a]"
              variants={scaleIn}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#c9a45c] animate-pulse" />
              Why Choose Us
              <span className="w-1.5 h-1.5 rounded-full bg-[#c9a45c] animate-pulse" />
            </motion.div>
            <motion.h2
              className="text-4xl md:text-6xl font-bold text-[#2d1b15] mb-5 tracking-tight"
              variants={fadeInUp}
            >
              The Annavedah{' '}
              <span className="relative inline-block">
                <span className="relative z-10 text-[#8b1a1a]">Difference</span>
                <motion.span
                  className="absolute bottom-1 left-0 w-full h-3 bg-[#c9a45c]/20 rounded-full -z-0"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                  style={{ transformOrigin: "left" }}
                />
              </span>
            </motion.h2>
            <motion.p
              className="text-lg text-[#6b5347] max-w-xl mx-auto"
              variants={fadeInUp}
            >
              Rooted in ancient Ayurvedic wisdom, refined by modern science
            </motion.p>
          </motion.div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 max-w-6xl mx-auto">
            
            {/* Card 1 — Hero Card (Large, spans 7 cols) */}
            <motion.div
              className="lg:col-span-7 group relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#8b1a1a] via-[#7a1616] to-[#5a1010] p-10 md:p-12 min-h-[320px] flex flex-col justify-between cursor-default"
              variants={staggerItem}
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              {/* Background decorative circle */}
              <motion.div
                className="absolute -top-20 -right-20 w-80 h-80 rounded-full border border-white/10"
                animate={{ rotate: 360 }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute -top-10 -right-10 w-60 h-60 rounded-full border border-[#c9a45c]/15"
                animate={{ rotate: -360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              />
              
              {/* Sanskrit watermark */}
              <div className="absolute bottom-6 right-8 text-[5rem] md:text-[7rem] font-bold text-white/[0.04] leading-none select-none pointer-events-none">
                पोषण
              </div>

              <div>
                <motion.div
                  className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center mb-8"
                  whileHover={{ rotate: 10, scale: 1.1 }}
                >
                  <Leaf className="w-7 h-7 text-[#c9a45c]" />
                </motion.div>
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                  95% Nutrients<br />
                  <span className="text-[#c9a45c]">Preserved</span>
                </h3>
                <p className="text-white/70 text-lg max-w-md leading-relaxed">
                  Our proprietary dehydration process locks in nearly all vitamins, minerals, and life force (प्राण) while removing only excess moisture.
                </p>
              </div>

              <div className="flex items-center gap-3 mt-8">
                <div className="flex -space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-2 h-2 rounded-full bg-[#c9a45c]" style={{ opacity: 1 - i * 0.15 }} />
                  ))}
                </div>
                <span className="text-white/50 text-sm">Nutrient Dense • Farm to Pack</span>
              </div>
            </motion.div>

            {/* Card 2 — Top Right (5 cols) */}
            <motion.div
              className="lg:col-span-5 group relative overflow-hidden rounded-[2rem] bg-white border-2 border-[#e8ddd0] p-8 md:p-10 flex flex-col justify-between min-h-[320px] cursor-default"
              variants={staggerItem}
              whileHover={{ 
                borderColor: "#c9a45c",
                boxShadow: "0 20px 60px rgba(139, 26, 26, 0.08)",
              }}
              transition={{ duration: 0.4 }}
            >
              {/* Accent corner */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#c9a45c]/10 to-transparent rounded-bl-[4rem]" />
              
              <div>
                <motion.div
                  className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#c9a45c]/20 to-[#c9a45c]/5 border border-[#c9a45c]/30 flex items-center justify-center mb-6"
                  whileHover={{ rotate: -10, scale: 1.1 }}
                >
                  <Sparkles className="w-7 h-7 text-[#c9a45c]" />
                </motion.div>
                <h3 className="text-2xl font-bold text-[#2d1b15] mb-3">
                  Effortless Daily<br />Nutrition
                </h3>
                <p className="text-[#6b5347] leading-relaxed">
                  Stir into your morning smoothie, knead into roti dough, or dissolve in warm milk — nutrition that fits your life, not the other way around.
                </p>
              </div>

              {/* Usage tags */}
              <div className="flex flex-wrap gap-2 mt-6">
                {['Smoothies', 'Rotis', 'Soups', 'Warm Drinks'].map((tag) => (
                  <span key={tag} className="px-3 py-1.5 bg-[#faf6f0] border border-[#e8ddd0] rounded-full text-xs font-medium text-[#6b5347] group-hover:border-[#c9a45c]/40 transition-colors">
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Card 3 — Bottom Left (5 cols) */}
            <motion.div
              className="lg:col-span-5 group relative overflow-hidden rounded-[2rem] p-8 md:p-10 flex flex-col justify-between min-h-[280px] cursor-default"
              style={{ background: 'linear-gradient(135deg, #fdf8f0 0%, #f8ecd8 100%)' }}
              variants={staggerItem}
              whileHover={{ 
                boxShadow: "0 20px 60px rgba(201, 164, 92, 0.15)",
              }}
              transition={{ duration: 0.4 }}
            >
              {/* Decorative Ayurveda symbol */}
              <div className="absolute -bottom-4 -left-4 text-[6rem] text-[#c9a45c]/[0.07] font-bold select-none pointer-events-none leading-none">
                ॐ
              </div>
              
              <div>
                <div className="flex items-start justify-between mb-6">
                  <motion.div
                    className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#8b1a1a] to-[#6d1414] flex items-center justify-center"
                    whileHover={{ rotate: 10, scale: 1.1 }}
                  >
                    <Heart className="w-7 h-7 text-white" />
                  </motion.div>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-[#8b1a1a]/8 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8b1a1a] animate-pulse" />
                    <span className="text-xs font-semibold text-[#8b1a1a]">Ancient Wisdom</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-[#2d1b15] mb-3">
                  Ayurveda-Inspired<br />Formulations
                </h3>
                <p className="text-[#6b5347] leading-relaxed">
                  Each blend is thoughtfully designed around Tridosha principles — balancing Vata, Pitta, and Kapha for holistic well-being.
                </p>
              </div>

              {/* Dosha indicators */}
              <div className="flex items-center gap-4 mt-6">
                {[
                  { name: 'Vata', color: '#6b5347' },
                  { name: 'Pitta', color: '#8b1a1a' },
                  { name: 'Kapha', color: '#c9a45c' },
                ].map((dosha) => (
                  <div key={dosha.name} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dosha.color }} />
                    <span className="text-xs font-medium text-[#6b5347]">{dosha.name}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Card 4 — Bottom Right (7 cols) */}
            <motion.div
              className="lg:col-span-7 group relative overflow-hidden rounded-[2rem] bg-[#2d1b15] p-8 md:p-10 flex flex-col justify-between min-h-[280px] cursor-default"
              variants={staggerItem}
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              {/* Animated scan line */}
              <motion.div
                className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#c9a45c]/50 to-transparent"
                animate={{ top: ["0%", "100%", "0%"] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              />
              
              {/* Grid pattern overlay */}
              <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: `linear-gradient(rgba(201,164,92,1) 1px, transparent 1px), linear-gradient(90deg, rgba(201,164,92,1) 1px, transparent 1px)`,
                backgroundSize: '40px 40px'
              }} />

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <motion.div
                    className="w-14 h-14 rounded-2xl bg-[#c9a45c]/15 border border-[#c9a45c]/30 flex items-center justify-center"
                    whileHover={{ rotate: -10, scale: 1.1 }}
                  >
                    <Shield className="w-7 h-7 text-[#c9a45c]" />
                  </motion.div>
                  <motion.div
                    className="flex items-center gap-2 px-3 py-1.5 bg-green-500/15 border border-green-500/25 rounded-full"
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Check className="w-3.5 h-3.5 text-green-400" />
                    <span className="text-xs font-semibold text-green-400">Verified</span>
                  </motion.div>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                  Lab Tested &{' '}
                  <span className="text-[#c9a45c]">Certified Pure</span>
                </h3>
                <p className="text-white/60 leading-relaxed max-w-lg">
                  Every single batch undergoes rigorous third-party lab testing for purity, potency, heavy metals, and zero contamination before reaching you.
                </p>
              </div>

              {/* Test metrics */}
              <div className="flex flex-wrap gap-4 mt-8 relative z-10">
                {[
                  { label: 'Purity', value: '99.9%' },
                  { label: 'Heavy Metals', value: 'Zero' },
                  { label: 'Additives', value: 'None' },
                ].map((metric) => (
                  <div key={metric.label} className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm">
                    <div className="text-lg font-bold text-[#c9a45c]">{metric.value}</div>
                    <div className="text-xs text-white/40">{metric.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

          </div>
        </div>
      </motion.section>



      {/* Newsletter Section with enhanced animations */}
      <motion.section
        className="py-12 md:py-20 bg-[#8b1a1a] relative overflow-hidden"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={fadeInUp}
      >
        {/* Animated background orbs */}
        <motion.div 
          className="absolute top-0 left-0 w-96 h-96 bg-[#c9a45c]/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"
          animate={{ 
            scale: [1, 1.3, 1],
            x: ["-50%", "-40%", "-50%"],
            y: ["-50%", "-60%", "-50%"]
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-0 right-0 w-96 h-96 bg-[#c9a45c]/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"
          animate={{ 
            scale: [1.2, 1, 1.2],
            x: ["50%", "40%", "50%"],
            y: ["50%", "60%", "50%"]
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="max-w-2xl mx-auto text-center"
            variants={staggerContainer}
          >
            <motion.h2
              className="text-3xl md:text-4xl font-bold text-white mb-4"
              variants={fadeInUp}
            >
              Join Our <motion.span 
                className="text-[#c9a45c]"
                animate={{ 
                  textShadow: [
                    "0 0 20px rgba(201, 164, 92, 0.3)",
                    "0 0 40px rgba(201, 164, 92, 0.6)",
                    "0 0 20px rgba(201, 164, 92, 0.3)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Wellness Community
              </motion.span>
            </motion.h2>
            <motion.p
              className="text-white/80 mb-8 text-lg"
              variants={fadeInUp}
            >
              Get exclusive recipes, Ayurvedic wellness tips, and special offers delivered to your inbox
            </motion.p>
            
            <form
              onSubmit={handleNewsletterSubmit}
              className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto"
            >
              <motion.input
                type="email"
                name="newsletterEmail"
                required
                value={newsletterEmail}
                onChange={(event) => {
                  setNewsletterEmail(event.target.value)
                  setNewsletterMessage('')
                  setNewsletterSubmitted(false)
                }}
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 rounded-xl bg-white/10 backdrop-blur border-2 border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:border-[#c9a45c] transition-colors text-lg"
                whileFocus={{ scale: 1.02, boxShadow: "0 0 30px rgba(201, 164, 92, 0.3)" }}
              />
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button type="submit" className="bg-[#c9a45c] hover:bg-[#b8944d] text-[#2d1b15] h-14 px-8 rounded-xl font-semibold text-lg w-full sm:w-auto">
                  {newsletterSubmitted ? 'Subscribed' : 'Subscribe'}
                </Button>
              </motion.div>
            </form>

            {newsletterMessage && (
              <motion.p
                className={`text-sm mt-4 ${newsletterSubmitted ? 'text-[#c9a45c]' : 'text-red-200'}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                aria-live="polite"
              >
                {newsletterMessage}
              </motion.p>
            )}

            <motion.p
              className="text-white/60 text-sm mt-4"
              variants={fadeInUp}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              No spam, only pure knowledge. Unsubscribe anytime.
            </motion.p>
          </motion.div>
        </div>
      </motion.section>

      <InstagramFeed />

      <section className="py-12 bg-white border-t border-[#e8ddd0]">
        <div className="container mx-auto px-4">
          <TrustBadges />
        </div>
      </section>

    </div>
  )
}
