import { NextResponse } from "next/server";
import { getAuthCookieOptions } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set("fitflow_token", "", { ...getAuthCookieOptions(), maxAge: 0 });
  return response;
}
