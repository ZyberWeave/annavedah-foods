import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createPOSBatch, listPOSBatches } from "@/lib/pos-server";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  try {
    return NextResponse.json({ batches: await listPOSBatches() });
  } catch (error) {
    console.error("[POS batches GET]", error);
    return NextResponse.json({ error: "Unable to load POS inventory" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  try {
    return NextResponse.json({ batch: await createPOSBatch(await request.json()) }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create batch";
    const conflict = /unique|duplicate/i.test(message);
    if (conflict) return NextResponse.json({ error: "Batch ID or barcode already exists" }, { status: 409 });
    if (message === "Invalid batch details") return NextResponse.json({ error: message }, { status: 400 });
    console.error("[POS batches POST]", error);
    return NextResponse.json({ error: "Unable to create batch" }, { status: 500 });
  }
}
