import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/guards";
import { checkInSchema } from "@/lib/validators";
import { resolveClientId } from "@/lib/access";

export async function GET(request: Request) {
  const { user, response } = await requireUser();
  if (response) return response;

  const url = new URL(request.url);
  const requestedClientId = url.searchParams.get("clientId");

  const { clientId, response: clientResponse } = await resolveClientId(user!, requestedClientId);
  if (clientResponse) return clientResponse;

  const checkIns = await prisma.checkIn.findMany({
    where: { clientId: clientId! },
    orderBy: { weekOf: "desc" },
  });

  return NextResponse.json({ checkIns });
}

export async function POST(request: Request) {
  const { user, response } = await requireUser();
  if (response) return response;

  const payload = await request.json();
  const parsed = checkInSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { clientId: requestedClientId, ...data } = parsed.data;
  const { clientId, response: clientResponse } = await resolveClientId(user!, requestedClientId);
  if (clientResponse) return clientResponse;

  const checkIn = await prisma.checkIn.create({
    data: {
      clientId: clientId!,
      weekOf: new Date(data.weekOf),
      formJson: data.formJson as Prisma.InputJsonValue,
      coachNote: data.coachNote ?? undefined,
    },
  });

  return NextResponse.json({ checkIn });
}
