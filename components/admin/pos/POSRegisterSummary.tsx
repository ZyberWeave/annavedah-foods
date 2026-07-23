"use client";

export default function POSRegisterSummary() {
  return (
    <div className="bg-white rounded-2xl p-6 border-2 border-[#e8ddd0] shadow-sm mt-8">
      <div className="flex items-center justify-between border-b border-[#e8ddd0] pb-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-[#2d1b15] flex items-center gap-2">
            <span>📊</span> Daily Cash Register & Shift Sales Summary
          </h2>
          <p className="text-xs text-[#6b5347] mt-0.5">
            Real-time cash drawer reconciliation, digital payment split, and shift stats.
          </p>
        </div>
        <span className="bg-[#8b1a1a]/10 text-[#8b1a1a] text-xs font-bold px-3 py-1 rounded-full border border-[#c9a45c]/30">
          Register Open (Shift #041)
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
        <div className="bg-[#faf6f0] rounded-xl p-4 border border-[#e8ddd0]">
          <span className="text-[10px] font-bold text-[#6b5347] uppercase tracking-wider block">Total POS Sales Today</span>
          <span className="text-2xl font-extrabold text-[#2d1b15] mt-1 block">₹32,600.00</span>
          <span className="text-xs font-semibold text-[#8b1a1a] mt-1 block">26 Bills Completed</span>
        </div>

        <div className="bg-[#8b1a1a]/10 rounded-xl p-4 border border-[#c9a45c]/30">
          <span className="text-[10px] font-bold text-[#8b1a1a] uppercase tracking-wider block">Cash in Drawer</span>
          <span className="text-2xl font-extrabold text-[#2d1b15] mt-1 block">₹16,400.00</span>
          <span className="text-xs font-semibold text-[#8b1a1a] mt-1 block">Opening Float: ₹2,000</span>
        </div>

        <div className="bg-blue-50/60 rounded-xl p-4 border border-blue-200">
          <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">UPI & QR Received</span>
          <span className="text-2xl font-extrabold text-blue-900 mt-1 block">₹12,800.00</span>
          <span className="text-xs font-semibold text-blue-700 mt-1 block">Instant Verified</span>
        </div>

        <div className="bg-purple-50/60 rounded-xl p-4 border border-purple-200">
          <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider block">Card Terminal</span>
          <span className="text-2xl font-extrabold text-purple-900 mt-1 block">₹3,400.00</span>
          <span className="text-xs font-semibold text-purple-700 mt-1 block">4 Card Swipes</span>
        </div>
      </div>
    </div>
  );
}
