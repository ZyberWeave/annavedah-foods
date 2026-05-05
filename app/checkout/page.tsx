'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/components/cart-context'
import { validateCoupon, coupons } from '@/lib/coupons'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { CheckCircle2, Loader2, MapPin, ShieldCheck, Truck, ChevronRight, AlertCircle, Tag, X, Ticket, ChevronDown, ChevronUp } from 'lucide-react'
import { validateEmail, validatePhone, validateName, validateRequired } from '@/lib/validations'
import Breadcrumbs from '@/components/Breadcrumbs'

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any
  }
}

interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  pincode: string
}

type Step = 'address' | 'payment' | 'success'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, total, remove, appliedCoupon, applyCoupon, removeCoupon } = useCart()
  const [step, setStep] = useState<Step>('address')
  const [loading, setLoading] = useState(false)
  const [serviceability, setServiceability] = useState<'idle' | 'checking' | 'available' | 'unavailable'>('idle')
  const [orderId, setOrderId] = useState('')
  const [form, setForm] = useState<FormData>({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', city: '', state: '', pincode: '',
  })
  const [errors, setErrors] = useState<Partial<FormData>>({})
  const [paymentMethod, setPaymentMethod] = useState<'Prepaid' | 'COD'>('Prepaid')
  const [promoCode, setPromoCode] = useState('')
  const [promoError, setPromoError] = useState('')
  const [promoLoading, setPromoLoading] = useState(false)
  const [showAvailableCoupons, setShowAvailableCoupons] = useState(false)

  const codCharge = paymentMethod === 'COD' ? 99 : 0
  const couponDiscount = appliedCoupon ? appliedCoupon.discount : 0
  const finalTotal = total - couponDiscount + codCharge

  const [isAuthChecking, setIsAuthChecking] = useState(true)

  // Redirect if cart is empty
  useEffect(() => {
    if (!isAuthChecking && items.length === 0 && step !== 'success') router.push('/cart')
  }, [items, step, router, isAuthChecking])

  // Auth check
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (!data.user) {
          router.push('/login?redirect=/checkout');
        } else {
          // Pre-fill form if user is logged in
          setForm(f => ({
            ...f,
            firstName: data.user.name?.split(' ')[0] || '',
            lastName: data.user.name?.split(' ').slice(1).join(' ') || '',
            email: data.user.email || '',
          }));
          setIsAuthChecking(false);
        }
      })
      .catch(() => {
        router.push('/login?redirect=/checkout');
      });
  }, [router]);

  // Load Razorpay SDK
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)
    return () => { document.body.removeChild(script) }
  }, [])

  // Abandoned cart capture
  useEffect(() => {
    if (form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) && items.length > 0 && step !== 'success') {
      const timer = setTimeout(() => {
        fetch('/api/abandoned-cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: form.email,
            phone: form.phone,
            name: `${form.firstName} ${form.lastName}`.trim(),
            items: items.map(i => ({ 
              name: `${i.product.name}${i.selectedPack ? ` (${i.selectedPack.size})` : ''}`, 
              qty: i.qty, 
              price: i.selectedPack ? i.selectedPack.price : i.product.price 
            }))
          })
        }).catch(console.error)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [form.email, form.phone, form.firstName, form.lastName, items, step])

  if (isAuthChecking && step !== 'success') {
    return (
      <div className="min-h-screen pt-[120px] lg:pt-[190px] pb-16 flex items-center justify-center bg-[#faf6f0]">
        <Loader2 className="w-8 h-8 animate-spin text-[#c9a45c]" />
      </div>
    );
  }

  function set(field: keyof FormData, value: string) {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => ({ ...e, [field]: '' }))
    if (field === 'pincode' && value.length === 6) checkPin(value)
  }

  async function checkPin(pin: string) {
    setServiceability('checking')
    try {
      const res = await fetch(`/api/shiprocket/serviceability?delivery=${pin}`)
      const data = await res.json()
      const available = data?.data?.available_courier_companies?.length > 0
      setServiceability(available ? 'available' : 'unavailable')
    } catch {
      setServiceability('unavailable')
    }
  }

  function validate(): boolean {
    const errs: Partial<FormData> = {}
    const nameResult = validateName(form.firstName, 'First name')
    if (!nameResult.valid) errs.firstName = nameResult.message
    const emailResult = validateEmail(form.email)
    if (!emailResult.valid) errs.email = emailResult.message
    const phoneResult = validatePhone(form.phone)
    if (!phoneResult.valid) errs.phone = phoneResult.message
    const addrResult = validateRequired(form.address, 'Address')
    if (!addrResult.valid) errs.address = addrResult.message
    const cityResult = validateRequired(form.city, 'City')
    if (!cityResult.valid) errs.city = cityResult.message
    const stateResult = validateRequired(form.state, 'State')
    if (!stateResult.valid) errs.state = stateResult.message
    // TODO: Add pincode validation back in the future when shiprocket is setting up
    // if (!form.pincode.match(/^\d{6}$/)) errs.pincode = 'Invalid pincode'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleApplyCheckoutCoupon() {
    if (!promoCode.trim()) return
    setPromoLoading(true)
    setPromoError('')
    const result = await applyCoupon(promoCode.trim())
    if (!result.success) {
      setPromoError(result.error || 'Invalid coupon')
    } else {
      setPromoCode('')
      setShowAvailableCoupons(false)
    }
    setPromoLoading(false)
  }

  async function handlePayment() {
    if (!validate()) return
    setLoading(true)
    try {
      if (paymentMethod === 'COD') {
        const generatedOrderId = `COD_${Date.now()}`
        
        // Create Shiprocket order for COD directly
        await fetch('/api/shiprocket/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: generatedOrderId,
            paymentId: 'COD',
            customer: form,
            items: items.map(i => ({ 
              name: `${i.product.name}${i.selectedPack ? ` (${i.selectedPack.size})` : ''}`, 
              qty: i.qty, 
              price: i.selectedPack ? i.selectedPack.price : i.product.price 
            })),
            total: finalTotal,
            paymentMethod: 'COD',
          }),
        })

        setOrderId(generatedOrderId)
        items.forEach(i => remove(i.product.id, i.selectedPack?.size))
        setStep('success')
        return;
      }

      // 1. Create Razorpay order
      const orderRes = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: finalTotal * 100, receipt: `receipt_${Date.now()}` }),
      })
      const order = await orderRes.json()
      if (!order.id) throw new Error('Could not create payment order')

      // 2. Open Razorpay modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Annavedah Foods',
        description: 'Traditional Nutrition Products',
        image: '/Logo.webp',
        order_id: order.id,
        prefill: {
          name: `${form.firstName} ${form.lastName}`,
          email: form.email,
          contact: form.phone,
        },
        theme: { color: '#c9a45c' },
        handler: async (response: {
          razorpay_payment_id: string
          razorpay_order_id: string
          razorpay_signature: string
        }) => {
          // 3. Verify payment
          const verifyRes = await fetch('/api/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              ...response,
              customer: form,
              items: items.map(i => ({ 
                name: `${i.product.name}${i.selectedPack ? ` (${i.selectedPack.size})` : ''}`, 
                qty: i.qty, 
                price: i.selectedPack ? i.selectedPack.price : i.product.price 
              })),
              total: finalTotal,
              orderId: order.id
            }),
          })
          const verify = await verifyRes.json()
          if (!verify.verified) throw new Error('Payment verification failed')

          // 4. Create Shiprocket order
          await fetch('/api/shiprocket/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: order.id,
              paymentId: response.razorpay_payment_id,
              customer: form,
              items: items.map(i => ({ 
                name: `${i.product.name}${i.selectedPack ? ` (${i.selectedPack.size})` : ''}`, 
                qty: i.qty, 
                price: i.selectedPack ? i.selectedPack.price : i.product.price 
              })),
              total: finalTotal,
              paymentMethod: 'Prepaid',
            }),
          })

          setOrderId(order.id)
          // Clear cart items
          items.forEach(i => remove(i.product.id, i.selectedPack?.size))
          setStep('success')
        },
        modal: { ondismiss: () => setLoading(false) },
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', () => setLoading(false))
      rzp.open()
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  // ─── SUCCESS SCREEN ────────────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-20" style={{ background: 'var(--background)' }}>
        <div className="max-w-md w-full text-center space-y-6 rounded-3xl border border-border bg-card p-10 shadow-xl">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'rgba(201,164,92,0.15)' }}>
              <CheckCircle2 className="w-10 h-10" style={{ color: '#c9a45c' }} />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Order Placed!</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Your order <span className="font-semibold text-foreground">{orderId}</span> has been confirmed.
            We've notified our shipping partner and will send tracking details to <span className="font-semibold">{form.email}</span>.
          </p>
          <Button
            className="w-full h-12 font-semibold"
            style={{ background: '#c9a45c', color: '#2d1b15' }}
            onClick={() => router.push('/products')}
          >
            Continue Shopping
          </Button>
        </div>
      </div>
    )
  }

  // ─── CHECKOUT FORM ─────────────────────────────────────────────────────────
  const inputClass = (field: keyof FormData) =>
    `w-full rounded-xl border px-4 py-3 text-sm bg-background text-foreground placeholder:text-muted-foreground outline-none transition-all focus:ring-2 ${errors[field] ? 'border-red-400 focus:ring-red-200' : 'border-border focus:ring-amber-200 focus:border-amber-400'}`

  const states = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh']

  const steps = [
    { id: 'address', label: 'Address' },
    { id: 'payment', label: 'Payment' },
    { id: 'success', label: 'Confirmation' },
  ] as const
  const currentStepIdx = steps.findIndex((s) => s.id === step)

  return (
    <div className="min-h-screen pt-[120px] lg:pt-[190px] pb-12 px-4" style={{ background: 'var(--background)' }}>
      <div className="max-w-5xl mx-auto">

        <div className="mb-6">
          <Breadcrumbs items={[{ label: 'Cart', href: '/cart' }, { label: 'Checkout' }]} />
        </div>

        {/* Header */}
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#c9a45c' }}>Secure Checkout</p>
          <h1 className="text-3xl font-bold text-foreground">Complete Your Order</h1>
        </div>

        {/* Step indicator */}
        <div className="mb-10 flex items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm">
          {steps.map((s, i) => {
            const done = i < currentStepIdx
            const active = i === currentStepIdx
            return (
              <div key={s.id} className="flex items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                      done
                        ? 'bg-[#c9a45c] border-[#c9a45c] text-white'
                        : active
                        ? 'bg-[#8b1a1a] border-[#8b1a1a] text-white'
                        : 'bg-white border-[#e8ddd0] text-[#6b5347]'
                    }`}
                  >
                    {done ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className={`font-bold uppercase tracking-wider ${active ? 'text-[#8b1a1a]' : done ? 'text-[#2d1b15]' : 'text-[#6b5347]'}`}>
                    {s.label}
                  </span>
                </div>
                {i < steps.length - 1 && <ChevronRight className="w-4 h-4 text-[#c9a45c]" />}
              </div>
            )
          })}
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">

          {/* ── LEFT: Address Form ── */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <MapPin className="w-5 h-5" style={{ color: '#c9a45c' }} />
                Delivery Address
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">First Name *</label>
                  <input className={inputClass('firstName')} placeholder="Rahul" value={form.firstName} onChange={e => set('firstName', e.target.value)} />
                  {errors.firstName && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.firstName}</p>}
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Last Name</label>
                  <input className={inputClass('lastName')} placeholder="Desai" value={form.lastName} onChange={e => set('lastName', e.target.value)} />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Email Address *</label>
                <input type="email" className={inputClass('email')} placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} />
                {errors.email && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.email}</p>}
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Mobile Number *</label>
                <div className="flex">
                  <span className="flex items-center px-3 rounded-l-xl border border-r-0 border-border bg-muted text-sm text-muted-foreground">+91</span>
                  <input className={`${inputClass('phone')} rounded-l-none`} placeholder="9876543210" maxLength={10} inputMode="numeric" value={form.phone} onChange={e => set('phone', e.target.value.replace(/\D/g, ''))} />
                </div>
                {errors.phone && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.phone}</p>}
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Full Address *</label>
                <textarea className={`${inputClass('address')} resize-none h-20`} placeholder="Flat / House No, Street, Area" value={form.address} onChange={e => set('address', e.target.value)} />
                {errors.address && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.address}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">City *</label>
                  <input className={inputClass('city')} placeholder="Pune" value={form.city} onChange={e => set('city', e.target.value)} />
                  {errors.city && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.city}</p>}
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">State *</label>
                  <select className={inputClass('state')} value={form.state} onChange={e => set('state', e.target.value)}>
                    <option value="">Select state</option>
                    {states.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.state && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.state}</p>}
                </div>
              </div>

              {/* TODO: Add Pincode field back in the future when Shiprocket is setting up
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Pincode *</label>
                <div className="relative">
                  <input className={inputClass('pincode')} placeholder="411001" maxLength={6} value={form.pincode} onChange={e => set('pincode', e.target.value.replace(/\D/g, ''))} />
                  {serviceability === 'checking' && (
                    <span className="absolute right-3 top-3 text-xs text-muted-foreground flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" /> Checking…
                    </span>
                  )}
                  {serviceability === 'available' && (
                    <span className="absolute right-3 top-3 text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Delivery available
                    </span>
                  )}
                  {serviceability === 'unavailable' && (
                    <span className="absolute right-3 top-3 text-xs text-red-500">Not serviceable</span>
                  )}
                </div>
                {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
              </div>
              */}
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: <ShieldCheck className="w-5 h-5" />, label: '100% Secure Payment' },
                { icon: <Truck className="w-5 h-5" />, label: 'Fast Delivery' },
                { icon: <CheckCircle2 className="w-5 h-5" />, label: 'Quality Guaranteed' },
              ].map(b => (
                <div key={b.label} className="rounded-xl border border-border bg-card p-3 flex flex-col items-center gap-2 text-center">
                  <span style={{ color: '#c9a45c' }}>{b.icon}</span>
                  <p className="text-xs text-muted-foreground leading-tight">{b.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Order Summary ── */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4 sticky top-24">
              <h2 className="text-lg font-semibold text-foreground">Order Summary</h2>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {items.map((item, idx) => {
                  const { product, qty } = item;
                  return (
                  <div key={`${product.slug}-${idx}`} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg border border-border bg-white flex-shrink-0 overflow-hidden">
                      <Image src={product.image} alt={product.name} width={48} height={48} className="w-full h-full object-contain p-1" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {product.name} {item.selectedPack && `(${item.selectedPack.size})`}
                      </p>
                      <p className="text-xs text-muted-foreground">Qty: {qty}</p>
                    </div>
                    <p className="text-sm font-semibold text-foreground">₹{(item.selectedPack ? item.selectedPack.price : product.price) * qty}</p>
                  </div>
                  )
                })}
              </div>

              {/* ── Coupon Code Section ── */}
              <div className="border-t border-border pt-4 space-y-3">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Tag className="w-4 h-4" style={{ color: '#c9a45c' }} />
                  Promo Code
                </h3>

                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-green-50 border border-green-200">
                    <div className="flex items-center gap-2 min-w-0">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-green-800">{appliedCoupon.code}</p>
                        <p className="text-[10px] text-green-600 truncate">{appliedCoupon.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="p-1 hover:bg-green-100 rounded-full transition-colors flex-shrink-0"
                      aria-label="Remove coupon"
                    >
                      <X className="w-4 h-4 text-green-700" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        id="checkout-promo-input"
                        type="text"
                        placeholder="Enter coupon code"
                        value={promoCode}
                        onChange={(e) => { setPromoCode(e.target.value.toUpperCase()); setPromoError('') }}
                        className="flex-1 px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 uppercase tracking-wider font-bold transition-all"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleApplyCheckoutCoupon()
                          }
                        }}
                      />
                      <button
                        id="checkout-apply-coupon-btn"
                        onClick={handleApplyCheckoutCoupon}
                        disabled={promoLoading || !promoCode.trim()}
                        className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl border border-[#c9a45c] text-[#c9a45c] hover:bg-[#c9a45c]/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {promoLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Apply'}
                      </button>
                    </div>
                    {promoError && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 flex-shrink-0" />
                        {promoError}
                      </p>
                    )}

                    {/* Available Coupons Toggle */}
                    <button
                      type="button"
                      onClick={() => setShowAvailableCoupons(!showAvailableCoupons)}
                      className="text-xs font-semibold flex items-center gap-1 hover:underline transition-colors"
                      style={{ color: '#c9a45c' }}
                    >
                      <Ticket className="w-3.5 h-3.5" />
                      View available coupons
                      {showAvailableCoupons ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>

                    {showAvailableCoupons && (
                      <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                        {coupons.filter(c => c.active).map((c) => {
                          const result = validateCoupon(c.code, total)
                          const isEligible = result.valid
                          return (
                            <div
                              key={c.code}
                              className={`p-3 rounded-xl border text-left transition-all ${
                                isEligible
                                  ? 'border-[#c9a45c]/40 bg-[#c9a45c]/5 hover:border-[#c9a45c] cursor-pointer'
                                  : 'border-border bg-muted/30 opacity-60'
                              }`}
                              onClick={() => {
                                if (isEligible) {
                                  setPromoCode(c.code)
                                  setPromoError('')
                                }
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-xs font-bold text-foreground tracking-wider">{c.code}</p>
                                  <p className="text-[10px] text-muted-foreground mt-0.5">{c.description}</p>
                                </div>
                                {isEligible && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                                    -₹{result.discount}
                                  </span>
                                )}
                                {!isEligible && !result.valid && (
                                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-red-50 text-red-500 font-medium">
                                    Min ₹{c.minOrder}
                                  </span>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="border-t border-border pt-4 space-y-4">
                
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">Payment Method</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('Prepaid')}
                      className={`p-3 rounded-xl border text-sm font-medium transition-all ${paymentMethod === 'Prepaid' ? 'border-[#c9a45c] bg-[#c9a45c]/10 text-[#c9a45c]' : 'border-border bg-card text-muted-foreground'}`}
                    >
                      Online Payment
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('COD')}
                      className={`p-3 rounded-xl border text-sm font-medium transition-all ${paymentMethod === 'COD' ? 'border-[#c9a45c] bg-[#c9a45c]/10 text-[#c9a45c]' : 'border-border bg-card text-muted-foreground'}`}
                    >
                      Cash on Delivery
                    </button>
                  </div>
                </div>

                <div className="space-y-2 border-t border-border pt-4">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Subtotal</span>
                    <span>₹{total}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Coupon ({appliedCoupon.code})</span>
                      <span className="font-medium">-₹{appliedCoupon.discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Shipping</span>
                    <span className="text-green-600 font-medium">Free</span>
                  </div>
                  {paymentMethod === 'COD' && (
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>COD Charge</span>
                      <span>₹99</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-bold text-foreground border-t border-border pt-2">
                    <span>Total</span>
                    <span>₹{finalTotal}</span>
                  </div>
                </div>
              </div>

              <Button
                id="pay-now-btn"
                className="w-full h-12 font-semibold text-base"
                style={{ background: '#c9a45c', color: '#2d1b15' }}
                onClick={handlePayment}
                disabled={loading} // Temporarily removed serviceability check while pincode is disabled
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Processing…
                  </span>
                ) : (
                  paymentMethod === 'COD' ? `Place Order • ₹${finalTotal}` : `Pay ₹${finalTotal} Securely`
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Payments secured by Razorpay
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
