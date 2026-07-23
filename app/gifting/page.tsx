'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { products, type Product } from '@/lib/content';
import { useCart } from '@/components/cart-context';
import Breadcrumbs from '@/components/Breadcrumbs';

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
    image: '/Banners/home-hero-bg.webp',
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
    image: '/Banners/shop-hero.png',
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
    image: '/product-bg.webp',
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

  const handleAddCustomBoxToCart = () => {
    if (customItems.length === 0) return;
    // Add items to cart
    customItems.forEach((item) => add(item.id));
    setAddedBoxSuccess(true);
    setTimeout(() => setAddedBoxSuccess(false), 3000);
  };

  const handleSubmitCorporateInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    setCorpSuccess(true);
    setTimeout(() => setCorpSuccess(false), 5000);
    setCorpName('');
    setCorpEmail('');
    setCorpPhone('');
    setCorpMsg('');
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
              href="#box-builder"
              className="bg-white text-[#2d1b15] hover:bg-[#f0e8dc] font-extrabold text-xs px-6 py-3.5 rounded-xl uppercase tracking-wider transition-all"
            >
              BUILD YOUR OWN GIFT BOX
            </a>
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
                <div className="p-6 space-y-4">
                  <span className="bg-[#8b1a1a] text-white text-[9px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full inline-block">
                    {g.badge}
                  </span>

                  <h3 className="text-xl font-extrabold text-[#2d1b15]">{g.name}</h3>
                  <p className="text-xs text-[#6b5347] font-medium leading-relaxed">
                    {g.description}
                  </p>

                  <div className="bg-[#faf6f0] p-4 rounded-2xl space-y-2 border border-[#e8ddd0]">
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

                <div className="p-6 pt-0 border-t border-[#e8ddd0] bg-gray-50 flex items-center justify-between mt-4">
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

        {/* ════════════ CUSTOM GIFT BOX BUILDER ════════════ */}
        <section id="box-builder" className="bg-white rounded-3xl p-6 sm:p-10 border-2 border-[#e8ddd0] shadow-xl space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="bg-[#c9a45c] text-black text-[10px] font-extrabold uppercase tracking-widest px-3.5 py-1 rounded-full inline-block">
              BUILD-A-BOX CUSTOMIZER
            </span>
            <h2 className="text-3xl font-extrabold text-[#2d1b15]">
              Create Your Personal Gift Box
            </h2>
            <p className="text-xs sm:text-sm text-[#6b5347]">
              Choose your box style, handpick up to 6 organic items, and include a personal message.
            </p>
          </div>

          {/* STEP 1: CHOOSE PACKAGING */}
          <div className="space-y-3">
            <label className="block text-xs font-extrabold text-[#2d1b15] uppercase tracking-wider">
              STEP 1: SELECT GIFT PACKAGING STYLE
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {GIFT_PACKAGING_OPTIONS.map((box) => (
                <div
                  key={box.id}
                  onClick={() => setSelectedBox(box)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    selectedBox.id === box.id
                      ? 'border-[#8b1a1a] bg-[#8b1a1a]/5 ring-1 ring-[#8b1a1a]'
                      : 'border-[#e8ddd0] bg-white hover:border-[#c9a45c]'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-bold text-[#2d1b15]">{box.name}</h4>
                    <span className="text-xs font-mono font-bold text-[#8b1a1a]">+₹{box.price}</span>
                  </div>
                  <p className="text-xs text-[#6b5347] font-medium">{box.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* STEP 2: SELECT PRODUCTS */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-extrabold text-[#2d1b15] uppercase tracking-wider">
                STEP 2: HANDPICK ITEMS (SELECTED {customItems.length}/6)
              </label>
              <span className="text-xs font-mono font-bold text-[#6b5347]">
                ITEMS TOTAL: ₹{customItemsTotal}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-72 overflow-y-auto p-1 hide-scrollbar">
              {products.slice(0, 8).map((p) => {
                const isSelected = customItems.some((item) => item.id === p.id);
                return (
                  <div
                    key={p.id}
                    onClick={() => toggleCustomItem(p)}
                    className={`p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#8b1a1a] bg-[#8b1a1a] text-white shadow-md'
                        : 'border-[#e8ddd0] bg-white text-[#2d1b15] hover:border-[#c9a45c]'
                    }`}
                  >
                    <h5 className="text-xs font-bold truncate">{p.name}</h5>
                    <p className={`text-[11px] font-mono font-bold ${isSelected ? 'text-amber-200' : 'text-[#8b1a1a]'}`}>
                      ₹{p.price}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 3: RECIPIENT MESSAGE & ADD TO CART */}
          <div className="space-y-4 pt-4 border-t border-[#e8ddd0]">
            <div>
              <label className="block text-xs font-extrabold text-[#2d1b15] uppercase tracking-wider mb-1">
                STEP 3: PERSONAL GIFT MESSAGE CARD (OPTIONAL)
              </label>
              <input
                type="text"
                maxLength={120}
                placeholder="Write a message for the recipient..."
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                className="w-full border-2 border-[#e8ddd0] rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-[#8b1a1a]"
              />
            </div>

            <div className="bg-[#faf6f0] p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-[#e8ddd0]">
              <div>
                <span className="text-xs text-[#6b5347] font-bold uppercase tracking-wider block">
                  CUSTOM GIFT BOX TOTAL PRICE:
                </span>
                <span className="text-3xl font-extrabold text-[#8b1a1a] font-mono">
                  ₹{customBoxTotalPrice}
                </span>
                <span className="text-[10px] text-gray-500 block font-medium">
                  ({selectedBox.name} + {customItems.length} items)
                </span>
              </div>

              <button
                onClick={handleAddCustomBoxToCart}
                disabled={customItems.length === 0}
                className="w-full sm:w-auto bg-[#8b1a1a] hover:bg-[#6d1414] disabled:bg-gray-300 text-white font-extrabold text-xs px-8 py-4 rounded-xl uppercase tracking-wider shadow transition-all"
              >
                {addedBoxSuccess ? 'ADDED TO CART ✓' : 'ADD CUSTOM GIFT BOX TO CART'}
              </button>
            </div>
          </div>
        </section>

        {/* ════════════ CORPORATE BULK GIFTING INQUIRY ════════════ */}
        <section className="bg-[#2d1b15] text-white rounded-3xl p-6 sm:p-10 border-2 border-[#e8ddd0] shadow-xl space-y-6">
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
              <input
                type="email"
                required
                placeholder="Work Email Address *"
                value={corpEmail}
                onChange={(e) => setCorpEmail(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-amber-400"
              />
              <input
                type="tel"
                required
                placeholder="Phone Number *"
                value={corpPhone}
                onChange={(e) => setCorpPhone(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-amber-400"
              />
              <input
                type="number"
                required
                placeholder="Estimated Boxes (e.g. 50, 200) *"
                value={corpQty}
                onChange={(e) => setCorpQty(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-amber-400"
              />
              <textarea
                rows={2}
                placeholder="Special requirements or custom branding notes..."
                value={corpMsg}
                onChange={(e) => setCorpMsg(e.target.value)}
                className="sm:col-span-2 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                className="sm:col-span-2 bg-[#8b1a1a] hover:bg-[#6d1414] text-white font-extrabold text-xs py-3.5 rounded-xl uppercase tracking-wider shadow transition-all"
              >
                SUBMIT CORPORATE GIFTING REQUEST
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
