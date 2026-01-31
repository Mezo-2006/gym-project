/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCoach } from "@/lib/guards";

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function GET() {
  const { user, response } = await requireCoach();
  if (response) return response;

  const prismaClient = prisma as any;
  const clients = await prismaClient.clientProfile.findMany({
    where: { coachId: user!.id },
    include: { user: { select: { email: true } } },
  });

  const clientIds = clients.map((client: any) => client.id);
  if (!clientIds.length) {
    return NextResponse.json({ clients: [] });
  }

  const today = new Date();
  const start = new Date(new Date(today).toDateString());
  start.setDate(start.getDate() - 6);

  const logs = await prismaClient.mealLog.findMany({
    where: { clientId: { in: clientIds }, date: { gte: start } },
    select: { clientId: true, date: true, complianceStatus: true },
    orderBy: { date: "desc" },
  });

  const logsByClient = new Map<string, typeof logs>();
  logs.forEach((log: any) => {
    const list = logsByClient.get(log.clientId) ?? [];
    list.push(log);
    logsByClient.set(log.clientId, list);
  });

  const summaries = clients.map((client: any) => {
    const clientLogs = logsByClient.get(client.id) ?? [];
    const dayMap = new Map<string, string[]>();
    clientLogs.forEach((log: any) => {
      const key = dateKey(log.date);
      const existing = dayMap.get(key) ?? [];
      existing.push(log.complianceStatus);
      dayMap.set(key, existing);
    });

    const complianceEntries = Array.from(dayMap.values()).flatMap((entry) => entry);
    const metCount = complianceEntries.filter((status) => status === "MET").length;
    const totalCount = complianceEntries.filter((status) => status !== "UNKNOWN").length;
    const complianceRate = totalCount ? Math.round((metCount / totalCount) * 100) : 0;

    let streak = 0;
    const cursor = new Date(new Date(today).toDateString());
    while (dayMap.has(dateKey(cursor))) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    return {
      id: client.id,
      name: client.name,
      email: client.user?.email ?? "",
      daysLogged: dayMap.size,
      complianceRate,
      streak,
      caloriesTarget: client.caloriesTarget,
    };
  });

  return NextResponse.json({ clients: summaries });
}
