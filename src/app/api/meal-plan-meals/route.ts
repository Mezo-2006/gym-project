import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCoach } from "@/lib/guards";
import { z } from "zod";

const createSchema = z.object({
  mealPlanDayId: z.string(),
  name: z.string().min(1),
  timeLabel: z.string().optional(),
  sortOrder: z.number().int().optional(),
});

const allowedMealNames = ["breakfast", "lunch", "dinner", "snack"] as const;

export async function POST(request: Request) {
  const { user, response } = await requireCoach();
  if (response) return response;

  const payload = await request.json();
  const parsed = createSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const normalizedName = parsed.data.name.trim().toLowerCase();
  if (!allowedMealNames.includes(normalizedName as (typeof allowedMealNames)[number])) {
    return NextResponse.json(
      { error: "Meal name must be Breakfast, Lunch, Dinner, or Snack." },
      { status: 400 }
    );
  }

  const day = await prisma.mealPlanDay.findFirst({
    where: { id: parsed.data.mealPlanDayId, mealPlan: { coachId: user!.id } },
    select: { id: true, meals: { select: { name: true } } },
  });
  if (!day) {
    return NextResponse.json({ error: "Meal plan day not found" }, { status: 404 });
  }

  if (day.meals.length >= 4) {
    return NextResponse.json({ error: "Only four meals are allowed per day." }, { status: 400 });
  }

  const existingNames = day.meals.map((meal) => meal.name.trim().toLowerCase());
  if (existingNames.includes(normalizedName)) {
    return NextResponse.json({ error: "Meal names must be unique per day." }, { status: 400 });
  }

  const meal = await prisma.mealPlanMeal.create({
    data: {
      mealPlanDayId: day.id,
      name: normalizedName.charAt(0).toUpperCase() + normalizedName.slice(1),
      timeLabel: parsed.data.timeLabel,
      sortOrder: parsed.data.sortOrder ?? 0,
    },
  });

  return NextResponse.json({ meal });
}
