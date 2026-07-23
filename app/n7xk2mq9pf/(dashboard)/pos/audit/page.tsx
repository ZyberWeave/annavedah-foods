"use client";

import POSRegisterSummary from "@/components/admin/pos/POSRegisterSummary";
import POSHeader from "@/components/admin/pos/POSHeader";

export default function POSAuditPage() {
  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6 overflow-x-hidden">
      <POSHeader />

      <div className="bg-white rounded-2xl p-6 border border-[#e8ddd0] shadow-xs">
        <POSRegisterSummary />
      </div>
    </div>
  );
}
