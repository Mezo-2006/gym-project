/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/guards";

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function GET() {
  const { user, response } = await requireUser();
  if (response) return response;

  if (user?.role !== "CLIENT") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const profile = await prisma.clientProfile.findFirst({
    where: { userId: user.id },
    select: { id: true },
  });
  if (!profile) {
    return NextResponse.json({ error: "Client profile missing" }, { status: 404 });
  }

  const today = new Date();
  const start = new Date(new Date(today).toDateString());
  start.setDate(start.getDate() - 13);

  const prismaClient = prisma as any;
  const logs = await prismaClient.mealLog.findMany({
    where: { clientId: profile.id, date: { gte: start } },
    select: { date: true, complianceStatus: true },
    orderBy: { date: "desc" },
  });

  const byDay = new Map<string, { date: string; compliance: string[] }>();
  logs.forEach((log: any) => {
    const key = dateKey(log.date);
    const existing = byDay.get(key) ?? { date: key, compliance: [] };
    existing.compliance.push(log.complianceStatus);
    byDay.set(key, existing);
  });

  const daysLogged = byDay.size;
  const complianceEntries = Array.from(byDay.values()).flatMap((entry) => entry.compliance);
  const metCount = complianceEntries.filter((status) => status === "MET").length;
  const totalCount = complianceEntries.filter((status) => status !== "UNKNOWN").length;
  const complianceRate = totalCount ? Math.round((metCount / totalCount) * 100) : 0;

  let streak = 0;
  const cursor = new Date(new Date(today).toDateString());
  while (byDay.has(dateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return NextResponse.json({
    daysLogged,
    complianceRate,
    streak,
  });
}
