"use client";

import { useState } from "react";
import {
  getProductBatches,
  getFEFOBatch,
  analyzeExpiry,
  type ProductBatch,
} from "@/lib/batch-inventory";

type BatchProductSearchProps = {
  onSelectBatchItem: (item: {
    productId: string;
    productName: string;
    batchId: string;
    mfdDate: string;
    expiryDate: string;
    price: number;
    barcode: string;
  }) => void;
};

export default function BatchProductSearch({ onSelectBatchItem }: BatchProductSearchProps) {
  const [query, setQuery] = useState("");
  const [selectedProductGroup, setSelectedProductGroup] = useState<{
    productName: string;
    batches: ProductBatch[];
  } | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const matches = getProductBatches(query);
    if (matches.length === 0) {
      alert(`No products or batches found matching "${query}"`);
      return;
    }

    const groupName = matches[0].productName;
    setSelectedProductGroup({
      productName: groupName,
      batches: matches,
    });
  };

  const fefoBatch = selectedProductGroup
    ? getFEFOBatch(selectedProductGroup.productName)
    : null;

  return (
    <div className="bg-white rounded-xl p-5 border-2 border-[#e8ddd0] shadow-xs mb-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-extrabold text-[#2d1b15] uppercase tracking-wider">
          PRODUCT & BATCH SEARCH
        </h3>
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#8b1a1a]/10 text-[#8b1a1a] border border-[#c9a45c]/30">
          AUTO FEFO SELECTOR
        </span>
      </div>
      <p className="text-xs text-[#6b5347] mb-4">
        Search by product name, SKU, or barcode to inspect manufacturing batches, expiry dates, and recommended stock.
      </p>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Enter product name (e.g. Moringa, Turmeric) or Barcode..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full border-2 border-[#e8ddd0] rounded-lg px-4 py-2 text-xs focus:outline-none focus:border-[#8b1a1a] font-medium"
          />
        </div>
        <button
          type="submit"
          className="bg-[#8b1a1a] hover:bg-[#6d1414] text-white font-bold text-xs px-5 py-2 rounded-lg transition-colors uppercase tracking-wider"
        >
          Search Batches
        </button>
      </form>

      {/* MULTI-BATCH SELECTION MODAL */}
      {selectedProductGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl p-6 shadow-2xl border-2 border-[#e8ddd0] max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedProductGroup(null)}
              className="absolute top-4 right-4 z-10 w-7 h-7 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full flex items-center justify-center font-bold text-xs"
            >
              CLOSE
            </button>

            <div className="mb-5 pb-3 border-b border-[#e8ddd0]">
              <span className="bg-[#8b1a1a]/10 text-[#8b1a1a] text-[10px] font-extrabold uppercase px-2.5 py-1 rounded border border-[#c9a45c]/30 inline-block mb-1">
                BATCH SELECTION MANIFEST
              </span>
              <h3 className="text-lg font-bold text-[#2d1b15]">
                {selectedProductGroup.productName}
              </h3>
              <p className="text-xs text-[#6b5347] mt-0.5">
                Select specific batch for inventory tracking. First Expire, First Out (FEFO) batch is highlighted.
              </p>
            </div>

            {/* BATCHES LIST TABLE */}
            <div className="space-y-3">
              {selectedProductGroup.batches.map((batch) => {
                const expiryInfo = analyzeExpiry(batch.expiryDate, batch.mfdDate);
                const isFEFO = fefoBatch?.batchId === batch.batchId;

                return (
                  <div
                    key={batch.batchId}
                    className={`p-4 rounded-xl border-2 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      expiryInfo.isBlocked
                        ? "bg-red-50 border-red-300"
                        : isFEFO
                        ? "bg-[#8b1a1a]/10 border-[#8b1a1a] ring-1 ring-[#8b1a1a]/30"
                        : "bg-white border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#2d1b15] text-white">
                          BATCH: {batch.batchId}
                        </span>
                        {isFEFO && (
                          <span className="bg-[#8b1a1a] text-white text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                            RECOMMENDED (FEFO)
                          </span>
                        )}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${expiryInfo.badgeClass}`}>
                          {expiryInfo.label}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-xs text-[#6b5347] mt-2">
                        <div>
                          <span className="text-gray-400 block text-[9px] uppercase font-bold">MFD DATE</span>
                          <span className="font-semibold text-gray-800">{batch.mfdDate}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[9px] uppercase font-bold">EXPIRY DATE</span>
                          <span className="font-semibold text-gray-800">{batch.expiryDate}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[9px] uppercase font-bold">AVAILABLE STOCK</span>
                          <span className="font-bold text-[#2d1b15]">{batch.currentStock} UNITS</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[9px] uppercase font-bold">UNIT PRICE</span>
                          <span className="font-bold text-[#2d1b15]">INR {batch.unitPrice}.00</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end">
                      {expiryInfo.isBlocked ? (
                        <span className="bg-red-700 text-white font-bold text-[10px] px-3 py-1.5 rounded uppercase tracking-wider">
                          EXPIRED - BLOCKED
                        </span>
                      ) : batch.currentStock <= 0 ? (
                        <span className="bg-gray-200 text-gray-600 font-bold text-xs px-3 py-1.5 rounded">
                          OUT OF STOCK
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            onSelectBatchItem({
                              productId: batch.productId,
                              productName: batch.productName,
                              batchId: batch.batchId,
                              mfdDate: batch.mfdDate,
                              expiryDate: batch.expiryDate,
                              price: batch.unitPrice,
                              barcode: batch.barcode,
                            });
                            setSelectedProductGroup(null);
                          }}
                          className={`font-bold text-xs px-4 py-2 rounded-lg transition-colors uppercase tracking-wider ${
                            isFEFO
                              ? "bg-[#8b1a1a] hover:bg-[#6d1414] text-white shadow-xs"
                              : "bg-[#2d1b15] hover:bg-black text-white"
                          }`}
                        >
                          SELECT BATCH
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
