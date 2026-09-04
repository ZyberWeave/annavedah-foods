'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { products, type Product } from '@/lib/content';
import { useCart } from '@/components/cart-context';
import Breadcrumbs from '@/components/Breadcrumbs';
import { validateEmail } from '@/lib/validations';

const GIFT_PACKAGING_OPTIONS = [
  { id: 'heritage-wood', name: 'Heritage Carved Wooden Box', price: 299, desc: 'Handcrafted royal wooden gift box with velvet lining.' },
  { id: 'eco-artisan', name: 'Eco Artisan Ribbon Box', price: 149, desc: 'Recycled handmade paper box wrapped with jute string.' },
  { id: 'festive-gold', name: 'Festive Gold Foil Box', price: 199, desc: 'Embossed gold foil decorative box ideal for celebrations.' },
];

const PRE_CURATED_GIFTS = [
  {
    id: 'gift-101',
    name: 'Superfood Wellness Gift Box',
    slug: 'superfood-wellness-gift-box',
    price: 899,
    originalPrice: 1099,
    badge: 'BESTSELLER HAMPER',
    image: '/gifting/wellness-gift-box.webp',
    description: 'A curated boost of organic Moringa, Wild Turmeric, and Amla powder packed in a premium gift box.',
    items: ['Moringa Powder (250g)', 'Turmeric Powder (250g)', 'Amla Powder (250g)'],
  },
  {
    id: 'gift-102',
    name: 'Heritage Organic Spices & Grains Hamper',
    slug: 'heritage-organic-hampers',
    price: 1499,
    originalPrice: 1799,
    badge: 'FESTIVE SPECIAL',
    image: '/gifting/heritage-grains-hamper.webp',
    description: 'Farm-fresh unpolished pulses, organic jaggery powder, and heritage grains for festive gifting.',
    items: ['Unpolished Toor Dal (1kg)', 'Organic Jaggery Powder (500g)', 'Heritage Rice (1kg)'],
  },
  {
    id: 'gift-103',
    name: 'Corporate Executive Wellness Set',
    slug: 'corporate-executive-wellness-set',
    price: 2199,
    originalPrice: 2699,
    badge: 'CORPORATE GIFTING',
    image: '/gifting/corporate-wellness-set.webp',
    description: 'Exclusive luxury box featuring handcrafted copper bottle, organic immunity powders, and dry fruits.',
    items: ['Copper Water Bottle (750ml)', 'Moringa Powder (250g)', 'Organic Honey (500g)', 'Wild Turmeric (250g)'],
  },
];

