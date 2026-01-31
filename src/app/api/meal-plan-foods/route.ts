import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCoach } from "@/lib/guards";
import { z } from "zod";

const createSchema = z.object({
  mealPlanMealId: z.string(),
  name: z.string().min(1),
  quantity: z.number().positive(),
  unit: z.string().min(1),
  calories: z.number().int().nonnegative(),
  protein: z.number().int().nonnegative(),
  carbs: z.number().int().nonnegative(),
  fats: z.number().int().nonnegative(),
});

export async function POST(request: Request) {
  const { user, response } = await requireCoach();
  if (response) return response;

  const payload = await request.json();
  const parsed = createSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const meal = await prisma.mealPlanMeal.findFirst({
    where: { id: parsed.data.mealPlanMealId, day: { mealPlan: { coachId: user!.id } } },
    select: { id: true },
  });
  if (!meal) {
    return NextResponse.json({ error: "Meal plan meal not found" }, { status: 404 });
  }

  const food = await prisma.mealPlanFood.create({
    data: {
      mealPlanMealId: meal.id,
      name: parsed.data.name,
      quantity: parsed.data.quantity,
      unit: parsed.data.unit,
      calories: parsed.data.calories,
      protein: parsed.data.protein,
      carbs: parsed.data.carbs,
      fats: parsed.data.fats,
    },
  });

  return NextResponse.json({ food });
}
