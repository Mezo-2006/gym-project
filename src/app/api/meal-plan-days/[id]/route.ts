import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCoach } from "@/lib/guards";
import { z } from "zod";

const updateSchema = z.object({
  dayIndex: z.number().int().nonnegative().optional(),
  title: z.string().min(1).optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireCoach();
  if (response) return response;

  const { id } = await params;

  const payload = await request.json();
  const parsed = updateSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await prisma.mealPlanDay.updateMany({
    where: { id, mealPlan: { coachId: user!.id } },
    data: parsed.data,
  });

  if (!updated.count) {
    return NextResponse.json({ error: "Meal plan day not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireCoach();
  if (response) return response;

  const { id } = await params;

  await prisma.mealPlanDay.deleteMany({
    where: { id, mealPlan: { coachId: user!.id } },
  });

  return NextResponse.json({ ok: true });
}
