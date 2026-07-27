'use client';

import React, { useState } from 'react';
import {
  ANNAVEDAH_WHATSAPP_FLOWS,
  buildWhatsAppMessage,
  buildWhatsAppWebUrl,
  buildWhatsAppApiPayload,
  type WhatsAppFlowId,
  type WhatsAppPayload,
} from '@/lib/whatsapp-automation';
import {
  MessageSquare,
  CheckCircle2,
  Copy,
  ExternalLink,
  Send,
  Sparkles,
  PhoneCall,
  RefreshCw,
  Sliders,
  ChevronRight,
  Bot,
  Truck,
  Star,
  ShoppingBag,
  RotateCcw,
  XCircle,
  Clock,
  Code2,
} from 'lucide-react';

export default function WhatsAppAutomationDashboard() {
  const flowList = Object.values(ANNAVEDAH_WHATSAPP_FLOWS);
  const [selectedFlowId, setSelectedFlowId] = useState<WhatsAppFlowId>('cod_order_confirmation');
  const [testPhone, setTestPhone] = useState('9876543210');
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // Test form data
  const [formData, setFormData] = useState<WhatsAppPayload>({
    customerName: 'Rohit Sharma',
    customerPhone: '9876543210',
    orderId: 'AV-98412',
    productList: '1x Organic Moringa Powder (250g)\n2x Spun Tomato Powder (100g)',
    orderTotal: 484,
    trackingLink: 'https://annavedah.shiprocket.co/tracking/SR-998241',
    reviewLink: 'https://annavedah.com/testimonials',
    websiteLink: 'https://annavedah.com',
    cartLink: 'https://annavedah.com/cart',
    paymentLink: 'https://annavedah.com/checkout?retry=AV-98412',
  });

  const activeFlow = ANNAVEDAH_WHATSAPP_FLOWS[selectedFlowId];
  const liveMessage = buildWhatsAppMessage(selectedFlowId, formData);
  const liveWebUrl = buildWhatsAppWebUrl(testPhone, selectedFlowId, formData);
  const liveApiPayload = buildWhatsAppApiPayload(testPhone, selectedFlowId, formData);

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const getFlowIcon = (id: WhatsAppFlowId) => {
    switch (id) {
      case 'cod_order_confirmation':
      case 'order_confirmed':
      case 'prepaid_order_confirmed':
        return <ShoppingBag className="w-4 h-4 text-emerald-600" />;
      case 'order_shipped':
      case 'out_for_delivery':
        return <Truck className="w-4 h-4 text-blue-600" />;
      case 'order_delivered':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'review_request':
        return <Star className="w-4 h-4 text-amber-500" />;
      case 'reorder_reminder':
        return <RotateCcw className="w-4 h-4 text-purple-600" />;
      case 'abandoned_cart':
        return <Clock className="w-4 h-4 text-orange-500" />;
      case 'order_cancelled':
      case 'payment_failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Bot className="w-4 h-4 text-[#8b1a1a]" />;
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
              <Bot className="w-3.5 h-3.5 text-[#c9a45c]" />
              <span>D2C WhatsApp Messaging Suite</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Annavedah WhatsApp Automation Flows
            </h1>
            <p className="text-sm text-amber-100/80 max-w-2xl">
              12 fully-crafted WhatsApp automation workflows for order updates, COD verification, live delivery tracking, review solicitation, and abandoned cart recovery.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={liveWebUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-3 rounded-2xl font-bold text-sm shadow-lg hover:shadow-emerald-500/30 transition-all flex items-center gap-2 shrink-0"
            >
              <Send className="w-4 h-4" />
              <span>Test Current Flow on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {/* Customer Journey Flowchart Visualizer */}
      <div className="bg-white rounded-3xl p-6 border border-[#e8ddd0] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#2d1b15] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#8b1a1a]" />
            <span>Recommended Customer Automation Sequence</span>
          </h2>
          <span className="text-xs font-bold text-[#6b5347] bg-[#faf6f0] px-3 py-1 rounded-full border border-[#e8ddd0]">
            12 End-to-End Triggers
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 pt-2">
          {[
            { step: '1. Order Placed', flow: 'COD / Prepaid', icon: '🛒', color: 'border-emerald-200 bg-emerald-50/50' },
            { step: '2. COD / Paid', flow: 'Flow 1, 2, 3', icon: '⚡', color: 'border-blue-200 bg-blue-50/50' },
            { step: '3. Shipped', flow: 'Flow 4 (Live Tracking)', icon: '🚚', color: 'border-purple-200 bg-purple-50/50' },
            { step: '4. Out for Delivery', flow: 'Flow 5', icon: '🏠', color: 'border-amber-200 bg-amber-50/50' },
            { step: '5. Delivered', flow: 'Flow 6', icon: '🎉', color: 'border-green-200 bg-green-50/50' },
            { step: '6. Review & Reorder', flow: 'Flow 7 (24h) & 8 (15d)', icon: '⭐', color: 'border-rose-200 bg-rose-50/50' },
          ].map((item, idx) => (
            <div key={idx} className={`p-3 rounded-2xl border ${item.color} space-y-1 text-center relative`}>
              <span className="text-xl">{item.icon}</span>
              <p className="text-xs font-bold text-[#2d1b15] truncate">{item.step}</p>
              <p className="text-[11px] font-semibold text-[#6b5347]">{item.flow}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid: Flow Selector + Live Preview & Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: 12 Flows Selector (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <h2 className="text-base font-bold text-[#2d1b15] px-1 flex items-center justify-between">
            <span>Select WhatsApp Automation Flow</span>
            <span className="text-xs font-semibold text-[#6b5347]">12 Templates Available</span>
          </h2>

          <div className="space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
            {flowList.map((flow) => {
              const isSelected = selectedFlowId === flow.id;
              return (
                <button
                  key={flow.id}
                  onClick={() => setSelectedFlowId(flow.id as WhatsAppFlowId)}
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
                      {getFlowIcon(flow.id as WhatsAppFlowId)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                          isSelected ? 'bg-[#8b1a1a] text-white' : 'bg-[#faf6f0] text-[#6b5347] border border-[#e8ddd0]'
                        }`}>
                          FLOW {flow.flowNumber}
                        </span>
                        <span className="text-xs text-[#6b5347] font-mono truncate">{flow.templateName}</span>
                      </div>
                      <h3 className="text-sm font-bold text-[#2d1b15] truncate mt-0.5">{flow.title.replace(/FLOW \d+ – /, '')}</h3>
                      <p className="text-xs text-[#6b5347] truncate">{flow.trigger}</p>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? 'text-[#8b1a1a] translate-x-1' : 'text-gray-400'}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Live Message Renderer & Test Simulator (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Flow Header Card */}
          <div className="bg-white rounded-3xl p-6 border border-[#e8ddd0] shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e8ddd0] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-[#8b1a1a] text-white text-xs font-extrabold px-2.5 py-1 rounded-lg">
                    FLOW {activeFlow.flowNumber}
                  </span>
                  <span className="text-xs font-mono bg-gray-100 text-gray-700 px-2 py-1 rounded-md border border-gray-200">
                    template_name: {activeFlow.templateName}
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-[#2d1b15] mt-1">{activeFlow.title}</h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(activeFlow.templateText, 'template')}
                  className="px-3 py-2 bg-[#faf6f0] hover:bg-[#e8ddd0] text-[#2d1b15] rounded-xl text-xs font-bold border border-[#e8ddd0] flex items-center gap-1.5 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedType === 'template' ? 'Copied Template!' : 'Copy Template'}</span>
                </button>

                <button
                  onClick={() => handleCopy(JSON.stringify(liveApiPayload, null, 2), 'json')}
                  className="px-3 py-2 bg-[#faf6f0] hover:bg-[#e8ddd0] text-[#2d1b15] rounded-xl text-xs font-bold border border-[#e8ddd0] flex items-center gap-1.5 transition-colors"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>{copiedType === 'json' ? 'Copied API JSON!' : 'Copy API JSON'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-[#faf6f0] p-3.5 rounded-2xl border border-[#e8ddd0] space-y-1">
                <span className="font-bold text-[#8b1a1a] uppercase tracking-wider block">Trigger Event</span>
                <p className="text-[#2d1b15] font-medium">{activeFlow.trigger}</p>
              </div>
              <div className="bg-[#faf6f0] p-3.5 rounded-2xl border border-[#e8ddd0] space-y-1">
                <span className="font-bold text-[#8b1a1a] uppercase tracking-wider block">Flow Description</span>
                <p className="text-[#2d1b15] font-medium">{activeFlow.description}</p>
              </div>
            </div>

            {/* Quick Reply Buttons tag list */}
            {activeFlow.quickReplyButtons && activeFlow.quickReplyButtons.length > 0 && (
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs font-bold text-[#6b5347]">WhatsApp Quick Reply Buttons:</span>
                <div className="flex flex-wrap gap-2">
                  {activeFlow.quickReplyButtons.map((btn, i) => (
                    <span key={i} className="text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full">
                      {btn}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* WhatsApp Chat Preview Window */}
          <div className="bg-[#efeae2] rounded-3xl p-4 sm:p-6 border border-[#d1c7b7] shadow-inner space-y-4">
            <div className="flex items-center justify-between bg-[#075e54] text-white p-3.5 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white text-[#075e54] font-extrabold flex items-center justify-center text-xs">
                  AV
                </div>
                <div>
                  <h4 className="text-sm font-bold leading-tight">Annavedah Foods Official</h4>
                  <p className="text-[11px] text-emerald-100 font-medium">WhatsApp Verified Business Account</p>
                </div>
              </div>
              <span className="text-[10px] bg-emerald-800/60 px-2.5 py-1 rounded-full border border-emerald-400/30">
                Live Preview
              </span>
            </div>

            {/* Chat Bubble */}
            <div className="max-w-[90%] sm:max-w-[85%] bg-white rounded-2xl rounded-tl-none p-4 shadow-sm space-y-3 text-xs sm:text-sm text-[#111b21] leading-relaxed relative border border-gray-100">
              <div className="whitespace-pre-wrap font-sans">{liveMessage}</div>
              <div className="flex items-center justify-end gap-1 text-[10px] text-gray-400 pt-1">
                <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <span className="text-blue-500 font-bold">✓✓</span>
              </div>

              {/* Quick Reply interactive pill buttons rendering inside bubble */}
              {activeFlow.quickReplyButtons && activeFlow.quickReplyButtons.length > 0 && (
                <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
                  {activeFlow.quickReplyButtons.map((btnText, bIdx) => (
                    <button
                      key={bIdx}
                      className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl text-xs border border-emerald-200 transition-colors text-center"
                    >
                      {btnText}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="bg-white p-4 rounded-2xl border border-[#d1c7b7] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <PhoneCall className="w-4 h-4 text-emerald-600 shrink-0" />
                <input
                  type="text"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="Enter phone number (e.g. 9876543210)"
                  className="w-full sm:w-48 px-3 py-1.5 border border-gray-300 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <a
                href={liveWebUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto bg-[#25d366] hover:bg-[#20bd5a] text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send WhatsApp to {testPhone}</span>
              </a>
            </div>
          </div>

          {/* Test Field Variable Controls */}
          <div className="bg-white rounded-3xl p-6 border border-[#e8ddd0] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#2d1b15] flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#8b1a1a]" />
                <span>Simulate Dynamic Field Parameters</span>
              </h3>
              <button
                onClick={() => setFormData({
                  customerName: 'Rohit Sharma',
                  customerPhone: '9876543210',
                  orderId: 'AV-' + Math.floor(10000 + Math.random() * 90000),
                  productList: '1x Organic Moringa Powder (250g)\n2x Spun Tomato Powder (100g)',
                  orderTotal: 484,
                  trackingLink: 'https://annavedah.shiprocket.co/tracking/SR-998241',
                  reviewLink: 'https://annavedah.com/testimonials',
                  websiteLink: 'https://annavedah.com',
                  cartLink: 'https://annavedah.com/cart',
                  paymentLink: 'https://annavedah.com/checkout?retry=AV-98412',
                })}
                className="text-xs font-bold text-[#8b1a1a] hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Randomize Sample Data</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-[#6b5347] block mb-1">Customer Name ({'{{Customer_Name}}'})</label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, customerName: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#e8ddd0] rounded-xl focus:outline-none focus:border-[#c9a45c]"
                />
              </div>

              <div>
                <label className="font-bold text-[#6b5347] block mb-1">Order ID ({'{{Order_ID}}'})</label>
                <input
                  type="text"
                  value={formData.orderId}
                  onChange={(e) => setFormData((prev) => ({ ...prev, orderId: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#e8ddd0] rounded-xl focus:outline-none focus:border-[#c9a45c]"
                />
              </div>

              <div>
                <label className="font-bold text-[#6b5347] block mb-1">Order Total ₹ ({'{{Order_Total}}'})</label>
                <input
                  type="number"
                  value={formData.orderTotal}
                  onChange={(e) => setFormData((prev) => ({ ...prev, orderTotal: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#e8ddd0] rounded-xl focus:outline-none focus:border-[#c9a45c]"
                />
              </div>

              <div>
                <label className="font-bold text-[#6b5347] block mb-1">Tracking Link ({'{{Tracking_Link}}'})</label>
                <input
                  type="text"
                  value={formData.trackingLink}
                  onChange={(e) => setFormData((prev) => ({ ...prev, trackingLink: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#e8ddd0] rounded-xl focus:outline-none focus:border-[#c9a45c]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-[#6b5347] block mb-1">Product List Summary ({'{{Product_List}}'})</label>
                <textarea
                  rows={2}
                  value={formData.productList}
                  onChange={(e) => setFormData((prev) => ({ ...prev, productList: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#e8ddd0] rounded-xl focus:outline-none focus:border-[#c9a45c]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
