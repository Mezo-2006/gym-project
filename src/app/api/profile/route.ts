import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/guards";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  goals: z.string().optional(),
  caloriesTarget: z.number().int().positive().optional(),
  proteinTarget: z.number().int().positive().optional(),
  carbsTarget: z.number().int().positive().optional(),
  fatsTarget: z.number().int().positive().optional(),
  waterTargetMl: z.number().int().positive().optional(),
});

export async function GET() {
  const { user, response } = await requireUser();
  if (response) return response;

  if (user?.role !== "CLIENT") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const profile = await prisma.clientProfile.findFirst({
    where: { userId: user.id },
  });

  if (!profile) {
    return NextResponse.json({ error: "Client profile missing" }, { status: 404 });
  }

  return NextResponse.json({ profile });
}

export async function PATCH(request: Request) {
  const { user, response } = await requireUser();
  if (response) return response;

  if (user?.role !== "CLIENT") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const payload = await request.json();
  const parsed = updateSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await prisma.clientProfile.updateMany({
    where: { userId: user.id },
    data: parsed.data,
  });

  if (!updated.count) {
    return NextResponse.json({ error: "Client profile missing" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
