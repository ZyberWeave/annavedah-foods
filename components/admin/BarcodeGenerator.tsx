"use client";

import { useState } from "react";
import { products as staticProducts, type Product } from "@/lib/content";
import { addBatch, getBatches, type ProductBatch } from "@/lib/batch-inventory";

export default function BarcodeGenerator() {
  const [productSlug, setProductSlug] = useState("");
  const [mfdDate, setMfdDate] = useState("2026-06-01");
  const [expDate, setExpDate] = useState("2027-06-01");
  const [quantity, setQuantity] = useState("50");
  const [costPrice, setCostPrice] = useState("100");
  const [supplier, setSupplier] = useState("Annavedah Organic Farms");
  const [successMsg, setSuccessMsg] = useState("");

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productSlug || !mfdDate || !expDate) return;

    const selectedProd = staticProducts.find((p) => p.slug === productSlug);
    if (!selectedProd) return;

    const newBatch = addBatch({
      productSlug: selectedProd.slug,
      productName: selectedProd.name,
      manufacturedDate: mfdDate,
      expiryDate: expDate,
      quantity: Number(quantity) || 1,
      initialQuantity: Number(quantity) || 1,
      costPrice: Number(costPrice) || 0,
      sellingPrice: selectedProd.price,
      supplier,
    });

    setSuccessMsg(`Generated Barcode ${newBatch.barcode} for batch '${newBatch.id}'!`);
    setTimeout(() => setSuccessMsg(""), 5000);
  };

  const batches = getBatches();
  const catalogProducts = staticProducts.filter((p) => !p.isGift);

  return (
    <div className="bg-white rounded-2xl border-2 border-[#e8ddd0] p-6 mt-8 shadow-sm">
      <div className="flex items-center justify-between border-b border-[#e8ddd0] pb-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-[#2d1b15] flex items-center gap-2">
            <span>🏷️</span> Batch & Barcode Generator
          </h2>
          <p className="text-xs text-[#6b5347] mt-0.5">
            Add new stock batches with manufacturing & expiry dates. Auto-generates printable Code128 barcodes.
          </p>
        </div>
        <span className="bg-[#8b1a1a]/10 text-[#8b1a1a] text-xs font-bold px-3 py-1 rounded-full border border-[#c9a45c]/30">
          Barcode Engine
        </span>
      </div>

      {successMsg && (
        <div className="bg-[#8b1a1a]/10 border border-[#c9a45c]/40 text-[#8b1a1a] px-4 py-3 rounded-xl text-sm mb-6 font-bold">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleCreateBatch} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#2d1b15] uppercase tracking-wider mb-1">
              Select Product *
            </label>
            <select
              required
              value={productSlug}
              onChange={(e) => {
                setProductSlug(e.target.value);
                const p = staticProducts.find((prod) => prod.slug === e.target.value);
                if (p) setCostPrice(String(Math.round(p.price * 0.55)));
              }}
              className="w-full border-2 border-[#e8ddd0] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#8b1a1a] bg-white"
            >
              <option value="">-- Select Product from Catalog --</option>
              {catalogProducts.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.name} (Price: ₹{p.price})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2d1b15] uppercase tracking-wider mb-1">
              Batch Stock Quantity *
            </label>
            <input
              type="number"
              required
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full border-2 border-[#e8ddd0] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#8b1a1a]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#2d1b15] uppercase tracking-wider mb-1">
              Manufacturing Date (MFD) *
            </label>
            <input
              type="date"
              required
              value={mfdDate}
              onChange={(e) => setMfdDate(e.target.value)}
              className="w-full border-2 border-[#e8ddd0] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#8b1a1a] bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2d1b15] uppercase tracking-wider mb-1">
              Expiry Date (EXP) *
            </label>
            <input
              type="date"
              required
              value={expDate}
              onChange={(e) => setExpDate(e.target.value)}
              className="w-full border-2 border-[#e8ddd0] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#8b1a1a] bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2d1b15] uppercase tracking-wider mb-1">
              Unit Cost Price (₹)
            </label>
            <input
              type="number"
              value={costPrice}
              onChange={(e) => setCostPrice(e.target.value)}
              className="w-full border-2 border-[#e8ddd0] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#8b1a1a]"
            />
          </div>
        </div>

        <button
          type="submit"
          className="bg-[#8b1a1a] hover:bg-[#6d1414] text-white font-bold text-sm px-6 py-3 rounded-xl transition-all shadow"
        >
          Generate Batch & Barcode Label
        </button>
      </form>

      {/* Batch List & Barcode Label Cards */}
      <div className="mt-8">
        <h3 className="text-sm font-bold text-[#2d1b15] uppercase tracking-wider mb-4">
          Active Inventory Batches & Printable Barcode Stickers ({batches.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {batches.map((b) => (
            <div key={b.id} className="border-2 border-[#e8ddd0] rounded-xl p-4 bg-[#faf6f0] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#8b1a1a] bg-[#8b1a1a]/10 px-2.5 py-0.5 rounded-full border border-[#c9a45c]/30">
                    {b.id}
                  </span>
                  <span className="text-xs text-[#6b5347] font-semibold">Qty: {b.quantity} / {b.initialQuantity}</span>
                </div>
                <h4 className="font-bold text-[#2d1b15] text-sm mt-2">{b.productName}</h4>
                <div className="text-xs text-[#6b5347] space-y-1 mt-1 font-medium">
                  <p>MFD: {b.manufacturedDate} | <strong className="text-red-600">EXP: {b.expiryDate}</strong></p>
                  <p>Cost Price: ₹{b.costPrice} | Selling Price: ₹{b.sellingPrice}</p>
                </div>
              </div>

              {/* Printable Barcode Label Simulation */}
              <div className="mt-4 pt-3 border-t border-[#e8ddd0] bg-white p-3 rounded-xl border text-center">
                <p className="text-[10px] uppercase font-bold text-[#6b5347]">ANNAVEDAH FOODS BARCODE STICKER</p>
                <div className="my-2 flex justify-center">
                  <svg className="h-10 w-48" viewBox="0 0 200 40">
                    <rect x="0" y="0" width="200" height="40" fill="#ffffff" />
                    <g fill="#000000">
                      <rect x="10" y="5" width="3" height="30" />
                      <rect x="15" y="5" width="1" height="30" />
                      <rect x="18" y="5" width="4" height="30" />
                      <rect x="24" y="5" width="2" height="30" />
                      <rect x="28" y="5" width="5" height="30" />
                      <rect x="35" y="5" width="1" height="30" />
                      <rect x="38" y="5" width="3" height="30" />
                      <rect x="43" y="5" width="4" height="30" />
                      <rect x="49" y="5" width="2" height="30" />
                      <rect x="53" y="5" width="6" height="30" />
                      <rect x="61" y="5" width="2" height="30" />
                      <rect x="65" y="5" width="4" height="30" />
                      <rect x="71" y="5" width="1" height="30" />
                      <rect x="74" y="5" width="3" height="30" />
                      <rect x="79" y="5" width="5" height="30" />
                      <rect x="86" y="5" width="2" height="30" />
                      <rect x="90" y="5" width="4" height="30" />
                      <rect x="96" y="5" width="1" height="30" />
                      <rect x="100" y="5" width="3" height="30" />
                      <rect x="105" y="5" width="5" height="30" />
                      <rect x="112" y="5" width="2" height="30" />
                      <rect x="116" y="5" width="4" height="30" />
                      <rect x="122" y="5" width="1" height="30" />
                      <rect x="125" y="5" width="3" height="30" />
                      <rect x="130" y="5" width="5" height="30" />
                      <rect x="137" y="5" width="2" height="30" />
                      <rect x="141" y="5" width="4" height="30" />
                      <rect x="147" y="5" width="1" height="30" />
                      <rect x="150" y="5" width="3" height="30" />
                      <rect x="155" y="5" width="5" height="30" />
                      <rect x="162" y="5" width="2" height="30" />
                      <rect x="166" y="5" width="4" height="30" />
                      <rect x="172" y="5" width="2" height="30" />
                      <rect x="176" y="5" width="5" height="30" />
                      <rect x="183" y="5" width="3" height="30" />
                    </g>
                  </svg>
                </div>
                <p className="font-mono text-xs font-extrabold tracking-widest text-[#2d1b15]">{b.barcode}</p>
                
                {/* Automated Printing Controls for TSC TTP-244 Pro */}
                <div className="mt-3 pt-2 border-t border-[#e8ddd0] flex flex-wrap gap-2 justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      const printWindow = window.open("", "_blank", "width=400,height=300");
                      if (printWindow) {
                        printWindow.document.write(`
                          <html>
                            <head>
                              <title>TSC TTP-244 Pro Label - ${b.barcode}</title>
                              <style>
                                @page { size: 50mm 25mm; margin: 0; }
                                body { font-family: monospace; font-size: 8pt; margin: 0; padding: 2mm; text-align: center; background: #fff; }
                                .title { font-weight: bold; font-size: 9pt; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                                .details { font-size: 6.5pt; margin: 1mm 0; }
                                svg { width: 90%; height: 12mm; }
                                .code { font-weight: bold; font-size: 8pt; letter-spacing: 2px; }
                              </style>
                            </head>
                            <body onload="window.print(); setTimeout(function(){ window.close(); }, 500);">
                              <div class="title">${b.productName}</div>
                              <div class="details">MFD: ${b.manufacturedDate} | EXP: ${b.expiryDate}</div>
                              <svg viewBox="0 0 200 40">
                                <rect x="0" y="0" width="200" height="40" fill="#ffffff" />
                                <g fill="#000000">
                                  <rect x="10" y="5" width="3" height="30" /><rect x="15" y="5" width="1" height="30" /><rect x="18" y="5" width="4" height="30" /><rect x="24" y="5" width="2" height="30" /><rect x="28" y="5" width="5" height="30" /><rect x="35" y="5" width="1" height="30" /><rect x="38" y="5" width="3" height="30" /><rect x="43" y="5" width="4" height="30" /><rect x="49" y="5" width="2" height="30" /><rect x="53" y="5" width="6" height="30" /><rect x="61" y="5" width="2" height="30" /><rect x="65" y="5" width="4" height="30" /><rect x="71" y="5" width="1" height="30" /><rect x="74" y="5" width="3" height="30" /><rect x="79" y="5" width="5" height="30" /><rect x="86" y="5" width="2" height="30" /><rect x="90" y="5" width="4" height="30" /><rect x="96" y="5" width="1" height="30" /><rect x="100" y="5" width="3" height="30" /><rect x="105" y="5" width="5" height="30" /><rect x="112" y="5" width="2" height="30" /><rect x="116" y="5" width="4" height="30" /><rect x="122" y="5" width="1" height="30" /><rect x="125" y="5" width="3" height="30" /><rect x="130" y="5" width="5" height="30" /><rect x="137" y="5" width="2" height="30" /><rect x="141" y="5" width="4" height="30" /><rect x="147" y="5" width="1" height="30" /><rect x="150" y="5" width="3" height="30" /><rect x="155" y="5" width="5" height="30" /><rect x="162" y="5" width="2" height="30" /><rect x="166" y="5" width="4" height="30" /><rect x="172" y="5" width="2" height="30" /><rect x="176" y="5" width="5" height="30" /><rect x="183" y="5" width="3" height="30" />
                                </g>
                              </svg>
                              <div class="code">${b.barcode}</div>
                            </body>
                          </html>
                        `);
                        printWindow.document.close();
                      }
                    }}
                    className="bg-[#8b1a1a] hover:bg-[#6d1414] text-white font-bold text-[11px] px-3 py-1.5 rounded-xl shadow flex items-center gap-1 transition-colors"
                  >
                    <span>⚡ Print to TSC TTP-244 Pro</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const tsplCmd = `SIZE 50 mm, 25 mm\nGAP 3 mm, 0 mm\nCLS\nTEXT 20,20,"3",0,1,1,"${b.productName}"\nTEXT 20,45,"2",0,1,1,"MFD: ${b.manufacturedDate}  EXP: ${b.expiryDate}"\nBARCODE 20,70,"128",60,1,0,2,2,"${b.barcode}"\nPRINT 1,1\n`;
                      const blob = new Blob([tsplCmd], { type: "text/plain" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `label_${b.barcode}.tspl`;
                      a.click();
                    }}
                    className="bg-white hover:bg-gray-50 text-[#2d1b15] border border-[#e8ddd0] font-semibold text-[10px] px-2.5 py-1 rounded-xl transition-colors"
                  >
                    💾 TSPL Raw File
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
