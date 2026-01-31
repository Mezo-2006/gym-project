import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) {
    return { user: null, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { user, response: null };
}

export async function requireCoach() {
  const { user, response } = await requireUser();
  if (response) return { user: null, response };
  if (user?.role !== "COACH") {
    return { user: null, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { user, response: null };
}
