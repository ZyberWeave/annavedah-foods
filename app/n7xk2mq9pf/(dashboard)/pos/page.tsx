"use client";

import { useState } from "react";
import Link from "next/link";
import BarcodeScannerGuard from "@/components/admin/BarcodeScannerGuard";
import { deductBatchStock, type ProductBatch, type ExpiryAnalysis } from "@/lib/batch-inventory";
import { ADMIN_SLUG } from "@/lib/admin-config";

type POSCartItem = {
  batch: ProductBatch;
  qty: number;
};

export default function OfflinePOSPage() {
  const [cart, setCart] = useState<POSCartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "UPI" | "CARD">("UPI");
  const [completedOrder, setCompletedOrder] = useState<any>(null);
  const [notification, setNotification] = useState("");

  const handleItemScanned = (batch: ProductBatch, analysis: ExpiryAnalysis) => {
    if (analysis.isBlocked) {
      setNotification(`🚨 CANNOT ADD EXPIRED BATCH '${batch.barcode}' TO POS CART!`);
      setTimeout(() => setNotification(""), 4000);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((i) => i.batch.id === batch.id);
      if (existing) {
        return prev.map((i) =>
          i.batch.id === batch.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { batch, qty: 1 }];
    });

    setNotification(`Added 1x '${batch.productName}' (Batch ${batch.id}) to POS Cart!`);
    setTimeout(() => setNotification(""), 3000);
  };

  const handleQtyChange = (batchId: string, qty: number) => {
    setCart((prev) =>
      qty <= 0
        ? prev.filter((i) => i.batch.id !== batchId)
        : prev.map((i) => (i.batch.id === batchId ? { ...i, qty } : i))
    );
  };

  const subtotal = cart.reduce((sum, item) => sum + item.batch.sellingPrice * item.qty, 0);
  const taxAmount = Math.round(subtotal * 0.05); // 5% GST
  const grandTotal = subtotal + taxAmount;

  const handleCheckout = () => {
    if (cart.length === 0) return;

    for (const item of cart) {
      deductBatchStock(item.batch.barcode, item.qty);
    }

    const orderId = `POS-AV-${Date.now().toString().slice(-6)}`;
    const orderData = {
      orderId,
      customerName: customerName || "Counter Guest",
      paymentMethod,
      items: [...cart],
      subtotal,
      taxAmount,
      grandTotal,
      createdAt: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
    };

    setCompletedOrder(orderData);
    setCart([]);
    setCustomerName("");
  };

  return (
    <div className="min-h-screen bg-[#faf6f0]">
      {/* POS Header */}
      <header className="bg-[#2d1b15] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#8b1a1a] rounded-full flex items-center justify-center font-bold text-sm text-white">
              POS
            </div>
            <div>
              <span className="font-semibold text-base block leading-none">Annavedah Foods Offline POS</span>
              <span className="text-[10px] text-[#c9a45c]">Physical Store Counter & Barcode Terminal</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link href={`/${ADMIN_SLUG}`} className="text-gray-300 hover:text-white transition-colors">
              ← Admin Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {notification && (
          <div className="bg-[#8b1a1a] text-white px-4 py-3 rounded-xl text-sm font-bold mb-6 shadow-md animate-bounce">
            {notification}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Barcode Scanner Guard */}
          <div className="lg:col-span-7 space-y-6">
            <BarcodeScannerGuard onItemScanned={handleItemScanned} />
          </div>

          {/* Right Column: POS Counter Cart & Receipt */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl border-2 border-[#e8ddd0] p-6 shadow-sm sticky top-8">
              <h2 className="text-lg font-bold text-[#2d1b15] border-b border-[#e8ddd0] pb-3 mb-4 flex items-center justify-between">
                <span>🛒 Counter Sales Cart</span>
                <span className="text-xs bg-[#faf6f0] text-[#8b1a1a] px-2.5 py-1 rounded-full font-bold border border-[#c9a45c]/30">
                  {cart.reduce((sum, i) => sum + i.qty, 0)} Items
                </span>
              </h2>

              {cart.length === 0 ? (
                <div className="py-12 text-center text-[#6b5347] text-sm italic border-2 border-dashed border-[#e8ddd0] rounded-2xl">
                  Scan barcodes using scanner above to add items to cart.
                </div>
              ) : (
                <div className="space-y-3 mb-6">
                  {cart.map((item) => (
                    <div
                      key={item.batch.id}
                      className="flex items-center justify-between bg-[#faf6f0] border border-[#e8ddd0] rounded-xl p-3 text-sm"
                    >
                      <div>
                        <h4 className="font-bold text-[#2d1b15] text-xs">{item.batch.productName}</h4>
                        <p className="text-[11px] text-[#6b5347] font-mono">
                          Batch: {item.batch.id} | Exp: {item.batch.expiryDate}
                        </p>
                        <p className="text-xs text-[#8b1a1a] font-bold mt-0.5">
                          ₹{item.batch.sellingPrice * item.qty}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          value={item.qty}
                          onChange={(e) => handleQtyChange(item.batch.id, parseInt(e.target.value) || 0)}
                          className="w-14 border border-[#e8ddd0] rounded-lg px-2 py-1 text-center text-xs font-bold bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => handleQtyChange(item.batch.id, 0)}
                          className="text-[#8b1a1a] hover:underline text-xs font-bold"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Pricing Breakdown */}
                  <div className="border-t border-[#e8ddd0] pt-4 space-y-1 text-xs text-[#6b5347] font-medium">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GST (5%):</span>
                      <span>₹{taxAmount}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-[#2d1b15] pt-2 border-t border-[#e8ddd0]">
                      <span>Grand Total:</span>
                      <span className="text-[#8b1a1a] text-base">₹{grandTotal}</span>
                    </div>
                  </div>

                  {/* Customer & Payment details */}
                  <div className="space-y-3 pt-4 border-t border-[#e8ddd0]">
                    <div>
                      <label className="block text-[11px] font-bold text-[#2d1b15] uppercase tracking-wider mb-1">
                        Customer Name (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Priya Sharma"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full border-2 border-[#e8ddd0] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#8b1a1a]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#2d1b15] uppercase tracking-wider mb-1">
                        Payment Method
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(["UPI", "CASH", "CARD"] as const).map((method) => (
                          <button
                            key={method}
                            type="button"
                            onClick={() => setPaymentMethod(method)}
                            className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                              paymentMethod === method
                                ? "bg-[#8b1a1a] text-white border-[#8b1a1a] shadow"
                                : "bg-white text-[#2d1b15] border-[#e8ddd0] hover:bg-[#faf6f0]"
                            }`}
                          >
                            {method}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleCheckout}
                      className="w-full bg-[#8b1a1a] hover:bg-[#6d1414] text-white font-bold text-sm py-3 rounded-xl shadow transition-colors mt-2"
                    >
                      Complete Order & Print Receipt
                    </button>
                  </div>
                </div>
              )}

              {/* Completed Receipt Modal / Print Preview */}
              {completedOrder && (
                <div className="mt-6 p-4 bg-[#8b1a1a]/10 border border-[#c9a45c]/30 rounded-2xl text-center">
                  <h3 className="text-sm font-bold text-[#8b1a1a]">🎉 POS SALE COMPLETED</h3>
                  <p className="text-xs text-[#2d1b15] font-mono mt-1">Invoice #{completedOrder.orderId}</p>

                  <div className="my-3 bg-white p-3 rounded-xl border border-[#e8ddd0] text-left text-xs font-mono">
                    <p className="font-bold border-b pb-1 text-center text-[#2d1b15]">ANNAVEDAH FOODS STORE RECEIPT</p>
                    <p className="mt-1">Date: {completedOrder.createdAt}</p>
                    <p>Customer: {completedOrder.customerName}</p>
                    <p>Payment: {completedOrder.paymentMethod}</p>
                    <div className="border-t border-b my-2 py-1 space-y-1">
                      {completedOrder.items.map((i: any) => (
                        <div key={i.batch.id} className="flex justify-between">
                          <span>{i.qty}x {i.batch.productName}</span>
                          <span>₹{i.batch.sellingPrice * i.qty}</span>
                        </div>
                      ))}
                    </div>
                    <p className="font-bold text-right text-sm text-[#8b1a1a]">TOTAL: ₹{completedOrder.grandTotal}</p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => {
                        const printWin = window.open("", "_blank", "width=380,height=600");
                        if (printWin) {
                          const itemsHtml = completedOrder.items.map((i: any) => `
                            <tr>
                              <td style="padding: 2px 0;">${i.qty}x ${i.batch.productName}</td>
                              <td style="text-align: right;">₹${i.batch.sellingPrice * i.qty}</td>
                            </tr>
                          `).join("");

                          printWin.document.write(`
                            <html>
                              <head>
                                <title>Receipt #${completedOrder.orderId}</title>
                                <style>
                                  @page { size: 80mm auto; margin: 0; }
                                  body { font-family: monospace; font-size: 9pt; margin: 0; padding: 4mm; width: 72mm; background: #fff; }
                                  .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 2mm; margin-bottom: 2mm; }
                                  .brand { font-size: 11pt; font-weight: bold; }
                                  table { width: 100%; font-size: 8.5pt; border-collapse: collapse; margin: 2mm 0; }
                                  .totals { border-top: 1px dashed #000; pt: 2mm; margin-top: 2mm; text-align: right; }
                                  .grand { font-size: 11pt; font-weight: bold; }
                                  .footer { text-align: center; margin-top: 4mm; font-size: 7.5pt; border-top: 1px dashed #000; padding-top: 2mm; }
                                </style>
                              </head>
                              <body onload="window.print(); setTimeout(function(){ window.close(); }, 500);">
                                <div class="header">
                                  <div class="brand">ANNAVEDAH FOODS</div>
                                  <div>Farm Pure Traditional Foods Store</div>
                                  <div>Invoice: ${completedOrder.orderId}</div>
                                  <div>Date: ${completedOrder.createdAt}</div>
                                </div>
                                <div>Customer: ${completedOrder.customerName}</div>
                                <div>Payment: ${completedOrder.paymentMethod}</div>
                                <table>
                                  <tbody>
                                    ${itemsHtml}
                                  </tbody>
                                </table>
                                <div class="totals">
                                  <div>Subtotal: ₹${completedOrder.subtotal}</div>
                                  <div>GST (5%): ₹${completedOrder.taxAmount}</div>
                                  <div class="grand">GRAND TOTAL: ₹${completedOrder.grandTotal}</div>
                                </div>
                                <div class="footer">
                                  Thank you for shopping with Annavedah Foods!<br/>
                                  Nourish your body with pure farm tradition 🌾
                                </div>
                              </body>
                            </html>
                          `);
                          printWin.document.close();
                        }
                      }}
                      className="w-full bg-[#8b1a1a] hover:bg-[#6d1414] text-white font-bold text-xs py-2.5 rounded-xl shadow flex items-center justify-center gap-1 transition-colors"
                    >
                      <span>⚡ Automate Print Bill Receipt (80mm Thermal)</span>
                    </button>

                    <button
                      onClick={() => setCompletedOrder(null)}
                      className="w-full bg-white border border-[#e8ddd0] text-[#2d1b15] font-bold text-xs py-2 rounded-xl hover:bg-[#faf6f0]"
                    >
                      New Sale
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
