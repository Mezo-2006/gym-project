import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCoach } from "@/lib/guards";
import { z } from "zod";

const createSchema = z.object({
  mealPlanId: z.string(),
  dayIndex: z.number().int().nonnegative(),
  title: z.string().min(1),
});

export async function POST(request: Request) {
  const { user, response } = await requireCoach();
  if (response) return response;

  const payload = await request.json();
  const parsed = createSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const plan = await prisma.mealPlan.findFirst({
    where: { id: parsed.data.mealPlanId, coachId: user!.id },
    select: { id: true },
  });
  if (!plan) {
    return NextResponse.json({ error: "Meal plan not found" }, { status: 404 });
  }

  const day = await prisma.mealPlanDay.create({
    data: {
      mealPlanId: plan.id,
      dayIndex: parsed.data.dayIndex,
      title: parsed.data.title,
    },
  });

  return NextResponse.json({ day });
}
