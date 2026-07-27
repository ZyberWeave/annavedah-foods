import { neon } from "@neondatabase/serverless";

type SaleItem = { batchId: string; qty: number };
const sqlClient = () => {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured");
  return neon(process.env.DATABASE_URL);
};

const mapBatch = (row: Record<string, unknown>) => ({
  id: String(row.batchId), batchId: String(row.batchId), productId: String(row.productId),
  productName: String(row.productName), productSlug: String(row.productSlug || ""),
  mfdDate: String(row.mfdDate), manufacturedDate: String(row.mfdDate),
  expiryDate: String(row.expiryDate), barcode: String(row.barcode),
  initialStock: Number(row.initialStock), initialQuantity: Number(row.initialStock),
  currentStock: Number(row.currentStock), quantity: Number(row.currentStock),
  unitPrice: Number(row.unitPrice), sellingPrice: Number(row.unitPrice),
  costPrice: Number(row.costPrice || 0), location: String(row.location || ""),
  supplier: String(row.supplier || ""),
});

const mapOrder = (row: Record<string, unknown>) => ({
  invoiceNo: String(row.invoiceNo),
  shiftId: row.shiftId == null ? null : Number(row.shiftId),
  createdAt: new Date(String(row.createdAt)).toISOString(),
  date: new Date(String(row.createdAt)).toLocaleString("en-IN"),
  customerName: String(row.customerName), customerPhone: String(row.customerPhone || ""),
  subtotal: Number(row.subtotal), gstAmount: Number(row.gstAmount),
  discountAmount: Number(row.discountAmount), total: Number(row.total),
  paymentMethod: row.paymentMethod, items: row.items,
});

export async function listPOSBatches() {
  const rows = await sqlClient()`SELECT batch_id AS "batchId", product_id AS "productId",
    product_name AS "productName", product_slug AS "productSlug", mfd_date AS "mfdDate",
    expiry_date AS "expiryDate", barcode, initial_stock AS "initialStock",
    current_stock AS "currentStock", unit_price AS "unitPrice", cost_price AS "costPrice",
    location, supplier FROM annavedah.annavedah_pos_batches ORDER BY expiry_date, created_at DESC`;
  return rows.map((row) => mapBatch(row as Record<string, unknown>));
}

export async function createPOSBatch(input: Record<string, unknown>) {
  const productName = String(input.productName || "").trim();
  const productId = String(input.productId || input.productSlug || crypto.randomUUID()).slice(0, 100);
  const batchId = String(input.batchId || `BATCH-${crypto.randomUUID().slice(0, 12).toUpperCase()}`);
  const barcode = String(input.barcode || crypto.randomUUID().replace(/\D/g, "").padEnd(13, "0").slice(0, 13));
  const mfdDate = String(input.mfdDate || input.manufacturedDate || "");
  const expiryDate = String(input.expiryDate || "");
  const stock = Number(input.initialStock ?? input.initialQuantity ?? input.quantity);
  const unitPrice = Number(input.unitPrice ?? input.sellingPrice);
  const costPrice = Number(input.costPrice ?? 0);
  if (!productName || !/^\d{4}-\d{2}-\d{2}$/.test(mfdDate) || !/^\d{4}-\d{2}-\d{2}$/.test(expiryDate) ||
      expiryDate < mfdDate || !Number.isInteger(stock) || stock < 0 || !Number.isFinite(unitPrice) || unitPrice < 0 ||
      !/^[A-Za-z0-9_-]{3,80}$/.test(batchId) || !/^[A-Za-z0-9_-]{6,80}$/.test(barcode)) {
    throw new Error("Invalid batch details");
  }
  const rows = await sqlClient()`INSERT INTO annavedah.annavedah_pos_batches
    (batch_id, product_id, product_name, product_slug, mfd_date, expiry_date, barcode,
     initial_stock, current_stock, unit_price, cost_price, location, supplier)
    VALUES (${batchId}, ${productId}, ${productName}, ${String(input.productSlug || "") || null},
      ${mfdDate}, ${expiryDate}, ${barcode}, ${stock}, ${stock}, ${unitPrice}, ${costPrice},
      ${String(input.location || "") || null}, ${String(input.supplier || "") || null})
    RETURNING batch_id AS "batchId", product_id AS "productId", product_name AS "productName",
      product_slug AS "productSlug", mfd_date AS "mfdDate", expiry_date AS "expiryDate",
      barcode, initial_stock AS "initialStock", current_stock AS "currentStock",
      unit_price AS "unitPrice", cost_price AS "costPrice", location, supplier`;
  return mapBatch(rows[0] as Record<string, unknown>);
}

export async function listPOSOrders() {
  const rows = await sqlClient()`SELECT invoice_no AS "invoiceNo", customer_name AS "customerName",
    customer_phone AS "customerPhone", subtotal, gst_amount AS "gstAmount",
    discount_amount AS "discountAmount", total, payment_method AS "paymentMethod",
    shift_id AS "shiftId", items, created_at AS "createdAt" FROM annavedah.annavedah_pos_orders ORDER BY created_at DESC`;
  return rows.map((row) => mapOrder(row as Record<string, unknown>));
}

