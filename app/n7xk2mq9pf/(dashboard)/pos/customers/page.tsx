"use client";

import CustomerPOSLookup from "@/components/admin/pos/CustomerPOSLookup";
import POSHeader from "@/components/admin/pos/POSHeader";

export default function POSCustomersPage() {
  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6 overflow-x-hidden">
      <POSHeader />

      <div className="max-w-2xl bg-white rounded-2xl p-6 border border-[#e8ddd0] shadow-xs">
        <CustomerPOSLookup
          onCustomerIdentified={(cust) => {
            alert(`Selected customer: ${cust.name} (${cust.phone}). First purchase discount: ${cust.discountPercent}%`);
          }}
        />
      </div>
    </div>
  );
}
