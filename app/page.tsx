'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { products, banners, testimonials, categories } from '@/lib/content'
import { Search, Leaf, Heart, Star, ShoppingCart, ChevronLeft, ChevronRight, Package, Users, Shield, Check, Sparkles } from 'lucide-react'
import { useCart } from '@/components/cart-context'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import AutoScroll from 'embla-carousel-auto-scroll'
import { motion, useAnimation, useInView, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion'
import CountUp from 'react-countup'

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
      className="group bg-white rounded-3xl border-2 border-[#e8ddd0] overflow-hidden hover:border-[#c9a45c] transition-colors duration-300 flex flex-col h-full"
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
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-contain p-6 drop-shadow-xl transition-all duration-500 group-hover:drop-shadow-2xl"
            />
          </motion.div>
        </Link>
        {product.badge && (
          <motion.div 
            className="absolute top-4 left-4 z-10"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 + 0.3 }}
          >
            <motion.span 
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide inline-block ${
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
        className="p-6 space-y-4 flex-1 flex flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: index * 0.05 }}
      >
        <div>
          <motion.span 
            className="text-xs text-[#c9a45c] font-medium uppercase tracking-wide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {product.category}
          </motion.span>
          <Link href={`/products/${product.slug}`} className="block group-hover:text-[#8b1a1a] transition-colors">
            <h3 className="text-2xl font-bold text-[#2d1b15] group-hover:text-[#8b1a1a]">{product.name}</h3>
          </Link>
          {product.nameHindi !== product.name && <p className="text-sm text-[#6b5347]">{product.nameHindi}</p>}
        </div>
        
        <p className="text-[#6b5347] text-sm leading-relaxed flex-1">{product.description}</p>

        {product.packPrices.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {product.packPrices.map((pack: any) => (
              <button
                key={`${product.slug}-${pack.size}`}
                onClick={() => setSelectedPack(pack)}
                className={`relative px-3 py-1.5 border-2 rounded-xl text-xs font-bold transition-all duration-300 ${
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
          className="flex items-center justify-between pt-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {currentPrice > 0 ? (
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-[#8b1a1a]">₹{currentPrice}</span>
            </div>
          ) : (
            <span className="text-sm font-semibold text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
              Price on request
            </span>
          )}
        </motion.div>
        
        <div className="flex gap-2 pt-4 mt-auto border-t border-[#e8ddd0]/50">
          <Button asChild variant="outline" className="flex-1 h-12 border-2 border-[#c9a45c] text-[#8b1a1a] hover:bg-[#c9a45c]/10 font-semibold rounded-xl transition-all">
            <Link href={`/products/${product.slug}`}>Details</Link>
          </Button>
          <Button 
            className="flex-1 h-12 bg-[#8b1a1a] hover:bg-[#6d1414] text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
            onClick={() => add(product.id, selectedPack)} 
            disabled={currentPrice <= 0}
          >
            <ShoppingCart className="w-4 h-4 mr-1 md:mr-2" />
            {currentPrice > 0 ? 'Add' : 'Enquire'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentBanner, setCurrentBanner] = useState(0)
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

  return (
    <div className="min-h-screen bg-[#faf6f0] text-[#2d1b15] pt-[116px] lg:pt-[172px]">
      

      {/* Hero Section - Full image, no text, sits below fixed navbar */}
      {/* Mobile: 36px bar + 80px header = 116px; Desktop: 36px + 80px + 56px nav = 172px */}
      <section
        className="relative h-[calc(100vh-116px)] lg:h-[calc(100vh-172px)]"
      >
        <div className="absolute inset-0">
          {/* Mobile image */}
          <Image
            src="/Products/hero_section mobile.webp"
            alt="Annavedah Foods - Dehydrated Vegetable Powders"
            fill
            className="object-cover object-top md:hidden"
            priority
          />
          {/* Tablet image */}
          <Image
            src="/Products/hero_section_tablet.webp"
            alt="Annavedah Foods - Dehydrated Vegetable Powders"
            fill
            className="object-cover object-top hidden md:block lg:hidden"
            priority
          />
          {/* Desktop image */}
          <Image
            src="/Products/Hero_section.webp"
            alt="Annavedah Foods - Dehydrated Vegetable Powders"
            fill
            className="object-cover object-top hidden lg:block"
            priority
          />
        </div>
      </section>

      {/* Stats Section with CountUp */}
      <motion.section
        className="py-16 bg-gradient-to-r from-[#8b1a1a] to-[#6d1414] relative overflow-hidden"
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
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
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
                  className="flex items-center justify-center mb-4"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                >
                  <stat.icon className="w-8 h-8 text-[#c9a45c]" />
                </motion.div>
                <motion.div
                  className="text-4xl md:text-5xl font-bold text-[#c9a45c] mb-2"
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
                  className="text-white/80 text-sm md:text-base"
                  variants={fadeInUp}
                >
                  {stat.label}
                </motion.p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Banner Carousel with AnimatePresence */}
      <section className="relative overflow-hidden">
        <div className="relative w-full flex justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentBanner}
              initial={{ opacity: 0, x: 100, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -100, scale: 0.95 }}
              transition={{ 
                duration: 0.5, 
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
              className="w-full"
            >
              <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] md:aspect-[21/9] lg:aspect-[3/1]">
                {/* Mobile image */}
                <Image
                  src={banners[currentBanner].mobile}
                  alt="Annavedah Promotional Banner"
                  fill
                  className="object-cover md:hidden"
                  priority
                />
                {/* Tablet image */}
                <Image
                  src={banners[currentBanner].tablet}
                  alt="Annavedah Promotional Banner"
                  fill
                  className="object-cover hidden md:block lg:hidden"
                  priority
                />
                {/* Desktop image */}
                <Image
                  src={banners[currentBanner].desktop}
                  alt="Annavedah Promotional Banner"
                  fill
                  className="object-cover hidden lg:block"
                  priority
                />
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows with hover effects */}
          <motion.button
            onClick={prevBanner}
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all z-10"
            whileHover={{ scale: 1.1, x: -3 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronLeft className="w-7 h-7 text-[#8b1a1a]" />
          </motion.button>
          <motion.button
            onClick={nextBanner}
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all z-10"
            whileHover={{ scale: 1.1, x: 3 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronRight className="w-7 h-7 text-[#8b1a1a]" />
          </motion.button>

          {/* Animated Dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-10">
            {banners.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => setCurrentBanner(index)}
                className={`h-4 rounded-full transition-all ${
                  index === currentBanner ? 'bg-[#c9a45c]' : 'bg-white/50 hover:bg-white/80'
                }`}
                animate={{ 
                  width: index === currentBanner ? 40 : 16,
                  scale: index === currentBanner ? 1 : 0.9
                }}
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
              />
            ))}
          </div>
        </div>
        
        {/* Progress bar for current banner */}
        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-[#c9a45c]"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          key={currentBanner}
          transition={{ duration: 5, ease: "linear" }}
        />
      </section>

      {/* Products Section with enhanced animations */}
      <section id="products" className="py-24 bg-[#faf6f0]">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <motion.div 
            className="text-center mb-16"
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
            className="mb-12 space-y-6"
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

            <motion.div 
              className="flex gap-3 overflow-x-auto pb-2 justify-center flex-wrap"
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
                }}
                plugins={[
                  AutoScroll({
                    speed: 1.5,
                    stopOnInteraction: false,
                    stopOnMouseEnter: true,
                  })
                ]}
                className="w-full max-w-full relative px-4 sm:px-12"
              >
                <CarouselContent>
                  {filteredProducts.map((product, index) => (
                    <CarouselItem key={product.id} className="md:basis-1/2 lg:basis-1/3 p-4">
                      <div className="h-full">
                        <PLPProductCard product={product} index={index} add={add} />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="hidden sm:block">
                  <CarouselPrevious className="border-[#c9a45c] text-[#8b1a1a] hover:bg-[#c9a45c]/10 -left-4 bg-white/80 backdrop-blur-sm" />
                  <CarouselNext className="border-[#c9a45c] text-[#8b1a1a] hover:bg-[#c9a45c]/10 -right-4 bg-white/80 backdrop-blur-sm" />
                </div>
              </Carousel>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* About/Heritage Section with enhanced animations */}
      <section id="about" className="py-24 bg-gradient-to-br from-[#8b1a1a] to-[#6d1414] text-white relative overflow-hidden">
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
            className="grid lg:grid-cols-2 gap-16 items-center"
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

      {/* Benefits Section with enhanced animations */}
      <motion.section
        className="py-24 bg-[#faf6f0] relative overflow-hidden"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: "-50px" }}
        variants={staggerContainer}
      >
        {/* Subtle background animation */}
        <motion.div
          className="absolute top-0 left-0 w-full h-full opacity-30"
          style={{
            background: "radial-gradient(circle at 30% 50%, rgba(201, 164, 92, 0.1) 0%, transparent 50%)"
          }}
          animate={{ 
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="text-center mb-16"
            variants={fadeInUp}
          >
            <motion.span
              className="inline-block px-4 py-1 bg-[#8b1a1a]/10 text-[#8b1a1a] rounded-full text-sm font-medium mb-4"
              variants={scaleIn}
              whileHover={{ scale: 1.05 }}
            >
              Why Choose Us
            </motion.span>
            <motion.h2
              className="text-4xl md:text-5xl font-bold text-[#8b1a1a] mb-4"
              variants={fadeInUp}
            >
              The Annavedah Difference
            </motion.h2>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerContainer}
          >
            {[
              {
                icon: Leaf,
                title: 'Nutrient Dense',
                description: 'Dehydration preserves up to 95% of nutrients while removing excess moisture',
                color: 'from-[#8b1a1a] to-[#c9a45c]',
              },
              {
                icon: Sparkles,
                title: 'Easy Integration',
                description: 'Mix into smoothies, soups, rotis, or warm drinks for daily nutrition',
                color: 'from-[#c9a45c] to-[#8b1a1a]',
              },
              {
                icon: Heart,
                title: 'Ayurveda Inspired',
                description: 'Blends designed according to ancient wellness principles and doshas',
                color: 'from-[#2d1b15] to-[#8b1a1a]',
              },
              {
                icon: Star,
                title: 'Lab Tested',
                description: 'Every batch tested for purity, potency, and zero contamination',
                color: 'from-[#6b5347] to-[#c9a45c]',
              },
            ].map((benefit, index) => (
              <motion.div
                key={index}
                className="group p-8 bg-white rounded-3xl border-2 border-[#e8ddd0] hover:border-[#c9a45c] transition-colors duration-300"
                variants={staggerItem}
                whileHover={{ 
                  y: -10, 
                  boxShadow: "0 25px 50px rgba(0,0,0,0.1)",
                  transition: { duration: 0.3 }
                }}
              >
                <motion.div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${benefit.color} flex items-center justify-center mb-6`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <motion.div
                    animate={{ 
                      y: [0, -3, 0],
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      delay: index * 0.2
                    }}
                  >
                    <benefit.icon className="w-8 h-8 text-white" />
                  </motion.div>
                </motion.div>
                <motion.h3
                  className="text-xl font-bold text-[#2d1b15] mb-3"
                  variants={fadeInUp}
                >
                  {benefit.title}
                </motion.h3>
                <motion.p
                  className="text-[#6b5347] leading-relaxed"
                  variants={fadeInUp}
                >
                  {benefit.description}
                </motion.p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>



      {/* Newsletter Section with enhanced animations */}
      <motion.section
        className="py-20 bg-[#8b1a1a] relative overflow-hidden"
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
            
            <motion.div
              className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto"
              variants={fadeInUp}
            >
              <motion.input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 rounded-xl bg-white/10 backdrop-blur border-2 border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:border-[#c9a45c] transition-colors text-lg"
                whileFocus={{ scale: 1.02, boxShadow: "0 0 30px rgba(201, 164, 92, 0.3)" }}
              />
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button className="bg-[#c9a45c] hover:bg-[#b8944d] text-[#2d1b15] h-14 px-8 rounded-xl font-semibold text-lg w-full sm:w-auto">
                  Subscribe
                </Button>
              </motion.div>
            </motion.div>

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

    </div>
  )
}
