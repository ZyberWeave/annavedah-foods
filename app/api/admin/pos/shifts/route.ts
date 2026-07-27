import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { closePOSShift, getCurrentPOSShift, listPOSShifts, openPOSShift } from "@/lib/pos-server";

export async function GET() {
  const auth=await requireAdmin(); if(auth.response)return auth.response;
  return NextResponse.json({shift:await getCurrentPOSShift(),shifts:await listPOSShifts()});
}
export async function POST(request:Request){
  const auth=await requireAdmin();if(auth.response||!auth.session)return auth.response;
  try{const body=await request.json();return NextResponse.json({shift:await openPOSShift(Number(body.openingFloat),String(auth.session.userId))},{status:201});}
  catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Unable to open shift"},{status:409});}
}
export async function PATCH(request:Request){
  const auth=await requireAdmin();if(auth.response||!auth.session)return auth.response;
  try{const body=await request.json();return NextResponse.json({shift:await closePOSShift(Number(body.closingCash),String(auth.session.userId),String(body.notes||""))});}
  catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Unable to close shift"},{status:409});}
}