export default function GiftingPage() {
  const { add } = useCart();
  const [selectedBox, setSelectedBox] = useState(GIFT_PACKAGING_OPTIONS[0]);
  const [customItems, setCustomItems] = useState<Product[]>([]);
  const [customNote, setCustomNote] = useState('');
  const [addedBoxSuccess, setAddedBoxSuccess] = useState(false);

  // Corporate inquiry form
  const [corpName, setCorpName] = useState('');
  const [corpEmail, setCorpEmail] = useState('');
  const [corpPhone, setCorpPhone] = useState('');
  const [corpQty, setCorpQty] = useState('50');
  const [corpMsg, setCorpMsg] = useState('');
  const [corpSuccess, setCorpSuccess] = useState(false);
  const [corpSubmitting, setCorpSubmitting] = useState(false);
  const [corpError, setCorpError] = useState('');

  const toggleCustomItem = (p: Product) => {
    if (customItems.some((item) => item.id === p.id)) {
      setCustomItems(customItems.filter((item) => item.id !== p.id));
    } else {
      if (customItems.length >= 6) return;
      setCustomItems([...customItems, p]);
    }
  };

  const customItemsTotal = customItems.reduce((sum, item) => sum + item.price, 0);
  const customBoxTotalPrice = selectedBox.price + customItemsTotal;
  const corporateEmailValidation = validateEmail(corpEmail);
  const showCorporateEmailError = corpEmail.length > 0 && !corporateEmailValidation.valid;

  const handleAddCustomBoxToCart = () => {
    if (customItems.length === 0) return;
    // Add items to cart
    customItems.forEach((item) => add(item.id));
    setAddedBoxSuccess(true);
    setTimeout(() => setAddedBoxSuccess(false), 3000);
  };

  const handleSubmitCorporateInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setCorpError('');

    const emailValidation = validateEmail(corpEmail);
    if (!emailValidation.valid) {
      setCorpError(emailValidation.message);
      return;
    }

    setCorpSubmitting(true);

    try {
      const quantity = Number(corpQty);
      if (!Number.isInteger(quantity) || quantity < 1) {
        throw new Error('Please enter a valid number of gift boxes.');
      }

      const requirements = corpMsg.trim() || 'No additional requirements provided.';
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: corpName.trim(),
          email: corpEmail.trim(),
          phone: corpPhone,
          company: corpName.trim(),
          reason: 'Corporate gifting inquiry',
          message: `Estimated gift boxes: ${quantity}\n\nRequirements: ${requirements}`,
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || 'Could not submit your inquiry. Please try again.');
      }

      setCorpSuccess(true);
      setCorpName('');
      setCorpEmail('');
      setCorpPhone('');
      setCorpQty('50');
      setCorpMsg('');
    } catch (error) {
      setCorpError(error instanceof Error ? error.message : 'Could not submit your inquiry. Please try again.');
    } finally {
      setCorpSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf6f0] pb-16 space-y-12">
      {/* ════════════ HERO BANNER ════════════ */}
      <section className="relative bg-[#2d1b15] text-white py-16 px-4 sm:px-6 lg:px-8 border-b-2 border-[#e8ddd0] overflow-hidden">
        <div className="max-w-6xl mx-auto text-center space-y-4 relative z-10">
          <span className="bg-[#8b1a1a] text-white text-[10px] font-extrabold uppercase tracking-widest px-4 py-1.5 rounded-full inline-block">
            HERITAGE GIFTING & CORPORATE HAMPERS
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Thoughtfully Curated Organic Gifts
          </h1>
          <p className="text-gray-300 text-sm sm:text-base max-w-2xl mx-auto font-medium">
            Celebrate festivities, corporate milestones, and family moments with farm-sourced organic superfoods wrapped in heritage packaging.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <a
              href="#pre-curated"
              className="bg-[#8b1a1a] hover:bg-[#6d1414] text-white font-extrabold text-xs px-6 py-3.5 rounded-xl uppercase tracking-wider transition-all"
            >
              EXPLORE PRE-SET HAMPERS
            </a>
            <a
              href="#corporate"
              className="bg-white text-[#2d1b15] hover:bg-[#f0e8dc] font-extrabold text-xs px-6 py-3.5 rounded-xl uppercase tracking-wider transition-all"
            >
              CORPORATE BULK INQUIRY
            </a>
          </div>
          <div className="mt-8 max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-2xl border-4 border-[#e8ddd0]/20 relative group">
            <Image
              src="/gifting-hamper.jpg"
              alt="Annavedah Foods Signature Luxury Gift Hamper Box"
              width={1200}
              height={600}
              className="w-full h-64 sm:h-80 md:h-96 object-cover transform group-hover:scale-105 transition-transform duration-700"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-6 sm:p-8">
              <div className="text-left space-y-1">
                <span className="bg-[#8b1a1a] text-white text-[9px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full inline-block">
                  SIGNATURE LUXURY COLLECTION
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                  Handcrafted Superfood Gift Hampers
                </h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <Breadcrumbs items={[{ label: 'Gifting & Hampers' }]} />

        {/* ════════════ PRE-CURATED GIFT HAMPERS ════════════ */}
        <section id="pre-curated" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[#e8ddd0] pb-4 gap-2">
            <div>
              <span className="text-[#8b1a1a] text-xs font-extrabold uppercase tracking-widest">
                SIGNATURE SELECTION
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2d1b15]">
                Curated Festive Gift Hampers
              </h2>
            </div>
            <p className="text-xs text-[#6b5347] font-medium">
              Ready-to-ship hampers with customized gift card notes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PRE_CURATED_GIFTS.map((g) => (
              <div
                key={g.id}
                className="bg-white rounded-3xl border-2 border-[#e8ddd0] overflow-hidden shadow-lg hover:border-[#8b1a1a] transition-all flex flex-col justify-between"
              >
                <div className="relative h-52 w-full overflow-hidden bg-gray-100">
                  <Image
                    src={g.image}
                    alt={g.name}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="bg-[#8b1a1a] text-white text-[9px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full inline-block shadow">
                      {g.badge}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="text-xl font-extrabold text-[#2d1b15] md:min-h-[3.5rem]">{g.name}</h3>
                    <p className="text-xs text-[#6b5347] font-medium leading-relaxed md:min-h-12">
                      {g.description}
                    </p>
                  </div>

                  <div className="bg-[#faf6f0] p-4 rounded-2xl space-y-2 border border-[#e8ddd0] md:min-h-[10.5rem]">
                    <span className="text-[10px] font-extrabold text-[#2d1b15] uppercase tracking-wider block">
                      INCLUDED IN THIS HAMPER:
                    </span>
                    <ul className="text-xs text-[#6b5347] space-y-1 font-medium">
                      {g.items.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#8b1a1a]" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-[#e8ddd0] bg-gray-50 flex items-center justify-between mt-4">
                  <div>
                    <span className="text-xs text-gray-400 line-through mr-2">₹{g.originalPrice}</span>
                    <span className="text-2xl font-extrabold text-[#8b1a1a]">₹{g.price}</span>
                  </div>

                  <button
                    onClick={() => add(products[0]?.id || 1)}
                    className="bg-[#2d1b15] hover:bg-[#8b1a1a] text-white font-extrabold text-xs px-5 py-3 rounded-xl uppercase tracking-wider transition-all"
                  >
                    ADD TO CART
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ════════════ CORPORATE BULK GIFTING INQUIRY ════════════ */}
        <section id="corporate" className="scroll-mt-[calc(var(--site-header-offset)+1rem)] bg-[#2d1b15] text-white rounded-3xl p-6 sm:p-10 border-2 border-[#e8ddd0] shadow-xl space-y-6">
          <div className="max-w-xl space-y-2">
            <span className="bg-amber-500 text-black text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full inline-block">
              CORPORATE & BULK ORDERS
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold">
              Need Custom Branding & Multi-Address Delivery?
            </h2>
            <p className="text-xs text-gray-300">
              We offer corporate logo printing on wooden gift boxes, customized greeting cards, and bulk doorstep dispatch across India.
            </p>
          </div>

          {corpSuccess ? (
            <div className="p-4 bg-green-900/60 border border-green-500 text-green-200 rounded-2xl text-xs font-bold uppercase tracking-wider">
              INQUIRY SUBMITTED! OUR CORPORATE GIFTING TEAM WILL REACH OUT WITHIN 2 HOURS.
            </div>
          ) : (
            <form onSubmit={handleSubmitCorporateInquiry} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                required
                placeholder="Company / Contact Name *"
                value={corpName}
                onChange={(e) => setCorpName(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-amber-400"
              />
              <div>
                <input
                  type="email"
                  required
                  placeholder="Work Email Address *"
                  value={corpEmail}
                  onChange={(e) => setCorpEmail(e.target.value)}
                  aria-invalid={showCorporateEmailError}
                  aria-describedby={showCorporateEmailError ? 'corporate-email-error' : undefined}
                  className={`w-full bg-white/10 border rounded-xl px-4 py-3 text-xs text-white placeholder-gray-400 focus:outline-none ${showCorporateEmailError ? 'border-red-400 focus:border-red-400' : 'border-white/20 focus:border-amber-400'}`}
                />
                {showCorporateEmailError && (
                  <p id="corporate-email-error" className="mt-1.5 text-xs font-semibold text-red-300">
                    {corporateEmailValidation.message}
                  </p>
                )}
              </div>
              <input
                type="tel"
                required
                placeholder="Phone Number *"
                value={corpPhone}
                onChange={(e) => setCorpPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                inputMode="numeric"
                minLength={10}
                maxLength={10}
                pattern="[0-9]{10}"
                title="Enter a 10-digit phone number"
                className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-amber-400"
              />
              <div className="relative">
                <label
                  htmlFor="corporate-estimated-boxes"
                  className="pointer-events-none absolute left-4 top-2 text-[10px] font-semibold text-gray-300"
                >
                  Estimated number of gift boxes *
                </label>
                <input
                  id="corporate-estimated-boxes"
                  type="number"
                  required
                  min={1}
                  step={1}
                  placeholder="e.g. 50, 200"
                  value={corpQty}
                  onChange={(e) => setCorpQty(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 pb-2 pt-6 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-amber-400"
                />
              </div>
              <textarea
                rows={2}
                placeholder="Special requirements or custom branding notes..."
                value={corpMsg}
                onChange={(e) => setCorpMsg(e.target.value)}
                className="sm:col-span-2 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                disabled={corpSubmitting}
                className="sm:col-span-2 bg-[#8b1a1a] hover:bg-[#6d1414] disabled:cursor-not-allowed disabled:opacity-60 text-white font-extrabold text-xs py-3.5 rounded-xl uppercase tracking-wider shadow transition-all"
              >
                {corpSubmitting ? 'SUBMITTING REQUEST…' : 'SUBMIT CORPORATE GIFTING REQUEST'}
              </button>
              {corpError && (
                <p role="alert" className="sm:col-span-2 text-sm font-semibold text-red-300">
                  {corpError}
                </p>
              )}
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
