import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/guards";
import { workoutLogSchema } from "@/lib/validators";
import { resolveClientId } from "@/lib/access";

export async function GET(request: Request) {
  const { user, response } = await requireUser();
  if (response) return response;

  const url = new URL(request.url);
  const requestedClientId = url.searchParams.get("clientId");

  const { clientId, response: clientResponse } = await resolveClientId(user!, requestedClientId);
  if (clientResponse) return clientResponse;

  const workouts = await prisma.workoutLog.findMany({
    where: { clientId: clientId! },
    orderBy: { date: "desc" },
  });
  return NextResponse.json({ workouts });
}

export async function POST(request: Request) {
  const { user, response } = await requireUser();
  if (response) return response;

  const payload = await request.json();
  const parsed = workoutLogSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { clientId: requestedClientId, ...data } = parsed.data;
  const { clientId, response: clientResponse } = await resolveClientId(user!, requestedClientId);
  if (clientResponse) return clientResponse;

  const workout = await prisma.workoutLog.create({
    data: {
      clientId: clientId!,
      date: new Date(data.date),
      title: data.title,
      details: data.details as Prisma.InputJsonValue,
    },
  });

  return NextResponse.json({ workout });
}
