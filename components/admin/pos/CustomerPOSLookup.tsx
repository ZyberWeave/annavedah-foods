"use client";

import { useState } from "react";

type CustomerPOSLookupProps = {
  onCustomerIdentified: (customer: {
    name: string;
    phone: string;
    isFirstTime: boolean;
    discountPercent: number;
  }) => void;
};

export default function CustomerPOSLookup({ onCustomerIdentified }: CustomerPOSLookupProps) {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [foundCustomer, setFoundCustomer] = useState<{
    name: string;
    phone: string;
    ordersCount: number;
  } | null>(null);

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) {
      alert("Please enter a valid 10-digit mobile number");
      return;
    }

    if (phone === "9876543210") {
      const match = { name: "Mansi", phone, ordersCount: 3 };
      setFoundCustomer(match);
      setName(match.name);
      onCustomerIdentified({
        name: match.name,
        phone: match.phone,
        isFirstTime: false,
        discountPercent: 0,
      });
    } else {
      const newCust = { name: name || `Customer ${phone.slice(-4)}`, phone, ordersCount: 0 };
      setFoundCustomer(newCust);
      onCustomerIdentified({
        name: newCust.name,
        phone: newCust.phone,
        isFirstTime: true,
        discountPercent: 5,
      });
    }
  };

  return (
    <div className="bg-white rounded-xl p-5 border-2 border-[#e8ddd0] shadow-xs mb-6">
      <h3 className="text-xs font-extrabold text-[#2d1b15] uppercase tracking-wider mb-2">
        CUSTOMER PROFILE & PHONE LOOKUP
      </h3>

      {foundCustomer ? (
        <div className="bg-[#8b1a1a]/10 border border-[#c9a45c]/30 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-xs text-[#2d1b15]">{foundCustomer.name}</span>
            <span className="font-mono text-xs font-bold text-[#8b1a1a]">({foundCustomer.phone})</span>
            {foundCustomer.ordersCount === 0 ? (
              <span className="bg-[#8b1a1a] text-white text-[10px] font-extrabold px-2 py-0.5 rounded uppercase">
                FIRST PURCHASE (5% DISCOUNT APPLIED)
              </span>
            ) : (
              <span className="bg-[#2d1b15] text-white text-[10px] font-extrabold px-2 py-0.5 rounded uppercase">
                EXISTING CUSTOMER ({foundCustomer.ordersCount} ORDERS)
              </span>
            )}
          </div>
          <button
            onClick={() => {
              setFoundCustomer(null);
              setPhone("");
              setName("");
            }}
            className="text-xs text-gray-600 hover:text-gray-900 font-bold underline uppercase tracking-wider"
          >
            Change
          </button>
        </div>
      ) : (
        <form onSubmit={handleLookup} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <input
            type="tel"
            maxLength={10}
            placeholder="Enter 10-digit mobile number..."
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="border-2 border-[#e8ddd0] rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#8b1a1a]"
          />
          <input
            type="text"
            placeholder="Customer Name (Optional)..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border-2 border-[#e8ddd0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#8b1a1a]"
          />
          <button
            type="submit"
            className="bg-[#2d1b15] hover:bg-black text-white font-bold text-xs py-2 rounded-lg transition-colors uppercase tracking-wider"
          >
            Lookup Profile / Apply Discount
          </button>
        </form>
      )}
    </div>
  );
}
