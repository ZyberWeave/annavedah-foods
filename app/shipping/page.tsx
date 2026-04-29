import type { Metadata } from 'next'
import { Truck, Clock, CreditCard, MapPin, AlertCircle, CheckCircle2, Info } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Shipping Policy | Annavedah Foods',
  description: 'Our policy regarding order processing, delivery timelines, and shipping charges at Annavedah Foods.',
}

export default function ShippingPage() {
  return (
    <div className="bg-[#faf6f0] min-h-screen pt-28 pb-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-3xl shadow-xl border border-[#e8ddd0] overflow-hidden">
          {/* Header */}
          <div className="bg-[#8b1a1a] p-8 md:p-12 text-white text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">Shipping Policy</h1>
            <p className="text-white/80 text-lg">Annavedah Foods</p>
          </div>

          <div className="p-8 md:p-12 space-y-12">
            {/* Introduction */}
            <section className="prose prose-lg text-[#6b5347] max-w-none text-center">
              <p>
                At Annavedah Foods, we ensure that every order is carefully packed and delivered 
                with the freshness and authenticity you expect from us.
              </p>
            </section>

            {/* Order Processing & Delivery */}
            <div className="grid md:grid-cols-2 gap-8">
              <section className="space-y-6 bg-[#faf6f0] p-8 rounded-3xl border border-[#e8ddd0]">
                <div className="flex items-center gap-4 text-[#8b1a1a]">
                  <Clock className="w-8 h-8" />
                  <h2 className="text-2xl font-bold">Order Processing</h2>
                </div>
                <ul className="space-y-4 text-[#6b5347]">
                  <li className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#c9a45c] shrink-0 mt-1" />
                    <span>All orders are processed within <strong>24–48 hours</strong> of confirmation.</span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#c9a45c] shrink-0 mt-1" />
                    <span>Orders placed on Sundays or public holidays will be processed on the next working day.</span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#c9a45c] shrink-0 mt-1" />
                    <span>Once shipped, you will receive tracking details via email/SMS.</span>
                  </li>
                </ul>
              </section>

              <section className="space-y-6 bg-[#faf6f0] p-8 rounded-3xl border border-[#e8ddd0]">
                <div className="flex items-center gap-4 text-[#8b1a1a]">
                  <Truck className="w-8 h-8" />
                  <h2 className="text-2xl font-bold">Delivery Timeline</h2>
                </div>
                <div className="space-y-4 text-[#6b5347]">
                  <p>
                    Orders are typically delivered within <strong>3–5 business days</strong>, depending on your location.
                  </p>
                  <div className="p-4 bg-white rounded-xl border border-[#e8ddd0] flex gap-3 italic text-sm">
                    <Info className="w-5 h-5 text-[#c9a45c] shrink-0" />
                    <p>Timelines may vary for remote areas or due to unforeseen circumstances.</p>
                  </div>
                </div>
              </section>
            </div>

            {/* Shipping Charges & COD */}
            <section className="space-y-6">
              <h2 className="text-2xl font-bold text-[#2d1b15] text-center">Shipping & Payments</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white border-2 border-[#c9a45c]/20 p-6 rounded-2xl flex flex-col items-center text-center space-y-3">
                  <div className="w-12 h-12 bg-[#c9a45c]/10 rounded-full flex items-center justify-center text-[#c9a45c]">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg">Shipping Charges</h3>
                  <p className="text-[#6b5347] text-sm">
                    <strong>FREE shipping</strong> on orders above ₹499. For orders below this, charges are calculated at checkout.
                  </p>
                </div>

                <div className="bg-white border-2 border-[#8b1a1a]/20 p-6 rounded-2xl flex flex-col items-center text-center space-y-3">
                  <div className="w-12 h-12 bg-[#8b1a1a]/10 rounded-full flex items-center justify-center text-[#8b1a1a]">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg">Cash on Delivery (COD)</h3>
                  <p className="text-[#6b5347] text-sm">
                    Available at an additional charge applied by our logistics partners for handling.
                  </p>
                </div>
              </div>
            </section>

            {/* Service Availability */}
            <section className="bg-[#f0e8dc]/30 rounded-3xl p-8 border border-[#e8ddd0] flex flex-col md:flex-row gap-8 items-center">
              <div className="shrink-0">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-[#8b1a1a] shadow-sm">
                  <MapPin className="w-10 h-10" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-[#2d1b15]">Service Availability</h2>
                <p className="text-[#6b5347]">
                  We currently deliver <strong>across India</strong>. In rare cases where a location is not serviceable, our team will inform you and process a suitable resolution.
                </p>
              </div>
            </section>

            {/* Important Information */}
            <section className="space-y-6">
              <div className="flex items-center gap-4 text-[#8b1a1a]">
                <AlertCircle className="w-8 h-8" />
                <h2 className="text-2xl font-bold">Important Information</h2>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-[#e8ddd0] space-y-4 text-[#6b5347]">
                <ul className="list-disc pl-5 space-y-3">
                  <li>Please ensure that your shipping address and contact details are accurate to avoid delays.</li>
                  <li>Annavedah Foods is not responsible for delays caused by courier partners, natural conditions, or unforeseen logistical issues.</li>
                  <li>If a delivery fails due to incorrect details or unavailability, re-shipping charges may apply.</li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
