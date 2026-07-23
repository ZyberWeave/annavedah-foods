"use client";

import { useState } from "react";
import { getBatches, addBatch, type ProductBatch } from "@/lib/batch-inventory";

export default function BarcodeGenerator() {
  const [batches, setBatches] = useState<ProductBatch[]>(getBatches());
  const [productName, setProductName] = useState("");
  const [mfdDate, setMfdDate] = useState(new Date().toISOString().split("T")[0]);
  const [expiryDate, setExpiryDate] = useState(
    new Date(Date.now() + 365 * 86400000).toISOString().split("T")[0]
  );
  const [initialStock, setInitialStock] = useState("100");
  const [unitPrice, setUnitPrice] = useState("299");
  const [labelWidth, setLabelWidth] = useState<number>(50);
  const [labelHeight, setLabelHeight] = useState<number>(25);
  const [orientation, setOrientation] = useState<"standard" | "rotated">("standard");

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) {
      alert("Please enter a product name");
      return;
    }

    const batchId = "BATCH-AV-" + Date.now().toString(36).toUpperCase();
    const barcode = Math.floor(1000000000000 + Math.random() * 9000000000000).toString();

    const created = addBatch({
      batchId,
      productId: "P-" + Date.now().toString(36),
      productName: productName.trim(),
      mfdDate,
      expiryDate,
      barcode,
      initialStock: parseInt(initialStock) || 100,
      unitPrice: parseFloat(unitPrice) || 299,
      location: "Store Counter",
    });

    setBatches([created, ...batches]);
    setProductName("");
    alert(`Batch ${batchId} Created Successfully! Barcode: ${barcode}`);
  };

  const printTSCLabel = (b: ProductBatch) => {
    const printWindow = window.open("", "_blank", "width=450,height=350");
    if (!printWindow) {
      alert("Pop-up blocked! Please allow pop-ups to automate printing.");
      return;
    }

    const w = labelWidth;
    const h = labelHeight;

    const rotationStyle =
      orientation === "rotated"
        ? `transform: rotate(90deg); transform-origin: center center; width: ${h}mm; height: ${w}mm;`
        : `width: ${w - 2}mm; height: ${h - 2}mm;`;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>TSC TTP-244 Pro Label - ${b.barcode}</title>
          <style>
            @page {
              size: ${w}mm ${h}mm ${orientation === "rotated" ? "portrait" : "landscape"};
              margin: 0;
            }
            html, body {
              margin: 0;
              padding: 0;
              width: ${w}mm;
              height: ${h}mm;
              background: #ffffff;
              font-family: Arial, Helvetica, sans-serif;
              overflow: hidden;
            }
            .label-wrapper {
              box-sizing: border-box;
              padding: 1.5mm;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              text-align: center;
              ${rotationStyle}
            }
            .p-name {
              font-size: 8pt;
              font-weight: 800;
              color: #000000;
              line-height: 1.1;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              max-width: 100%;
            }
            .mfd-exp {
              font-size: 6pt;
              font-weight: 700;
              color: #111111;
              margin: 1px 0;
            }
            .barcode-svg {
              width: 90%;
              height: 10mm;
              margin: 1px 0;
            }
            .b-code {
              font-family: monospace;
              font-size: 7.5pt;
              font-weight: 900;
              letter-spacing: 1px;
              color: #000000;
            }
          </style>
        </head>
        <body onload="window.print(); setTimeout(function(){ window.close(); }, 600);">
          <div class="label-wrapper">
            <div class="p-name">${b.productName}</div>
            <div class="mfd-exp">MFD: ${b.mfdDate || b.manufacturedDate} | EXP: ${b.expiryDate}</div>
            <svg class="barcode-svg" viewBox="0 0 200 35">
              <rect x="0" y="0" width="200" height="35" fill="#ffffff" />
              <g fill="#000000">
                <rect x="10" y="3" width="3" height="28" /><rect x="15" y="3" width="1" height="28" /><rect x="18" y="3" width="4" height="28" /><rect x="24" y="3" width="2" height="28" /><rect x="28" y="3" width="5" height="28" /><rect x="35" y="3" width="1" height="28" /><rect x="38" y="3" width="3" height="28" /><rect x="43" y="3" width="4" height="28" /><rect x="49" y="3" width="2" height="28" /><rect x="53" y="3" width="6" height="28" /><rect x="61" y="3" width="2" height="28" /><rect x="65" y="3" width="4" height="28" /><rect x="71" y="3" width="1" height="28" /><rect x="74" y="3" width="3" height="28" /><rect x="79" y="3" width="5" height="28" /><rect x="86" y="3" width="2" height="28" /><rect x="90" y="3" width="4" height="28" /><rect x="96" y="3" width="1" height="28" /><rect x="100" y="3" width="3" height="28" /><rect x="105" y="3" width="5" height="28" /><rect x="112" y="3" width="2" height="28" /><rect x="116" y="3" width="4" height="28" /><rect x="122" y="3" width="1" height="28" /><rect x="125" y="3" width="3" height="28" /><rect x="130" y="3" width="5" height="28" /><rect x="137" y="3" width="2" height="28" /><rect x="141" y="3" width="4" height="28" /><rect x="147" y="3" width="1" height="28" /><rect x="150" y="3" width="3" height="28" /><rect x="155" y="3" width="5" height="28" /><rect x="162" y="3" width="2" height="28" /><rect x="166" y="3" width="4" height="28" /><rect x="172" y="3" width="2" height="28" /><rect x="176" y="3" width="5" height="28" /><rect x="183" y="3" width="3" height="28" />
              </g>
            </svg>
            <div class="b-code">${b.barcode}</div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  const downloadTSPLFile = (b: ProductBatch) => {
    const tsplCommands = `SIZE ${labelWidth} mm, ${labelHeight} mm
GAP 3 mm, 0 mm
DIRECTION 1,0
CLS
TEXT 20,10,"2",0,1,1,"${b.productName.slice(0, 24)}"
TEXT 20,30,"1",0,1,1,"MFD: ${b.mfdDate || b.manufacturedDate}  EXP: ${b.expiryDate}"
BARCODE 20,50,"128",50,1,0,2,2,"${b.barcode}"
PRINT 1,1
`;
    const blob = new Blob([tsplCommands], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `label_${b.barcode}.tspl`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#faf6f0] border border-[#e8ddd0] rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h4 className="text-xs font-extrabold text-[#2d1b15] uppercase tracking-wider">
            TSC TTP-244 PRO LABEL PRINTER SETUP
          </h4>
          <p className="text-[11px] text-[#6b5347] mt-0.5">
            Select physical sticker label dimensions and rotation orientation to prevent sideways misprints.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-bold">
          <div>
            <label className="block text-[9px] uppercase text-[#6b5347] mb-1">Label Size</label>
            <select
              value={`${labelWidth}x${labelHeight}`}
              onChange={(e) => {
                const [w, h] = e.target.value.split("x").map(Number);
                setLabelWidth(w);
                setLabelHeight(h);
              }}
              className="border border-[#e8ddd0] rounded px-2.5 py-1.5 bg-white text-xs font-semibold focus:outline-none focus:border-[#8b1a1a]"
            >
              <option value="50x25">50mm x 25mm (Standard TSC 2-inch Roll)</option>
              <option value="50x30">50mm x 30mm</option>
              <option value="38x25">38mm x 25mm</option>
            </select>
          </div>

          <div>
            <label className="block text-[9px] uppercase text-[#6b5347] mb-1">Print Orientation</label>
            <select
              value={orientation}
              onChange={(e) => setOrientation(e.target.value as "standard" | "rotated")}
              className="border border-[#e8ddd0] rounded px-2.5 py-1.5 bg-white text-xs font-semibold focus:outline-none focus:border-[#8b1a1a]"
            >
              <option value="standard">Standard Horizontal (0° Normal)</option>
              <option value="rotated">Rotated Sideways (90° Vertical Fix)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 border border-[#e8ddd0] shadow-xs">
        <h3 className="text-xs font-extrabold text-[#2d1b15] uppercase tracking-wider mb-3">
          CREATE NEW INVENTORY BATCH & BARCODE
        </h3>

        <form onSubmit={handleCreateBatch} className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
          <div className="md:col-span-2">
            <label className="block font-bold text-[#2d1b15] uppercase mb-1">Product Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Organic Moringa Leaf Powder 250g"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full border border-[#e8ddd0] rounded px-3 py-2 text-xs focus:outline-none focus:border-[#8b1a1a]"
            />
          </div>

          <div>
            <label className="block font-bold text-[#2d1b15] uppercase mb-1">MFD Date *</label>
            <input
              type="date"
              required
              value={mfdDate}
              onChange={(e) => setMfdDate(e.target.value)}
              className="w-full border border-[#e8ddd0] rounded px-3 py-2 text-xs focus:outline-none focus:border-[#8b1a1a] font-mono"
            />
          </div>

          <div>
            <label className="block font-bold text-[#2d1b15] uppercase mb-1">Expiry Date *</label>
            <input
              type="date"
              required
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full border border-[#e8ddd0] rounded px-3 py-2 text-xs focus:outline-none focus:border-[#8b1a1a] font-mono"
            />
          </div>

          <div>
            <label className="block font-bold text-[#2d1b15] uppercase mb-1">Stock Quantity</label>
            <input
              type="number"
              value={initialStock}
              onChange={(e) => setInitialStock(e.target.value)}
              className="w-full border border-[#e8ddd0] rounded px-3 py-2 text-xs focus:outline-none focus:border-[#8b1a1a] font-mono"
            />
          </div>

          <div className="md:col-span-5 flex justify-end">
            <button
              type="submit"
              className="bg-[#8b1a1a] hover:bg-[#6d1414] text-white font-bold text-xs px-6 py-2.5 rounded shadow transition-colors uppercase tracking-wider"
            >
              CREATE BATCH & GENERATE BARCODE
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {batches.map((b) => (
          <div key={b.batchId || b.id} className="bg-white rounded-xl p-4 border border-[#e8ddd0] shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="font-mono text-xs font-extrabold bg-[#2d1b15] text-white px-2 py-0.5 rounded">
                  {b.batchId || b.id}
                </span>
                <span className="text-[10px] font-bold text-[#6b5347] uppercase">
                  STOCK: {b.currentStock ?? b.quantity} UNITS
                </span>
              </div>
              <h4 className="font-bold text-xs text-[#2d1b15]">{b.productName}</h4>
              <div className="text-[11px] text-[#6b5347] mt-1 space-y-0.5">
                <div>MFD: <span className="font-semibold text-gray-800">{b.mfdDate || b.manufacturedDate}</span></div>
                <div>EXP: <span className="font-semibold text-gray-800">{b.expiryDate}</span></div>
              </div>

              <div className="my-3 text-center bg-[#faf6f0] p-2.5 rounded border border-[#e8ddd0]">
                <svg className="w-full h-9 mx-auto" viewBox="0 0 200 35">
                  <rect x="0" y="0" width="200" height="35" fill="#ffffff" />
                  <g fill="#000000">
                    <rect x="10" y="3" width="3" height="28" /><rect x="15" y="3" width="1" height="28" /><rect x="18" y="3" width="4" height="28" /><rect x="24" y="3" width="2" height="28" /><rect x="28" y="3" width="5" height="28" /><rect x="35" y="3" width="1" height="28" /><rect x="38" y="3" width="3" height="28" /><rect x="43" y="3" width="4" height="28" /><rect x="49" y="3" width="2" height="28" /><rect x="53" y="3" width="6" height="28" /><rect x="61" y="3" width="2" height="28" /><rect x="65" y="3" width="4" height="28" /><rect x="71" y="3" width="1" height="28" /><rect x="74" y="3" width="3" height="28" /><rect x="79" y="3" width="5" height="28" /><rect x="86" y="3" width="2" height="28" /><rect x="90" y="3" width="4" height="28" /><rect x="96" y="3" width="1" height="28" /><rect x="100" y="3" width="3" height="28" /><rect x="105" y="3" width="5" height="28" /><rect x="112" y="3" width="2" height="28" /><rect x="116" y="3" width="4" height="28" /><rect x="122" y="3" width="1" height="28" /><rect x="125" y="3" width="3" height="28" /><rect x="130" y="3" width="5" height="28" /><rect x="137" y="3" width="2" height="28" /><rect x="141" y="3" width="4" height="28" /><rect x="147" y="3" width="1" height="28" /><rect x="150" y="3" width="3" height="28" /><rect x="155" y="3" width="5" height="28" /><rect x="162" y="3" width="2" height="28" /><rect x="166" y="3" width="4" height="28" /><rect x="172" y="3" width="2" height="28" /><rect x="176" y="3" width="5" height="28" /><rect x="183" y="3" width="3" height="28" />
                  </g>
                </svg>
                <div className="font-mono text-xs font-extrabold tracking-widest text-[#2d1b15] mt-1">
                  {b.barcode}
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => printTSCLabel(b)}
                className="w-full bg-[#8b1a1a] hover:bg-[#6d1414] text-white font-bold text-xs py-2 rounded transition-colors uppercase tracking-wider"
              >
                PRINT TO TSC PRINTER ({labelWidth}x{labelHeight}MM)
              </button>
              <button
                type="button"
                onClick={() => downloadTSPLFile(b)}
                className="w-full bg-[#2d1b15] hover:bg-black text-white font-bold text-xs py-1.5 rounded transition-colors uppercase tracking-wider"
              >
                DOWNLOAD TSPL RAW FILE
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
