'use client';

import React, { useState } from 'react';
import {
  ANNAVEDAH_EMAIL_FLOWS,
  type EmailFlowId,
  type EmailFlowCategory,
  type EmailPayload,
} from '@/lib/email-templates';
import {
  Mail,
  Send,
  Copy,
  Code2,
  Sparkles,
  Search,
  Sliders,
  CheckCircle2,
  ChevronRight,
  RefreshCw,
  ShoppingBag,
  UserCheck,
  Heart,
  HelpCircle,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';

export default function EmailFlowsDashboard() {
  const allFlows = Object.values(ANNAVEDAH_EMAIL_FLOWS);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedFlowId, setSelectedFlowId] = useState<EmailFlowId>('welcome_email');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [testEmail, setTestEmail] = useState<string>('customer@example.com');
  const [copiedState, setCopiedState] = useState<string | null>(null);
  const [sendingState, setSendingState] = useState<string | null>(null);

  // Sample simulation payload
  const [formData, setFormData] = useState<EmailPayload>({
    customerName: 'Priya Sundaram',
    email: 'priya@example.com',
    orderId: 'AV-88492',
    productList: '1x Organic Moringa Powder (250g)\n2x Spun Tomato Powder (100g)',
    orderTotal: 484,
    otpCode: '849201',
    verificationLink: 'https://annavedah.com/auth/verify-otp?code=849201',
    trackingLink: 'https://annavedah.shiprocket.co/tracking/SR-998241',
    invoiceLink: 'https://annavedah.com/account/orders',
    reviewLink: 'https://annavedah.com/testimonials',
    reorderLink: 'https://annavedah.com/products',
    cartLink: 'https://annavedah.com/cart',
    discountCode: 'WELCOME10',
    paymentLink: 'https://annavedah.com/checkout?retry=AV-88492',
    refundAmount: 484,
    productName: 'Organic Moringa Powder (250g)',
    ticketId: 'TICK-9081',
    enquiryMessage: 'Interested in corporate bulk gifting boxes for Diwali.',
    adminReportDetails: 'Daily Revenue: ₹48,900 | Orders: 34 | Top Seller: Moringa Powder',
  });

  const categories: string[] = [
    'All',
    'Onboarding & Auth',
    'Order Lifecycle',
    'Post-Purchase & Loyalty',
    'Support & B2B',
    'Internal Admin',
  ];

  const filteredFlows = allFlows.filter((flow) => {
    const matchesCat = selectedCategory === 'All' || flow.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      flow.title.toLowerCase().includes(q) ||
      flow.subject.toLowerCase().includes(q) ||
      flow.id.toLowerCase().includes(q) ||
      flow.trigger.toLowerCase().includes(q) ||
      String(flow.flowNumber).includes(q);
    return matchesCat && matchesSearch;
  });

  const activeFlow = ANNAVEDAH_EMAIL_FLOWS[selectedFlowId] || allFlows[0];
  const liveHtml = activeFlow.renderHtml(formData, 'https://annavedah.com');

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedState(label);
    setTimeout(() => setCopiedState(null), 2000);
  };

  const handleSendTest = async () => {
    setSendingState('Sending…');
    try {
      const res = await fetch('/api/email/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flowId: activeFlow.id,
          recipient: testEmail,
          ...formData,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSendingState('Sent!');
      } else {
        setSendingState('Failed');
      }
    } catch {
      setSendingState('Error');
    } finally {
      setTimeout(() => setSendingState(null), 2500);
    }
  };

  const getCategoryIcon = (cat: EmailFlowCategory) => {
    switch (cat) {
      case 'Onboarding & Auth':
        return <UserCheck className="w-4 h-4 text-blue-600" />;
      case 'Order Lifecycle':
        return <ShoppingBag className="w-4 h-4 text-emerald-600" />;
      case 'Post-Purchase & Loyalty':
        return <Heart className="w-4 h-4 text-rose-600" />;
      case 'Support & B2B':
        return <HelpCircle className="w-4 h-4 text-purple-600" />;
      case 'Internal Admin':
        return <ShieldCheck className="w-4 h-4 text-amber-600" />;
      default:
        return <Mail className="w-4 h-4 text-[#8b1a1a]" />;
    }
  };

  return (
    <div className="space-y-8 w-full">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-br from-[#8b1a1a] via-[#6d1414] to-[#2d1b15] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-[#c9a45c]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 bg-[#c9a45c]/20 border border-[#c9a45c]/40 text-[#f5e6c8] px-3.5 py-1 rounded-full text-xs font-bold w-fit">
              <Mail className="w-3.5 h-3.5 text-[#c9a45c]" />
              <span>50-Flow Master Email Automation Suite</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Annavedah Foods Email Automation Suite
            </h1>
            <p className="text-sm text-amber-100/80 max-w-2xl">
              50 comprehensive email templates covering onboarding, order notifications, post-purchase reorders, abandoned cart recovery, B2B inquiries, and executive admin reports.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleSendTest}
              className="bg-[#c9a45c] hover:bg-[#b5914a] text-[#2d1b15] px-5 py-3 rounded-2xl font-bold text-sm shadow-lg transition-all flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{sendingState || `Dispatch Flow ${activeFlow.flowNumber} Test`}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Customer Journey Flow Map Visualizer */}
      <div className="bg-white rounded-3xl p-6 border border-[#e8ddd0] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#2d1b15] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#8b1a1a]" />
            <span>Recommended Customer Email Automation Journey</span>
          </h2>
          <span className="text-xs font-bold text-[#6b5347] bg-[#faf6f0] px-3 py-1 rounded-full border border-[#e8ddd0]">
            50 Master Templates
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 pt-2">
          {[
            { step: '1. Onboarding', flow: 'Flows 1–3, 42–45', icon: '🌿', color: 'border-blue-200 bg-blue-50/50' },
            { step: '2. COD / Paid Order', flow: 'Flows 4–7', icon: '🧾', color: 'border-emerald-200 bg-emerald-50/50' },
            { step: '3. Packed & Shipped', flow: 'Flows 8–11', icon: '🚚', color: 'border-purple-200 bg-purple-50/50' },
            { step: '4. Delivery & Review', flow: 'Flows 12–13', icon: '⭐', color: 'border-green-200 bg-green-50/50' },
            { step: '5. Reorder & Cart', flow: 'Flows 14–18', icon: '🔄', color: 'border-rose-200 bg-rose-50/50' },
            { step: '6. Support & Admin', flow: 'Flows 35–50', icon: '📊', color: 'border-amber-200 bg-amber-50/50' },
          ].map((item, idx) => (
            <div key={idx} className={`p-3 rounded-2xl border ${item.color} space-y-1 text-center`}>
              <span className="text-xl">{item.icon}</span>
              <p className="text-xs font-bold text-[#2d1b15] truncate">{item.step}</p>
              <p className="text-[11px] font-semibold text-[#6b5347]">{item.flow}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Category Tabs & Search Bar */}
      <div className="bg-white rounded-3xl p-4 border border-[#e8ddd0] shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#8b1a1a] text-white shadow-sm'
                  : 'bg-[#faf6f0] text-[#6b5347] hover:bg-[#e8ddd0]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72 shrink-0">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search 50 email flows..."
            className="w-full pl-9 pr-4 py-2 border border-[#e8ddd0] rounded-xl text-xs focus:outline-none focus:border-[#c9a45c]"
          />
        </div>
      </div>

      {/* Main Grid: Flow Selector + Live Preview & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Flow List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <h2 className="text-base font-bold text-[#2d1b15] px-1 flex items-center justify-between">
            <span>Email Flow Templates</span>
            <span className="text-xs font-semibold text-[#6b5347]">{filteredFlows.length} Flows</span>
          </h2>

          <div className="space-y-2.5 max-h-[800px] overflow-y-auto pr-1">
            {filteredFlows.map((flow) => {
              const isSelected = selectedFlowId === flow.id;
              return (
                <button
                  key={flow.id}
                  onClick={() => setSelectedFlowId(flow.id as EmailFlowId)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'border-[#8b1a1a] bg-[#8b1a1a]/5 shadow-md ring-1 ring-[#8b1a1a]'
                      : 'border-[#e8ddd0] bg-white hover:border-[#c9a45c] hover:bg-[#faf6f0]/40'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 ${
                      isSelected ? 'bg-[#8b1a1a] text-white border-[#8b1a1a]' : 'bg-[#faf6f0] border-[#e8ddd0]'
                    }`}>
                      {getCategoryIcon(flow.category)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                          isSelected ? 'bg-[#8b1a1a] text-white' : 'bg-[#faf6f0] text-[#6b5347] border border-[#e8ddd0]'
                        }`}>
                          FLOW {flow.flowNumber}
                        </span>
                        <span className="text-[11px] font-semibold text-[#8b1a1a] truncate">{flow.category}</span>
                      </div>
                      <h3 className="text-sm font-bold text-[#2d1b15] truncate mt-0.5">{flow.title}</h3>
                      <p className="text-xs text-[#6b5347] truncate">{flow.subject}</p>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? 'text-[#8b1a1a] translate-x-1' : 'text-gray-400'}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Live HTML Preview Window & Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Flow Meta Box */}
          <div className="bg-white rounded-3xl p-6 border border-[#e8ddd0] shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e8ddd0] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-[#8b1a1a] text-white text-xs font-extrabold px-2.5 py-1 rounded-lg">
                    FLOW {activeFlow.flowNumber}
                  </span>
                  <span className="text-xs font-semibold text-[#8b1a1a] bg-[#faf6f0] px-2.5 py-1 rounded-md border border-[#e8ddd0]">
                    {activeFlow.category}
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-[#2d1b15] mt-1">{activeFlow.title}</h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(activeFlow.subject, 'subject')}
                  className="px-3 py-2 bg-[#faf6f0] hover:bg-[#e8ddd0] text-[#2d1b15] rounded-xl text-xs font-bold border border-[#e8ddd0] flex items-center gap-1.5 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedState === 'subject' ? 'Copied Subject!' : 'Copy Subject'}</span>
                </button>

                <button
                  onClick={() => handleCopy(liveHtml, 'html')}
                  className="px-3 py-2 bg-[#faf6f0] hover:bg-[#e8ddd0] text-[#2d1b15] rounded-xl text-xs font-bold border border-[#e8ddd0] flex items-center gap-1.5 transition-colors"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>{copiedState === 'html' ? 'Copied HTML Code!' : 'Copy HTML Code'}</span>
                </button>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#8b1a1a] shrink-0">Subject Line:</span>
                <span className="font-mono bg-gray-100 px-2 py-1 rounded text-gray-800 border border-gray-200 truncate">{activeFlow.subject}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#8b1a1a] shrink-0">Trigger Condition:</span>
                <span className="text-[#2d1b15] font-medium">{activeFlow.trigger}</span>
              </div>
              <p className="text-[#6b5347]">{activeFlow.description}</p>
            </div>
          </div>

          {/* Live Email Render Frame */}
          <div className="bg-[#faf6f0] rounded-3xl p-4 sm:p-6 border border-[#e8ddd0] shadow-inner space-y-4">
            <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-2xl border border-[#e8ddd0] text-xs shadow-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                <span className="ml-2 font-mono font-medium">Annavedah HTML Email Previewer</span>
              </div>
              <span className="text-[#8b1a1a] font-bold">Flow #{activeFlow.flowNumber}</span>
            </div>

            <div className="bg-white rounded-2xl border border-[#e8ddd0] overflow-hidden shadow-sm">
              <iframe
                title="Email Preview"
                srcDoc={liveHtml}
                className="w-full h-[520px] border-0"
              />
            </div>

            {/* Test Send Bar */}
            <div className="bg-white p-4 rounded-2xl border border-[#e8ddd0] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Mail className="w-4 h-4 text-[#8b1a1a] shrink-0" />
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="Enter recipient email"
                  className="w-full sm:w-64 px-3 py-1.5 border border-gray-300 rounded-xl text-xs focus:outline-none focus:border-[#c9a45c]"
                />
              </div>

              <button
                onClick={handleSendTest}
                className="w-full sm:w-auto bg-[#8b1a1a] hover:bg-[#6d1414] text-white px-5 py-2 rounded-xl font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{sendingState || `Send Test to ${testEmail}`}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
