import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/guards";
import { waterLogSchema } from "@/lib/validators";
import { resolveClientId } from "@/lib/access";

export async function GET(request: Request) {
  const { user, response } = await requireUser();
  if (response) return response;

  const url = new URL(request.url);
  const requestedClientId = url.searchParams.get("clientId");
  const date = url.searchParams.get("date");

  const { clientId, response: clientResponse } = await resolveClientId(user!, requestedClientId);
  if (clientResponse) return clientResponse;

  const where: { clientId: string; date?: Date } = { clientId: clientId! };
  if (date) where.date = new Date(date);

  const waterLogs = await prisma.waterLog.findMany({ where, orderBy: { date: "desc" } });
  return NextResponse.json({ waterLogs });
}

export async function POST(request: Request) {
  const { user, response } = await requireUser();
  if (response) return response;

  const payload = await request.json();
  const parsed = waterLogSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { clientId: requestedClientId, ...data } = parsed.data;
  const { clientId, response: clientResponse } = await resolveClientId(user!, requestedClientId);
  if (clientResponse) return clientResponse;

  const log = await prisma.waterLog.create({
    data: {
      ...data,
      clientId: clientId!,
      date: new Date(data.date),
    },
  });

  return NextResponse.json({ waterLog: log });
}
