"use client";

export default function POSRegisterSummary() {
  return (
    <div className="bg-white rounded-xl p-6 border-2 border-[#e8ddd0] shadow-xs mt-8">
      <div className="flex items-center justify-between border-b border-[#e8ddd0] pb-4 mb-6">
        <div>
          <h2 className="text-sm font-extrabold text-[#2d1b15] uppercase tracking-wider">
            DAILY CASH REGISTER & SHIFT RECONCILIATION
          </h2>
          <p className="text-xs text-[#6b5347] mt-0.5">
            Real-time cash drawer status, payment method breakdown, and cashier shift summary.
          </p>
        </div>
        <span className="bg-[#8b1a1a]/10 text-[#8b1a1a] text-xs font-bold px-3 py-1 rounded border border-[#c9a45c]/30 uppercase tracking-wider">
          SHIFT ACTIVE (#041)
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
        <div className="bg-[#faf6f0] rounded-lg p-4 border border-[#e8ddd0]">
          <span className="text-[10px] font-bold text-[#6b5347] uppercase tracking-wider block">TOTAL POS SALES</span>
          <span className="text-2xl font-extrabold text-[#2d1b15] mt-1 block">INR 32,600.00</span>
          <span className="text-xs font-semibold text-[#8b1a1a] mt-1 block">26 Completed Orders</span>
        </div>

        <div className="bg-[#faf6f0] rounded-lg p-4 border border-[#e8ddd0]">
          <span className="text-[10px] font-bold text-[#6b5347] uppercase tracking-wider block">CASH IN DRAWER</span>
          <span className="text-2xl font-extrabold text-[#2d1b15] mt-1 block">INR 16,400.00</span>
          <span className="text-xs font-semibold text-[#8b1a1a] mt-1 block">Opening Float: INR 2,000.00</span>
        </div>

        <div className="bg-[#faf6f0] rounded-lg p-4 border border-[#e8ddd0]">
          <span className="text-[10px] font-bold text-[#6b5347] uppercase tracking-wider block">UPI & DIGITAL QR</span>
          <span className="text-2xl font-extrabold text-[#2d1b15] mt-1 block">INR 12,800.00</span>
          <span className="text-xs font-semibold text-[#8b1a1a] mt-1 block">Verified Instant Settlements</span>
        </div>

        <div className="bg-[#faf6f0] rounded-lg p-4 border border-[#e8ddd0]">
          <span className="text-[10px] font-bold text-[#6b5347] uppercase tracking-wider block">CARD TERMINAL</span>
          <span className="text-2xl font-extrabold text-[#2d1b15] mt-1 block">INR 3,400.00</span>
          <span className="text-xs font-semibold text-[#8b1a1a] mt-1 block">4 Transactions</span>
        </div>
      </div>
    </div>
  );
}
