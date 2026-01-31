import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function resolveClientId(
  user: { id: string; role: "COACH" | "CLIENT" },
  requestedClientId?: string | null
) {
  if (user.role === "COACH") {
    if (!requestedClientId) {
      return { clientId: null, response: NextResponse.json({ error: "clientId required" }, { status: 400 }) };
    }
    const client = await prisma.clientProfile.findFirst({
      where: { id: requestedClientId, coachId: user.id },
      select: { id: true },
    });
    if (!client) {
      return { clientId: null, response: NextResponse.json({ error: "Client not found" }, { status: 404 }) };
    }
    return { clientId: client.id, response: null };
  }

  const profile = await prisma.clientProfile.findFirst({
    where: { userId: user.id },
    select: { id: true },
  });
  if (!profile) {
    return { clientId: null, response: NextResponse.json({ error: "Client profile missing" }, { status: 404 }) };
  }
  return { clientId: profile.id, response: null };
}
