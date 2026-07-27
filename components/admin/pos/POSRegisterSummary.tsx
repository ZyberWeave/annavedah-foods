"use client";

import { useState, useEffect } from "react";
import { closePOSShift, getCurrentPOSShift, getPOSOrders, openPOSShift, type POSOrder, type POSShift } from "@/lib/pos-orders-storage";

export default function POSRegisterSummary() {
  const [orders, setOrders] = useState<POSOrder[]>([]);
  const [shift,setShift]=useState<POSShift|null>(null),[openingFloat,setOpeningFloat]=useState("0"),[closingCash,setClosingCash]=useState(""),[shiftError,setShiftError]=useState(""),[shiftBusy,setShiftBusy]=useState(false);
  const [lastClosed,setLastClosed]=useState<POSShift|null>(null);

  useEffect(() => {
    const load=()=>Promise.all([getPOSOrders(),getCurrentPOSShift()]).then(([o,s])=>{setOrders(o);setShift(s)}).catch((e)=>setShiftError(e.message));void load();window.addEventListener("pos-sale-completed",load);return()=>window.removeEventListener("pos-sale-completed",load);
  }, []);

  const shiftOrders=shift?orders.filter(o=>o.shiftId===shift.id):[],totalSales=shift?.totalSales||0,cashSales=shift?.cashSales||0,upiSales=shift?.upiSales||0,cardSales=shift?.cardSales||0;
  const startShift=async()=>{setShiftBusy(true);setShiftError("");try{setShift(await openPOSShift(Number(openingFloat)))}catch(e){setShiftError(e instanceof Error?e.message:"Unable to open shift")}finally{setShiftBusy(false)}};
  const endShift=async()=>{setShiftBusy(true);setShiftError("");try{setLastClosed(await closePOSShift(Number(closingCash)));setShift(null);setClosingCash("")}catch(e){setShiftError(e instanceof Error?e.message:"Unable to close shift")}finally{setShiftBusy(false)}};

  const handlePrintPastReceipt = (order: POSOrder) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Bill Receipt #${order.invoiceNo}</title>
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
            <div>Store Counter Terminal</div>
            <div>Tax Invoice #: ${order.invoiceNo}</div>
            <div>${order.date}</div>
            <div>Customer: ${order.customerName}</div>
          </div>
          <div class="divider"></div>
          ${order.items
            .map(
              (i) => `
            <div class="row">
              <span>${i.qty}x ${i.name}</span>
              <span>INR ${i.price * i.qty}.00</span>
            </div>
            <div style="font-size:8px; color:#444;">Batch: ${i.batchId} | Exp: ${i.expiryDate}</div>
          `
            )
            .join("")}
          <div class="divider"></div>
          <div class="row"><span>Subtotal:</span><span>INR ${order.subtotal}.00</span></div>
          <div class="row"><span>GST (5%):</span><span>INR ${order.gstAmount.toFixed(2)}</span></div>
          ${order.discountAmount > 0 ? `<div class="row"><span>Discount:</span><span>-INR ${order.discountAmount.toFixed(2)}</span></div>` : ""}
          <div class="divider"></div>
          <div class="row total"><span>GRAND TOTAL:</span><span>INR ${order.total}.00</span></div>
          <div class="row"><span>Payment Mode:</span><span>${order.paymentMethod}</span></div>
          <div class="divider"></div>
          <div class="footer">
            Thank you for shopping at Annavedah Foods!<br/>
            Visit again
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

  const handleSendWhatsAppReceipt = (order: POSOrder) => {
    if (!order.customerPhone) {
      alert("No customer phone number recorded for this order!");
      return;
    }

    const itemsSummary = order.items.map((i) => `${i.qty}x ${i.name} (Batch: ${i.batchId})`).join("\n");
    const msg = `ANNAVEDAH FOODS TAX INVOICE

Hi ${order.customerName},

Thank you for shopping at our Store Counter! Here is your itemized bill receipt:

Invoice #: ${order.invoiceNo}
Date: ${order.date}

Purchased Items:
${itemsSummary}

Subtotal: INR ${order.subtotal}.00
GST (5%): INR ${order.gstAmount.toFixed(2)}
Grand Total: INR ${order.total}.00
Payment Mode: ${order.paymentMethod}

Thank you for choosing Annavedah Foods!`;

    const cleanPhone = order.customerPhone.replace(/\D/g, "");
    const whatsappUrl = `https://api.whatsapp.com/send?phone=91${cleanPhone}&text=${encodeURIComponent(msg)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="space-y-8">
      {/* CASH REGISTER STATS */}
      <div className="bg-white rounded-xl p-6 border-2 border-[#e8ddd0] shadow-xs">
        <div className="flex items-center justify-between border-b border-[#e8ddd0] pb-4 mb-6">
          <div>
            <h2 className="text-sm font-extrabold text-[#2d1b15] uppercase tracking-wider">
              POS SHIFT RECONCILIATION
            </h2>
            <p className="text-xs text-[#6b5347] mt-0.5">
              Persisted opening cash, shift sales, closing cash, and drawer variance.
            </p>
          </div>
          <span className="bg-[#8b1a1a]/10 text-[#8b1a1a] text-xs font-bold px-3 py-1 rounded border border-[#c9a45c]/30 uppercase tracking-wider">
            {shift?`SHIFT #${shift.id} · ${shift.businessDate}`:"NO OPEN SHIFT"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
          <div className="bg-[#faf6f0] rounded-lg p-4 border border-[#e8ddd0]">
            <span className="text-[10px] font-bold text-[#6b5347] uppercase tracking-wider block">TOTAL POS SALES</span>
            <span className="text-2xl font-extrabold text-[#2d1b15] mt-1 block">INR {totalSales.toLocaleString()}.00</span>
            <span className="text-xs font-semibold text-[#8b1a1a] mt-1 block">{shift?.orderCount||shiftOrders.length} Completed Orders</span>
          </div>

          <div className="bg-[#faf6f0] rounded-lg p-4 border border-[#e8ddd0]">
            <span className="text-[10px] font-bold text-[#6b5347] uppercase tracking-wider block">TODAY&apos;S CASH SALES</span>
            <span className="text-2xl font-extrabold text-[#2d1b15] mt-1 block">INR {cashSales.toLocaleString()}.00</span>
            <span className="text-xs font-semibold text-[#8b1a1a] mt-1 block">Excludes any opening float</span>
          </div>

          <div className="bg-[#faf6f0] rounded-lg p-4 border border-[#e8ddd0]">
            <span className="text-[10px] font-bold text-[#6b5347] uppercase tracking-wider block">UPI & DIGITAL QR</span>
            <span className="text-2xl font-extrabold text-[#2d1b15] mt-1 block">INR {upiSales.toLocaleString()}.00</span>
            <span className="text-xs font-semibold text-[#8b1a1a] mt-1 block">Instant Settlements</span>
          </div>

          <div className="bg-[#faf6f0] rounded-lg p-4 border border-[#e8ddd0]">
            <span className="text-[10px] font-bold text-[#6b5347] uppercase tracking-wider block">CARD TERMINAL</span>
            <span className="text-2xl font-extrabold text-[#2d1b15] mt-1 block">INR {cardSales.toLocaleString()}.00</span>
            <span className="text-xs font-semibold text-[#8b1a1a] mt-1 block">Card Swipes</span>
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-5">{shift?<div className="flex flex-wrap items-end gap-4"><div className="text-sm"><b>Opened:</b> {new Date(shift.openedAt).toLocaleString("en-IN")}<br/><b>Opening float:</b> INR {shift.openingFloat.toLocaleString()}<br/><b>Expected drawer:</b> INR {(shift.openingFloat+shift.cashSales).toLocaleString()}</div><label className="text-xs font-bold">Counted closing cash<input type="number" min="0" value={closingCash} onChange={e=>setClosingCash(e.target.value)} className="mt-1 block rounded border px-3 py-2"/></label><button disabled={shiftBusy||closingCash===""} onClick={endShift} className="rounded bg-red-700 px-4 py-2 text-xs font-bold text-white disabled:opacity-50">Close & reconcile shift</button></div>:<div className="flex flex-wrap items-end gap-4"><label className="text-xs font-bold">Opening cash float<input type="number" min="0" value={openingFloat} onChange={e=>setOpeningFloat(e.target.value)} className="mt-1 block rounded border px-3 py-2"/></label><button disabled={shiftBusy} onClick={startShift} className="rounded bg-[#8b1a1a] px-4 py-2 text-xs font-bold text-white">Open POS shift</button><span className="text-xs text-gray-500">Sales are rejected until a shift is open.</span></div>}{shiftError&&<p className="mt-3 text-xs font-semibold text-red-700">{shiftError}</p>}{lastClosed&&<p className="mt-3 rounded bg-amber-50 p-3 text-sm font-bold text-amber-900">Shift #{lastClosed.id} closed. Expected INR {lastClosed.expectedCash?.toLocaleString()}, counted INR {lastClosed.closingCash?.toLocaleString()}, variance INR {lastClosed.cashDifference?.toLocaleString()}.</p>}</div>

      {/* PAST POS ORDERS AUDIT TABLE */}
      <div className="bg-white rounded-xl p-6 border-2 border-[#e8ddd0] shadow-xs space-y-4">
        <div className="flex justify-between items-center border-b border-[#e8ddd0] pb-4">
          <div>
            <h3 className="text-sm font-extrabold text-[#2d1b15] uppercase tracking-wider">
              PAST POS ORDERS AUDIT ({orders.length} STORED TRANSACTIONS)
            </h3>
            <p className="text-xs text-[#6b5347] mt-0.5">
              Re-print 80mm thermal receipts or resend digital WhatsApp receipts for past store sales.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#faf6f0] text-[#6b5347] uppercase font-bold border-b border-[#e8ddd0]">
              <tr>
                <th className="p-3">Invoice #</th>
                <th className="p-3">Date & Time</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Items</th>
                <th className="p-3">Payment</th>
                <th className="p-3">Total</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8ddd0]">
              {orders.map((o) => (
                <tr key={o.invoiceNo} className="hover:bg-[#faf6f0]/50 transition-colors">
                  <td className="p-3 font-mono font-bold text-[#8b1a1a]">{o.invoiceNo}</td>
                  <td className="p-3 text-[#6b5347]">{o.date}</td>
                  <td className="p-3">
                    <span className="font-bold text-[#2d1b15] block">{o.customerName}</span>
                    <span className="text-[10px] text-[#6b5347] font-mono">{o.customerPhone || "Walk-in"}</span>
                  </td>
                  <td className="p-3 font-semibold">{o.items.length} items</td>
                  <td className="p-3">
                    <span className="bg-[#faf6f0] text-[#2d1b15] px-2 py-0.5 rounded font-bold border border-[#e8ddd0]">
                      {o.paymentMethod}
                    </span>
                  </td>
                  <td className="p-3 font-mono font-bold text-base text-[#2d1b15]">INR {o.total}.00</td>
                  <td className="p-3 text-right space-x-2">
                    <button
                      onClick={() => handlePrintPastReceipt(o)}
                      className="bg-[#8b1a1a] hover:bg-[#6d1414] text-white font-bold text-[10px] px-3 py-1.5 rounded uppercase tracking-wider shadow-xs"
                    >
                      REPRINT 80MM BILL
                    </button>
                    <button
                      onClick={() => handleSendWhatsAppReceipt(o)}
                      className="bg-[#2d1b15] hover:bg-black text-white font-bold text-[10px] px-3 py-1.5 rounded uppercase tracking-wider shadow-xs"
                    >
                      SEND WHATSAPP
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
