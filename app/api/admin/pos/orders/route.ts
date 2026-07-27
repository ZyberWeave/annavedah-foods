import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { completePOSSale, listPOSOrders } from "@/lib/pos-server";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  try {
    return NextResponse.json({ orders: await listPOSOrders() });
  } catch (error) {
    console.error("[POS orders GET]", error);
    return NextResponse.json({ error: "Unable to load POS orders" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (auth.response || !auth.session) return auth.response;
  try {
    const order = await completePOSSale(await request.json(), String(auth.session.userId));
    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to complete sale";
    if (/rejected/i.test(message)) return NextResponse.json({ error: message }, { status: 409 });
    if (message === "Invalid sale items" || message === "Invalid payment method") {
      return NextResponse.json({ error: message }, { status: 400 });
    }
    console.error("[POS orders POST]", error);
    return NextResponse.json({ error: "Unable to complete sale" }, { status: 500 });
  }
}
