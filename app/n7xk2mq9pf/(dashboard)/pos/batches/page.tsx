"use client";

import { useState } from "react";
import BarcodeGenerator from "@/components/admin/BarcodeGenerator";
import POSHeader from "@/components/admin/pos/POSHeader";

export default function POSBatchesPage() {
  const [batches] = useState([
    { batchId: "BATCH-2026-001", productName: "Organic Moringa Powder", mfd: "2026-06-15", exp: "2027-06-15", stock: 120, status: "FRESH" },
    { batchId: "BATCH-2026-002", productName: "Wild Turmeric Powder", mfd: "2026-05-10", exp: "2027-05-10", stock: 85, status: "FRESH" },
    { batchId: "BATCH-2025-089", productName: "Natural Amla Powder", mfd: "2025-08-01", exp: "2026-08-01", stock: 14, status: "NEAR EXPIRY" },
  ]);

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6 overflow-x-hidden">
      <POSHeader />

      {/* BATCH TABLE & BARCODE GENERATOR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-2xl p-6 border border-border shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-foreground border-b border-border pb-3">Active Batches (FEFO Tracked)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted text-muted-foreground uppercase font-bold">
                <tr>
                  <th className="p-3">Batch ID</th>
                  <th className="p-3">Product Name</th>
                  <th className="p-3">MFD</th>
                  <th className="p-3">EXP Date</th>
                  <th className="p-3">Stock</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {batches.map((b) => (
                  <tr key={b.batchId} className="hover:bg-muted/30">
                    <td className="p-3 font-mono font-bold text-primary">{b.batchId}</td>
                    <td className="p-3 font-bold">{b.productName}</td>
                    <td className="p-3 text-muted-foreground">{b.mfd}</td>
                    <td className="p-3 text-muted-foreground">{b.exp}</td>
                    <td className="p-3 font-bold font-mono">{b.stock} units</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase ${
                        b.status === "FRESH" ? "bg-green-500/15 text-green-700" : "bg-amber-500/15 text-amber-700"
                      }`}>
                        [{b.status}]
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-6 border border-border shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-foreground border-b border-border pb-3">Barcode Label Printer</h2>
          <BarcodeGenerator />
        </div>
      </div>
    </div>
  );
}
