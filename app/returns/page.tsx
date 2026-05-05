import type { Metadata } from 'next'
import { Undo2, Ban, HelpCircle, Mail, Phone, Clock, FileText, CheckCircle2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Cancellation, Return & Refund Policy | Annavedah Foods',
  description: 'Our policy regarding order cancellations, returns, and refunds at Annavedah Foods.',
}

export default function ReturnsPage() {
  return (
    <div className="bg-[#faf6f0] min-h-screen pt-[120px] lg:pt-[190px] pb-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-3xl shadow-xl border border-[#e8ddd0] overflow-hidden">
          {/* Header */}
          <div className="bg-[#8b1a1a] p-8 md:p-12 text-white text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">Cancellation, Return & Refund Policy</h1>
            <p className="text-white/80 text-lg">Annavedah Foods</p>
          </div>

          <div className="p-8 md:p-12 space-y-12">
            {/* Introduction */}
            <section className="prose prose-lg text-[#6b5347] max-w-none">
              <p>
                At Annavedah Foods, we take pride in delivering authentic, high-quality food products.
                Due to the perishable and consumable nature of our offerings, we follow a carefully structured
                cancellation and return policy to maintain hygiene, quality, and fairness.
              </p>
            </section>

            {/* Order Cancellation */}
            <section className="space-y-6">
              <div className="flex items-center gap-4 text-[#8b1a1a]">
                <Ban className="w-8 h-8" />
                <h2 className="text-2xl font-bold">Order Cancellation</h2>
              </div>
              <div className="bg-[#faf6f0] rounded-2xl p-6 border border-[#e8ddd0] space-y-4">
                <ul className="space-y-3 text-[#6b5347]">
                  <li className="flex gap-3">
                    <Clock className="w-5 h-5 text-[#c9a45c] shrink-0 mt-1" />
                    <span>Orders can be cancelled within <strong>6 hours</strong> of placing the order.</span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#c9a45c] shrink-0 mt-1" />
                    <span>Once the order is processed or dispatched, cancellation will not be possible.</span>
                  </li>
                </ul>

                <div className="mt-6">
                  <h3 className="font-bold text-[#2d1b15] mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#8b1a1a]" />
                    Cancellation Charges:
                  </h3>
                  <div className="grid gap-3">
                    {[
                      { label: 'If cancelled before processing', value: '5% transaction fee will be deducted' },
                      { label: 'If cancelled after processing but before dispatch', value: '10% processing fee will be deducted' },
                      { label: 'If shipping has already been arranged', value: 'Shipping charges will also be deducted' },
                    ].map((charge, i) => (
                      <div key={i} className="flex justify-between items-center py-2 border-b border-[#e8ddd0] last:border-0 text-sm gap-3">
                        <span className="text-[#6b5347]">{charge.label}</span>
                        <span className="font-semibold text-[#8b1a1a] text-right">{charge.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 p-4 bg-[#8b1a1a]/5 rounded-xl border border-[#8b1a1a]/10">
                  <h3 className="font-bold text-[#8b1a1a] mb-2">Cancellation After Dispatch</h3>
                  <p className="text-sm text-[#6b5347]">
                    If you request cancellation after the order has been shipped, the refund (if applicable)
                    will be processed after deducting both forward and return shipping charges.
                  </p>
                </div>
              </div>
            </section>

            {/* Returns & Replacements */}
            <section className="space-y-6">
              <div className="flex items-center gap-4 text-[#8b1a1a]">
                <Undo2 className="w-8 h-8" />
                <h2 className="text-2xl font-bold">Returns & Replacements</h2>
              </div>
              <div className="space-y-4">
                <p className="text-[#6b5347] italic">Due to food safety and hygiene standards:</p>
                <p className="text-[#6b5347]">We offer replacement or refund only in the following cases:</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    'Damaged or leaking product',
                    'Spoiled or expired product',
                    'Incorrect item delivered',
                  ].map((item, i) => (
                    <div key={i} className="bg-white border border-[#e8ddd0] p-4 rounded-xl flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#c9a45c]" />
                      <span className="text-[#2d1b15] font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#f0e8dc]/30 rounded-2xl p-6 border border-[#e8ddd0] space-y-4">
                <h3 className="font-bold text-[#2d1b15] flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-[#c9a45c]" />
                  Reporting an Issue
                </h3>
                <div className="space-y-4 text-[#6b5347]">
                  <p>Customers must report any issue within <strong>24 hours</strong> of delivery.</p>
                  <div className="space-y-2">
                    <p className="font-semibold">Please share:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Clear photos/videos of the product</li>
                      <li>Order details</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-[#8b1a1a]/5 rounded-2xl p-6 border border-[#8b1a1a]/20 text-[#6b5347]">
                <h3 className="font-bold text-[#8b1a1a] mb-2">Damages & Issues</h3>
                <p>
                  We request you to inspect your order at the time of delivery. If the item is defective, damaged,
                  or incorrect, please notify us immediately so we can resolve the issue promptly.
                </p>
              </div>
            </section>

            {/* Refund Policy */}
            <section className="space-y-6">
              <div className="flex items-center gap-4 text-[#8b1a1a]">
                <CheckCircle2 className="w-8 h-8" />
                <h2 className="text-2xl font-bold">Refund Policy</h2>
              </div>
              <div className="bg-[#faf6f0] rounded-2xl p-6 border border-[#e8ddd0] space-y-4 text-[#6b5347]">
                <ul className="list-disc pl-5 space-y-2">
                  <li>Refunds are applicable only for approved cases (damage, defect, wrong product) and can be returned within <strong>4 working days</strong> from the day of delivery.</li>
                  <li>Once approved, refunds will be processed within <strong>7-15 business days</strong>.</li>
                  <li>The amount will be credited to your original payment method.</li>
                </ul>
              </div>
            </section>

            {/* Contact */}
            <section className="bg-[#8b1a1a] text-white rounded-3xl p-8 md:p-10 text-center space-y-6">
              <h2 className="text-2xl md:text-3xl font-bold">Contact Us</h2>
              <p className="text-white/80">For support, please reach out using the details below.</p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <a href="mailto:support@annavedah.com" className="flex items-center gap-2 hover:text-[#c9a45c] transition-colors">
                  <Mail className="w-5 h-5" />
                  <span>support@annavedah.com</span>
                </a>
                <div className="hidden sm:block w-px h-6 bg-white/20" />
                <a href="tel:+919763456100" className="flex items-center gap-2 hover:text-[#c9a45c] transition-colors">
                  <Phone className="w-5 h-5" />
                  <span>+91 97634 56100</span>
                </a>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
