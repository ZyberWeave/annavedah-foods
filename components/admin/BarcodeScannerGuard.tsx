"use client";

import { useState } from "react";
import { lookupByBarcode, analyzeExpiry, getBatches, type ProductBatch, type ExpiryAnalysis } from "@/lib/batch-inventory";

type BarcodeScannerGuardProps = {
  onItemScanned?: (batch: ProductBatch, analysis: ExpiryAnalysis) => void;
};

export default function BarcodeScannerGuard({ onItemScanned }: BarcodeScannerGuardProps) {
  const [barcodeInput, setBarcodeInput] = useState("");
  const [scannedBatch, setScannedBatch] = useState<ProductBatch | null>(null);
  const [analysis, setAnalysis] = useState<ExpiryAnalysis | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleScan = (codeToScan?: string) => {
    const targetCode = codeToScan || barcodeInput.trim();
    if (!targetCode) return;

    const batch = lookupByBarcode(targetCode);
    if (!batch) {
      setScannedBatch(null);
      setAnalysis(null);
      setErrorMsg(`No batch or product found matching Barcode / ID: '${targetCode}'`);
      return;
    }

    const expAnalysis = analyzeExpiry(batch.expiryDate, batch.manufacturedDate);
    setScannedBatch(batch);
    setAnalysis(expAnalysis);
    setErrorMsg("");

    if (onItemScanned && !expAnalysis.isBlocked) {
      onItemScanned(batch, expAnalysis);
    }
  };

  const sampleBatches = getBatches();

  return (
    <div className="bg-white rounded-2xl border-2 border-[#e8ddd0] p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-[#e8ddd0] pb-4 mb-5">
        <div>
          <h2 className="text-lg font-bold text-[#2d1b15] flex items-center gap-2">
            <span>🔍</span> Barcode Scanner & Real-Time Expiry Guard
          </h2>
          <p className="text-xs text-[#6b5347] mt-0.5">
            Scan USB/camera barcode or enter batch number. Automatically blocks expired items during packaging & POS.
          </p>
        </div>
        <span className="bg-[#8b1a1a]/10 text-[#8b1a1a] text-xs font-bold px-3 py-1 rounded-full border border-[#c9a45c]/30">
          Safety Shield Active
        </span>
      </div>

      {/* Barcode Search / Scan Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleScan();
        }}
        className="flex gap-2 mb-4"
      >
        <input
          type="text"
          placeholder="Scan USB Barcode or Enter Barcode ID (e.g. 8903003003001)..."
          value={barcodeInput}
          onChange={(e) => setBarcodeInput(e.target.value)}
          className="flex-1 border-2 border-[#e8ddd0] rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-[#8b1a1a]"
        />
        <button
          type="submit"
          className="bg-[#8b1a1a] hover:bg-[#6d1414] text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all shadow"
        >
          Scan & Validate
        </button>
      </form>

      {/* Quick Test Demo Barcodes */}
      <div className="mb-6 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-[#6b5347] font-semibold">Quick Test Barcodes:</span>
        {sampleBatches.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => {
              setBarcodeInput(b.barcode);
              handleScan(b.barcode);
            }}
            className="bg-[#faf6f0] hover:bg-[#e8ddd0] text-[#2d1b15] border border-[#e8ddd0] rounded-lg px-2.5 py-1 font-mono transition-colors"
          >
            {b.productName} ({b.barcode})
          </button>
        ))}
      </div>

      {/* Error State */}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium mb-4">
          {errorMsg}
        </div>
      )}

      {/* Scan Results & Safety Guard */}
      {scannedBatch && analysis && (
        <div className={`p-5 rounded-2xl border-2 transition-all ${
          analysis.isBlocked
            ? "bg-red-50 border-red-300 text-red-950"
            : analysis.status === "NEAR_EXPIRY"
            ? "bg-amber-50 border-amber-300 text-amber-950"
            : "bg-[#8b1a1a]/10 border-[#c9a45c]/30 text-[#2d1b15]"
        }`}>
          {/* Status Alert Banner */}
          <div className={`p-3.5 rounded-xl font-bold text-sm mb-4 flex items-center justify-between ${
            analysis.isBlocked
              ? "bg-red-600 text-white shadow-md animate-pulse"
              : analysis.status === "NEAR_EXPIRY"
              ? "bg-amber-600 text-white shadow-sm"
              : "bg-[#8b1a1a] text-white"
          }`}>
            <span>{analysis.message}</span>
            <span className="text-xs uppercase font-extrabold px-2.5 py-1 rounded bg-black/20">
              {analysis.status}
            </span>
          </div>

          {/* Batch Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="bg-white/80 p-3 rounded-xl border border-current/20">
              <span className="text-[#6b5347] block uppercase font-bold text-[10px]">Product Name</span>
              <span className="font-bold text-sm">{scannedBatch.productName}</span>
            </div>

            <div className="bg-white/80 p-3 rounded-xl border border-current/20">
              <span className="text-[#6b5347] block uppercase font-bold text-[10px]">Barcode / Batch ID</span>
              <span className="font-mono font-bold text-sm">{scannedBatch.barcode}</span>
            </div>

            <div className="bg-white/80 p-3 rounded-xl border border-current/20">
              <span className="text-[#6b5347] block uppercase font-bold text-[10px]">Manufacturing Date</span>
              <span className="font-bold text-sm">{analysis.formattedMfd}</span>
            </div>

            <div className="bg-white/80 p-3 rounded-xl border border-current/20">
              <span className="text-[#6b5347] block uppercase font-bold text-[10px]">Expiry Date</span>
              <span className="font-bold text-sm text-red-600">{analysis.formattedExp}</span>
            </div>
          </div>

          {analysis.isBlocked ? (
            <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-xl text-red-900 text-xs font-bold flex items-center justify-between">
              <span>⛔ ACTION BLOCKED: Cannot ship or process offline transaction for expired batch.</span>
              <span className="bg-red-700 text-white px-3 py-1 rounded uppercase text-[10px]">BLOCKED</span>
            </div>
          ) : (
            <div className="mt-4 p-3 bg-[#8b1a1a]/20 border border-[#c9a45c]/40 rounded-xl text-[#8b1a1a] text-xs font-bold flex items-center justify-between">
              <span>✅ VERIFIED VALID: Approved for offline counter POS & order packaging shipment.</span>
              <span className="bg-[#8b1a1a] text-white px-3 py-1 rounded uppercase text-[10px]">PASSED</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
