"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_SLUG } from "@/lib/admin-config";

export default function POSHeader() {
  const pathname = usePathname();
  const adminBase = `/${ADMIN_SLUG}`;

  const tabs = [
    { name: "Billing Terminal", href: `/pos` },
    { name: "Batch & Expiry", href: `/pos/batches` },
    { name: "Customer Directory", href: `/pos/customers` },
    { name: "Sales Audit & Receipts", href: `/pos/audit` },
  ];

  return (
    <div className="space-y-4 mb-6">
      {/* Top Banner */}
      <div className="bg-[#2d1b15] text-white rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#422a22]">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#8b1a1a] text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-widest">
              OFFLINE POS SUITE
            </span>
            <span className="text-xs text-[#c9a45c] font-semibold">Store Counter Terminal</span>
          </div>
          <h1 className="text-lg md:text-xl font-black text-white mt-1 uppercase tracking-tight">
            OFFLINE COUNTER & MULTI-BATCH SUITE
          </h1>
          <p className="text-xs text-[#e8ddd0]/80 mt-0.5">
            Real-time barcode scanning, batch expiry tracking (FEFO), customer directory, and thermal receipt billing.
          </p>
        </div>

        <Link
          href={`${adminBase}`}
          className="self-start md:self-auto bg-[#8b1a1a] hover:bg-[#6d1414] text-white font-bold text-xs px-4 py-2.5 rounded-xl uppercase tracking-wider transition-colors shadow-xs shrink-0"
        >
          BACK TO CONSOLE
        </Link>
      </div>

      {/* Unified Tab Navigation Bar */}
      <div className="bg-white rounded-xl p-2 border border-[#e8ddd0] shadow-xs flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const fullHref = `${adminBase}${tab.href}`;
          const isActive = pathname === fullHref || (tab.href === "/pos" && pathname === adminBase + "/pos");

          return (
            <Link
              key={tab.name}
              href={fullHref}
              className={`flex-1 min-w-[130px] text-center font-extrabold text-xs py-2.5 px-3 rounded-lg uppercase tracking-wider transition-all ${
                isActive
                  ? "bg-[#8b1a1a] text-white shadow-xs"
                  : "bg-[#faf6f0] text-[#6b5347] hover:bg-[#e8ddd0]/50 hover:text-[#2d1b15]"
              }`}
            >
              {tab.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
