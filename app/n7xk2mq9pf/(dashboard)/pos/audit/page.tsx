"use client";

import Link from "next/link";
import POSRegisterSummary from "@/components/admin/pos/POSRegisterSummary";
import { ADMIN_SLUG } from "@/lib/admin-config";

export default function POSAuditPage() {
  return (
    <div className="space-y-6 animate-fade-in-up pb-10 p-6">
      {/* HEADER & NAV TABS */}
      <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="bg-primary/10 text-primary text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full inline-block mb-1">
            OFFLINE POS SUITE
          </span>
          <h1 className="text-2xl font-serif font-bold text-primary tracking-tight">
            Offline Sales Audit & Digital Receipts
          </h1>
          <p className="text-muted-foreground text-sm">
            Audit register drawer totals, re-print 80mm thermal bills, and send WhatsApp digital receipts.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href={`/${ADMIN_SLUG}/pos`} className="px-4 py-2 rounded-xl text-xs font-bold bg-muted hover:bg-muted/80 text-foreground transition-all">
            Billing Terminal
          </Link>
          <Link href={`/${ADMIN_SLUG}/pos/batches`} className="px-4 py-2 rounded-xl text-xs font-bold bg-muted hover:bg-muted/80 text-foreground transition-all">
            Batch & Expiry
          </Link>
          <Link href={`/${ADMIN_SLUG}/pos/customers`} className="px-4 py-2 rounded-xl text-xs font-bold bg-muted hover:bg-muted/80 text-foreground transition-all">
            Customer Directory
          </Link>
          <Link href={`/${ADMIN_SLUG}/pos/audit`} className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground shadow-sm">
            Sales Audit & Receipts
          </Link>
        </div>
      </div>

      <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
        <POSRegisterSummary />
      </div>
    </div>
  );
}
