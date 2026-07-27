import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { lookupPOSCustomer } from "@/lib/pos-server";
export async function GET(request:Request){
  const auth=await requireAdmin();if(auth.response)return auth.response;
  const phone=new URL(request.url).searchParams.get("phone")?.replace(/\D/g,"")||"";
  if(phone.length<10||phone.length>15)return NextResponse.json({error:"Invalid phone number"},{status:400});
  try{return NextResponse.json({customer:await lookupPOSCustomer(phone)});}
  catch(error){console.error("[POS customer GET]",error);return NextResponse.json({error:"Unable to look up customer"},{status:500});}
}
