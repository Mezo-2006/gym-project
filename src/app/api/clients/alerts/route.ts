/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCoach } from "@/lib/guards";

export async function GET() {
  const { user, response } = await requireCoach();
  if (response) return response;

  const prismaClient = prisma as any;
  const clients = await prismaClient.clientProfile.findMany({
    where: { coachId: user!.id },
    include: { user: { select: { email: true } } },
  });

  if (!clients.length) {
    return NextResponse.json({ missed: [] });
  }

  const today = new Date(new Date().toDateString());
  const logs = await prismaClient.mealLog.findMany({
    where: { clientId: { in: clients.map((client: { id: string }) => client.id) }, date: today },
    select: { clientId: true },
  });

  const loggedClientIds = new Set(logs.map((log: { clientId: string }) => log.clientId));
  const missed = clients
    .filter((client: { id: string }) => !loggedClientIds.has(client.id))
    .map((client: { id: string; name: string; user?: { email?: string } }) => ({
      id: client.id,
      name: client.name,
      email: client.user?.email ?? "",
    }));

  return NextResponse.json({ missed });
}
