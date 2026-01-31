import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCoach } from "@/lib/guards";
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

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireCoach();
  if (response) return response;

  const { id } = await params;

  const profile = await prisma.clientProfile.findFirst({
    where: { id, coachId: user!.id },
    include: { user: { select: { id: true, email: true } } },
  });

  if (!profile) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  return NextResponse.json({ client: profile });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireCoach();
  if (response) return response;

  const { id } = await params;

  const payload = await request.json();
  const parsed = updateSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await prisma.clientProfile.updateMany({
    where: { id, coachId: user!.id },
    data: parsed.data,
  });

  if (!updated.count) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireCoach();
  if (response) return response;

  const { id } = await params;

  await prisma.clientProfile.deleteMany({
    where: { id, coachId: user!.id },
  });

  return NextResponse.json({ ok: true });
}
