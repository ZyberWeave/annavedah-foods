"use client";

import { useState } from "react";
import Link from "next/link";
import BarcodeScannerGuard from "@/components/admin/BarcodeScannerGuard";
import BarcodeGenerator from "@/components/admin/BarcodeGenerator";
import BatchProductSearch from "@/components/admin/pos/BatchProductSearch";
import CustomerPOSLookup from "@/components/admin/pos/CustomerPOSLookup";
import POSRegisterSummary from "@/components/admin/pos/POSRegisterSummary";
import { type ProductBatch, deductBatchStock } from "@/lib/batch-inventory";
import { ADMIN_SLUG } from "@/lib/admin-config";

type CartItem = {
  productId: string;
  name: string;
  price: number;
  qty: number;
  batchId: string;
  mfdDate: string;
  expiryDate: string;
  barcode: string;
};

export default function OfflinePOSPage() {
  const [activeTab, setActiveTab] = useState<"billing" | "inventory" | "printers" | "register">("billing");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "UPI" | "CARD">("UPI");
  const [customer, setCustomer] = useState<{
    name: string;
    phone: string;
    isFirstTime: boolean;
    discountPercent: number;
  }>({
    name: "Walk-in Customer",
    phone: "",
    isFirstTime: false,
    discountPercent: 0,
  });

  const [cashTendered, setCashTendered] = useState<string>("");
  const [lastBill, setLastBill] = useState<{
    invoiceNo: string;
    total: number;
    items: CartItem[];
    payment: string;
    date: string;
  } | null>(null);

  const handleAddBatchItem = (batchItem: {
    productId: string;
    productName: string;
    batchId: string;
    mfdDate: string;
    expiryDate: string;
    price: number;
    barcode: string;
  }) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.batchId === batchItem.batchId);
      if (existing) {
        return prev.map((item) =>
          item.batchId === batchItem.batchId ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [
        ...prev,
        {
          productId: batchItem.productId,
          name: batchItem.productName,
          price: batchItem.price,
          qty: 1,
          batchId: batchItem.batchId,
          mfdDate: batchItem.mfdDate,
          expiryDate: batchItem.expiryDate,
          barcode: batchItem.barcode,
        },
      ];
    });
  };

  const updateQty = (batchId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.batchId === batchId) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const subtotal = cart.reduce((acc, i) => acc + i.price * i.qty, 0);
  const discountAmount = (subtotal * customer.discountPercent) / 100;
  const gstAmount = ((subtotal - discountAmount) * 0.05);
  const grandTotal = Math.round(subtotal - discountAmount + gstAmount);

  const cashReturn = Math.max(0, (parseFloat(cashTendered) || 0) - grandTotal);

  const handleCompleteSale = () => {
    if (cart.length === 0) {
      alert("Cart is empty!");
      return;
    }

    cart.forEach((item) => {
      deductBatchStock(item.batchId, item.qty);
    });

    const invoiceNo = "INV-AV-" + Math.floor(100000 + Math.random() * 900000);
    const bill = {
      invoiceNo,
      total: grandTotal,
      items: [...cart],
      payment: paymentMethod,
      date: new Date().toLocaleString("en-IN"),
    };

    setLastBill(bill);
    setCart([]);
    alert(`Order ${invoiceNo} Completed Successfully! Batch stock deducted.`);
  };

  const handlePrint80mmBill = () => {
    if (!lastBill) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Bill Receipt #${lastBill.invoiceNo}</title>
          <style>
            @page { size: 80mm auto; margin: 0; }
            body { font-family: monospace; width: 78mm; padding: 4mm; font-size: 11px; color: #000; }
            .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 6px; margin-bottom: 6px; }
            .title { font-size: 14px; font-weight: bold; }
            .row { display: flex; justify-content: space-between; margin: 2px 0; }
            .divider { border-top: 1px dashed #000; margin: 6px 0; }
            .total { font-size: 13px; font-weight: bold; }
            .footer { text-align: center; margin-top: 10px; font-size: 9px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">ANNAVEDAH FOODS</div>
            <div>Offline Counter Terminal</div>
            <div>Tax Invoice #: ${lastBill.invoiceNo}</div>
            <div>${lastBill.date}</div>
            <div>Customer: ${customer.name}</div>
          </div>
          <div class="divider"></div>
          ${lastBill.items
            .map(
              (i) => `
            <div class="row">
              <span>${i.qty}x ${i.name}</span>
              <span>Rs ${i.price * i.qty}.00</span>
            </div>
            <div style="font-size:8px; color:#444;">Batch: ${i.batchId} | Exp: ${i.expiryDate}</div>
          `
            )
            .join("")}
          <div class="divider"></div>
          <div class="row"><span>Subtotal:</span><span>Rs ${subtotal}.00</span></div>
          <div class="row"><span>GST (5%):</span><span>Rs ${gstAmount.toFixed(2)}</span></div>
          ${customer.discountPercent > 0 ? `<div class="row"><span>Loyalty Discount (5%):</span><span>-Rs ${discountAmount.toFixed(2)}</span></div>` : ""}
          <div class="divider"></div>
          <div class="row total"><span>GRAND TOTAL:</span><span>Rs ${lastBill.total}.00</span></div>
          <div class="row"><span>Payment Mode:</span><span>${lastBill.payment}</span></div>
          <div class="divider"></div>
          <div class="footer">
            Thank you for shopping at Annavedah Foods!<br/>
            Visit again 🌾
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handleSendWhatsAppBill = () => {
    if (!lastBill || !customer.phone) {
      alert("Please enter customer phone number to send WhatsApp bill receipt!");
      return;
    }

    const itemsSummary = lastBill.items.map((i) => `${i.qty}x ${i.name} (Batch: ${i.batchId})`).join("\n");
    const msg = `🧾 *ANNAVEDAH FOODS TAX INVOICE*

Hi ${customer.name}!

Thank you for shopping at our Offline Counter! Here is your itemized bill receipt:

*Invoice #*: ${lastBill.invoiceNo}
*Date*: ${lastBill.date}

*Purchased Items*:
${itemsSummary}

*Grand Total*: *INR ${lastBill.total}.00*
*Payment Mode*: ${lastBill.payment}

Thank you for choosing Annavedah Foods! 🌾`;

    const cleanPhone = customer.phone.replace(/\D/g, "");
    const whatsappUrl = `https://api.whatsapp.com/send?phone=91${cleanPhone}&text=${encodeURIComponent(msg)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-[#faf6f0] p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* TOP POS HEADER */}
        <header className="bg-[#2d1b15] text-white rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 border-2 border-[#e8ddd0]">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#8b1a1a] rounded-xl flex items-center justify-center font-bold text-lg text-white shadow border border-[#c9a45c]/30">
              POS
            </div>
            <div>
              <h1 className="text-xl font-extrabold flex items-center gap-2">
                <span>🛒</span> Offline Counter & Multi-Batch Suite
              </h1>
              <p className="text-xs text-gray-300">
                Annavedah Foods Physical Store Terminal & Multi-Batch Inventory Center
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/${ADMIN_SLUG}`}
              className="bg-[#8b1a1a] hover:bg-[#6d1414] text-white text-xs font-bold px-4 py-2.5 rounded-xl border border-[#c9a45c]/30 transition-colors shadow"
            >
              ← Back to Admin Console
            </Link>
          </div>
        </header>

        {/* SECTION TABS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-white p-1.5 rounded-2xl border-2 border-[#e8ddd0] shadow-sm font-bold text-xs">
          <button
            onClick={() => setActiveTab("billing")}
            className={`py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === "billing" ? "bg-[#8b1a1a] text-white shadow" : "text-[#6b5347] hover:bg-[#faf6f0]"
            }`}
          >
            <span>🛒</span> Counter Billing Terminal
          </button>

          <button
            onClick={() => setActiveTab("inventory")}
            className={`py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === "inventory" ? "bg-[#8b1a1a] text-white shadow" : "text-[#6b5347] hover:bg-[#faf6f0]"
            }`}
          >
            <span>📦</span> Multi-Batch Inventory
          </button>

          <button
            onClick={() => setActiveTab("printers")}
            className={`py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === "printers" ? "bg-[#8b1a1a] text-white shadow" : "text-[#6b5347] hover:bg-[#faf6f0]"
            }`}
          >
            <span>🖨️</span> Printer Studio (TSC / 80mm)
          </button>

          <button
            onClick={() => setActiveTab("register")}
            className={`py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === "register" ? "bg-[#8b1a1a] text-white shadow" : "text-[#6b5347] hover:bg-[#faf6f0]"
            }`}
          >
            <span>📊</span> Sales Register Summary
          </button>
        </div>

        {/* TAB 1: COUNTER BILLING TERMINAL */}
        {activeTab === "billing" && (
          <div className="space-y-6">
            <BarcodeScannerGuard
              onScannedProductFound={(batch) => {
                handleAddBatchItem({
                  productId: batch.productId,
                  productName: batch.productName,
                  batchId: batch.batchId,
                  mfdDate: batch.mfdDate,
                  expiryDate: batch.expiryDate,
                  price: batch.unitPrice,
                  barcode: batch.barcode,
                });
              }}
            />

            <CustomerPOSLookup onCustomerIdentified={setCustomer} />

            <BatchProductSearch onSelectBatchItem={handleAddBatchItem} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-2xl p-6 border-2 border-[#e8ddd0] shadow-sm">
                <div className="flex items-center justify-between border-b border-[#e8ddd0] pb-4 mb-4">
                  <h3 className="font-extrabold text-[#2d1b15] text-sm uppercase tracking-wider flex items-center gap-2">
                    <span>🛍️</span> Billed Cart Items ({cart.length})
                  </h3>
                  {cart.length > 0 && (
                    <button
                      onClick={() => setCart([])}
                      className="text-xs text-red-600 font-bold hover:underline"
                    >
                      Clear Cart
                    </button>
                  )}
                </div>

                {cart.length === 0 ? (
                  <div className="p-12 text-center text-[#6b5347]">
                    <span className="text-4xl block mb-2">🛒</span>
                    <p className="font-bold text-sm text-[#2d1b15]">No items added to bill yet.</p>
                    <p className="text-xs text-[#6b5347] mt-1">
                      Scan a product barcode above or search by product name to select a manufacturing batch.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div
                        key={item.batchId}
                        className="p-4 rounded-xl border border-[#e8ddd0] bg-[#faf6f0] flex items-center justify-between gap-4"
                      >
                        <div>
                          <h4 className="font-extrabold text-sm text-[#2d1b15]">{item.name}</h4>
                          <div className="flex items-center gap-2 text-xs text-[#6b5347] mt-1">
                            <span className="font-mono bg-[#2d1b15] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                              Batch: {item.batchId}
                            </span>
                            <span>Exp: {item.expiryDate}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex items-center border border-gray-300 rounded-lg bg-white overflow-hidden">
                            <button
                              onClick={() => updateQty(item.batchId, -1)}
                              className="px-2.5 py-1 hover:bg-gray-100 font-bold text-gray-700"
                            >
                              -
                            </button>
                            <span className="px-3 font-extrabold text-xs text-[#2d1b15]">{item.qty}</span>
                            <button
                              onClick={() => updateQty(item.batchId, 1)}
                              className="px-2.5 py-1 hover:bg-gray-100 font-bold text-gray-700"
                            >
                              +
                            </button>
                          </div>

                          <div className="text-right min-w-[70px]">
                            <span className="font-extrabold text-sm text-[#8b1a1a]">
                              ₹{item.price * item.qty}.00
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl p-6 border-2 border-[#e8ddd0] shadow-sm space-y-5">
                <h3 className="font-extrabold text-[#2d1b15] text-sm uppercase tracking-wider border-b border-[#e8ddd0] pb-3">
                  Payment Summary
                </h3>

                <div className="space-y-2 text-xs text-[#6b5347]">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-bold text-[#2d1b15]">₹{subtotal}.00</span>
                  </div>
                  {customer.discountPercent > 0 && (
                    <div className="flex justify-between text-[#8b1a1a] font-bold">
                      <span>First Purchase Discount (5%):</span>
                      <span>-₹{discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>GST (5%):</span>
                    <span className="font-bold text-[#2d1b15]">₹{gstAmount.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-[#e8ddd0] pt-2 flex justify-between text-base font-extrabold text-[#2d1b15]">
                    <span>Grand Total:</span>
                    <span className="text-[#8b1a1a]">₹{grandTotal}.00</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2d1b15] uppercase tracking-wider mb-2">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["UPI", "CASH", "CARD"] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setPaymentMethod(m)}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                          paymentMethod === m
                            ? "bg-[#8b1a1a] text-white border-[#8b1a1a] shadow"
                            : "bg-[#faf6f0] border-[#e8ddd0] text-[#2d1b15] hover:bg-white"
                        }`}
                      >
                        {m === "UPI" ? "📱 UPI" : m === "CASH" ? "💵 Cash" : "💳 Card"}
                      </button>
                    ))}
                  </div>
                </div>

                {paymentMethod === "CASH" && (
                  <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl space-y-2">
                    <label className="block text-[11px] font-bold text-amber-900 uppercase">
                      Cash Tendered by Customer (₹)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 2000"
                      value={cashTendered}
                      onChange={(e) => setCashTendered(e.target.value)}
                      className="w-full border border-amber-300 rounded-lg px-3 py-2 text-sm font-extrabold text-gray-900 focus:outline-none focus:border-amber-600 bg-white"
                    />
                    {cashReturn > 0 && (
                      <div className="flex justify-between items-center text-xs font-extrabold text-amber-900 pt-1">
                        <span>Change to Return:</span>
                        <span className="text-sm text-[#8b1a1a]">₹{cashReturn}.00</span>
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={handleCompleteSale}
                  disabled={cart.length === 0}
                  className="w-full bg-[#8b1a1a] hover:bg-[#6d1414] disabled:opacity-50 text-white font-extrabold text-sm py-3.5 rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
                >
                  <span>✓</span> Complete Sale & Deduct Stock
                </button>

                {lastBill && (
                  <div className="pt-4 border-t border-[#e8ddd0] space-y-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block text-center">
                      Last Completed Bill: #{lastBill.invoiceNo}
                    </span>
                    <button
                      onClick={handlePrint80mmBill}
                      className="w-full bg-[#2d1b15] hover:bg-black text-white font-bold text-xs py-3 rounded-xl shadow transition-colors flex items-center justify-center gap-2"
                    >
                      <span>⚡</span> Automate Print Bill Receipt (80mm)
                    </button>
                    {customer.phone && (
                      <button
                        onClick={handleSendWhatsAppBill}
                        className="w-full bg-[#8b1a1a] hover:bg-[#6d1414] text-white font-bold text-xs py-3 rounded-xl shadow transition-colors flex items-center justify-center gap-2"
                      >
                        <span>📲</span> Send Digital Receipt via WhatsApp
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "inventory" && (
          <div className="bg-white rounded-2xl p-6 border-2 border-[#e8ddd0] shadow-sm">
            <h2 className="text-lg font-bold text-[#2d1b15] mb-4">Multi-Batch Expiry Inventory Center</h2>
            <p className="text-xs text-[#6b5347] mb-6">
              Manage and track manufacturing batches, expiry dates, and FEFO recommendations across physical store inventory.
            </p>
            <BarcodeGenerator />
          </div>
        )}

        {activeTab === "printers" && (
          <div className="bg-white rounded-2xl p-6 border-2 border-[#e8ddd0] shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-[#2d1b15]">TSC TTP-244 Pro & Thermal Printer Studio</h2>
            <BarcodeGenerator />
          </div>
        )}

        {activeTab === "register" && <POSRegisterSummary />}
      </div>
    </div>
  );
}
