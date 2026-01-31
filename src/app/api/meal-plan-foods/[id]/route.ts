import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCoach } from "@/lib/guards";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  quantity: z.number().positive().optional(),
  unit: z.string().min(1).optional(),
  calories: z.number().int().nonnegative().optional(),
  protein: z.number().int().nonnegative().optional(),
  carbs: z.number().int().nonnegative().optional(),
  fats: z.number().int().nonnegative().optional(),
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

  const updated = await prisma.mealPlanFood.updateMany({
    where: { id, meal: { day: { mealPlan: { coachId: user!.id } } } },
    data: parsed.data,
  });

  if (!updated.count) {
    return NextResponse.json({ error: "Meal plan food not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireCoach();
  if (response) return response;

  const { id } = await params;

  await prisma.mealPlanFood.deleteMany({
    where: { id, meal: { day: { mealPlan: { coachId: user!.id } } } },
  });

  return NextResponse.json({ ok: true });
}