export async function lookupPOSCustomer(phone: string) {
  const rows = await sqlClient()`SELECT customer_name AS name, customer_phone AS phone,
    COUNT(*) OVER()::integer AS "ordersCount"
    FROM annavedah.annavedah_pos_orders WHERE customer_phone = ${phone}
    ORDER BY created_at DESC LIMIT 1`;
  return rows[0] || null;
}

export async function completePOSSale(input: Record<string, unknown>, createdBy: string) {
  const rawItems = Array.isArray(input.items) ? input.items : [];
  const items: SaleItem[] = rawItems.map((item) => ({
    batchId: String((item as Record<string, unknown>).batchId || ""),
    qty: Number((item as Record<string, unknown>).qty),
  }));
  if (!items.length || items.length > 100 || items.some((item) => !item.batchId || !Number.isInteger(item.qty) || item.qty <= 0 || item.qty > 10000)) {
    throw new Error("Invalid sale items");
  }
  const payment = String(input.paymentMethod || "");
  if (!["CASH", "UPI", "CARD"].includes(payment)) throw new Error("Invalid payment method");
  const customerName = String(input.customerName || "Walk-in Customer").trim().slice(0, 120) || "Walk-in Customer";
  const customerPhone = String(input.customerPhone || "").replace(/\D/g, "").slice(0, 15);
  // The first-order offer is a server-owned rule. Never trust a percentage
  // submitted by the POS browser.
  const priorCustomer = customerPhone.length >= 10 ? await lookupPOSCustomer(customerPhone) : null;
  const discountPercent = customerPhone.length >= 10 && !priorCustomer ? 5 : 0;
  const invoice = `INV-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  const rows = await sqlClient()`WITH active_shift AS (
      SELECT id FROM annavedah.annavedah_pos_shifts WHERE status = 'open' LIMIT 1 FOR UPDATE
    ), requested AS (
      SELECT "batchId" AS batch_id, SUM(qty)::integer AS qty
      FROM jsonb_to_recordset(${JSON.stringify(items)}::jsonb) AS x("batchId" text, qty integer)
      GROUP BY "batchId"
    ), eligible AS (
      SELECT COUNT(*) > 0 AND COUNT(*) = (SELECT COUNT(*) FROM requested) AS ok
      FROM requested r JOIN annavedah.annavedah_pos_batches b ON b.batch_id = r.batch_id
      WHERE b.current_stock >= r.qty AND b.expiry_date >= CURRENT_DATE
    ), order_data AS (
      SELECT COALESCE(SUM(b.unit_price * r.qty), 0)::numeric(12,2) AS subtotal,
        jsonb_agg(jsonb_build_object('productId', b.product_id, 'name', b.product_name,
          'price', b.unit_price, 'qty', r.qty, 'batchId', b.batch_id, 'mfdDate', b.mfd_date,
          'expiryDate', b.expiry_date, 'barcode', b.barcode) ORDER BY b.expiry_date) AS items
      FROM requested r JOIN annavedah.annavedah_pos_batches b ON b.batch_id = r.batch_id
    ), updated AS (
      UPDATE annavedah.annavedah_pos_batches b SET current_stock = b.current_stock - r.qty, updated_at = now()
      FROM requested r WHERE b.batch_id = r.batch_id AND (SELECT ok FROM eligible) AND EXISTS(SELECT 1 FROM active_shift)
      RETURNING b.batch_id
    ), inserted AS (
      INSERT INTO annavedah.annavedah_pos_orders (invoice_no, customer_name, customer_phone, subtotal, gst_amount,
        discount_amount, total, payment_method, items, created_by, shift_id)
      SELECT ${invoice}, ${customerName}, ${customerPhone}, d.subtotal,
        round((d.subtotal - d.subtotal * ${discountPercent} / 100) * 0.05, 2),
        round(d.subtotal * ${discountPercent} / 100, 2),
        round((d.subtotal - d.subtotal * ${discountPercent} / 100) * 1.05, 0),
        ${payment}, d.items, ${createdBy}, (SELECT id FROM active_shift) FROM order_data d
      WHERE (SELECT COUNT(*) FROM updated) = (SELECT COUNT(*) FROM requested)
        AND (SELECT COUNT(*) FROM requested) > 0
        AND EXISTS (SELECT 1 FROM active_shift)
      RETURNING invoice_no AS "invoiceNo", customer_name AS "customerName",
        customer_phone AS "customerPhone", subtotal, gst_amount AS "gstAmount",
        discount_amount AS "discountAmount", total, payment_method AS "paymentMethod",
        shift_id AS "shiftId", items, created_at AS "createdAt"
    ), accounted AS (
      UPDATE annavedah.annavedah_pos_shifts s SET total_sales=s.total_sales+i.total,
        cash_sales=s.cash_sales+CASE WHEN i."paymentMethod"='CASH' THEN i.total ELSE 0 END,
        upi_sales=s.upi_sales+CASE WHEN i."paymentMethod"='UPI' THEN i.total ELSE 0 END,
        card_sales=s.card_sales+CASE WHEN i."paymentMethod"='CARD' THEN i.total ELSE 0 END,
        order_count=s.order_count+1 FROM inserted i
      WHERE s.id=(SELECT id FROM active_shift) AND s.status='open' RETURNING s.id
    ) SELECT i.* FROM inserted i JOIN accounted a ON true`;
  if (!rows[0]) {
    if (!(await getCurrentPOSShift())) throw new Error("No open POS shift. Open a shift before recording sales.");
    throw new Error("Sale rejected: a batch is missing, expired, or has insufficient stock");
  }
  return mapOrder(rows[0] as Record<string, unknown>);
}

const mapShift = (row: Record<string, unknown>) => ({
  id: Number(row.id), businessDate: String(row.businessDate), status: String(row.status),
  openedBy: String(row.openedBy), openedAt: new Date(String(row.openedAt)).toISOString(),
  openingFloat: Number(row.openingFloat), cashSales: Number(row.cashSales || 0),
  upiSales: Number(row.upiSales || 0), cardSales: Number(row.cardSales || 0),
  totalSales: Number(row.totalSales || 0), orderCount: Number(row.orderCount || 0),
  closingCash: row.closingCash == null ? null : Number(row.closingCash),
  expectedCash: row.expectedCash == null ? null : Number(row.expectedCash),
  cashDifference: row.cashDifference == null ? null : Number(row.cashDifference),
  closedAt: row.closedAt ? new Date(String(row.closedAt)).toISOString() : null,
});

export async function getCurrentPOSShift() {
  const rows = await sqlClient()`SELECT s.id, s.business_date AS "businessDate", s.status,
    s.opened_by AS "openedBy", s.opened_at AS "openedAt", s.opening_float AS "openingFloat",
    s.closing_cash AS "closingCash", s.expected_cash AS "expectedCash",
    s.cash_difference AS "cashDifference", s.closed_at AS "closedAt",
    s.total_sales AS "totalSales",s.cash_sales AS "cashSales",s.upi_sales AS "upiSales",
    s.card_sales AS "cardSales",s.order_count AS "orderCount"
    FROM annavedah.annavedah_pos_shifts s WHERE s.status='open' LIMIT 1`;
  return rows[0] ? mapShift(rows[0] as Record<string, unknown>) : null;
}

export async function listPOSShifts() {
  const rows = await sqlClient()`SELECT s.id, s.business_date AS "businessDate", s.status,
    s.opened_by AS "openedBy", s.opened_at AS "openedAt", s.opening_float AS "openingFloat",
    s.closing_cash AS "closingCash", s.expected_cash AS "expectedCash", s.cash_difference AS "cashDifference",
    s.closed_at AS "closedAt",s.total_sales AS "totalSales",s.cash_sales AS "cashSales",
    s.upi_sales AS "upiSales",s.card_sales AS "cardSales",s.order_count AS "orderCount"
    FROM annavedah.annavedah_pos_shifts s ORDER BY s.opened_at DESC LIMIT 100`;
  return rows.map((row)=>mapShift(row as Record<string,unknown>));
}

export async function openPOSShift(openingFloat: number, openedBy: string) {
  if (!Number.isFinite(openingFloat) || openingFloat < 0 || openingFloat > 10_000_000) throw new Error("Invalid opening float");
  const rows = await sqlClient()`INSERT INTO annavedah.annavedah_pos_shifts(opened_by,opening_float)
    SELECT ${openedBy},${openingFloat} WHERE NOT EXISTS (
      SELECT 1 FROM annavedah.annavedah_pos_shifts WHERE status='open'
    ) RETURNING id`;
  if (!rows[0]) throw new Error("A POS shift is already open");
  return getCurrentPOSShift();
}

export async function closePOSShift(closingCash: number, closedBy: string, notes = "") {
  if (!Number.isFinite(closingCash) || closingCash < 0 || closingCash > 10_000_000) throw new Error("Invalid closing cash");
  const rows = await sqlClient()`WITH totals AS (
    SELECT s.id, s.opening_float+s.cash_sales expected
    FROM annavedah.annavedah_pos_shifts s WHERE s.status='open' FOR UPDATE
  ) UPDATE annavedah.annavedah_pos_shifts s SET status='closed',closed_by=${closedBy},closed_at=now(),
    closing_cash=${closingCash},expected_cash=t.expected,cash_difference=${closingCash}-t.expected,notes=${notes.slice(0,500)}
    FROM totals t WHERE s.id=t.id RETURNING s.id`;
  if (!rows[0]) throw new Error("No open POS shift");
  return (await listPOSShifts()).find((shift)=>shift.id===Number(rows[0].id))!;
}
