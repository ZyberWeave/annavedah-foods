import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms & Conditions | Annavedah Foods',
  description: 'Terms and conditions for using Annavedah Foods website and services.',
}

export default function TermsPage() {
  return (
    <div className="bg-[#faf6f0] min-h-screen site-page-gap pb-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-3xl shadow-xl border border-[#e8ddd0] p-8 md:p-12 space-y-8 text-[#6b5347]">
          <h1 className="text-3xl md:text-5xl font-bold text-[#2d1b15] text-center border-b border-[#e8ddd0] pb-8">Terms & Conditions</h1>
          
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-[#8b1a1a]">1. Acceptance of Terms</h2>
            <p>By accessing and using this website, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use this site.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-[#8b1a1a]">2. Product Information</h2>
            <p>We strive to provide accurate information about our pure grains, pulses, and powders. However, actual packaging and materials may contain more or different information than that shown on our website.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-[#8b1a1a]">3. Pricing and Payments</h2>
            <p>All prices are in Indian Rupees (INR). We reserve the right to change prices at any time. Payments are processed securely via our payment gateway partners (Razorpay).</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-[#8b1a1a]">4. Shipping & Delivery</h2>
            <p>We ship across India. Delivery times are estimates and not guarantees. We are not responsible for delays caused by shipping partners.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-[#8b1a1a]">5. Intellectual Property</h2>
            <p>All content on this site, including text, graphics, logos, and images, is the property of Annavedah Foods and protected by copyright laws.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-[#8b1a1a]">6. Governing Law</h2>
            <p>These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Maharashtra.</p>
          </section>

          <div className="pt-8 border-t border-[#e8ddd0] text-center italic text-sm">
            Last updated: April 2026
          </div>
        </div>
      </div>
    </div>
  )
}
