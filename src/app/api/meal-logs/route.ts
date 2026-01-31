import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/guards";
import { resolveClientId } from "@/lib/access";
import { z } from "zod";

const extraMealSchema = z.object({
  date: z.string().datetime(),
  name: z.string().min(1),
  items: z
    .array(
      z.object({
        name: z.string().min(1),
        quantity: z.number().positive(),
        unit: z.string().min(1),
        calories: z.number().int().nonnegative(),
        protein: z.number().int().nonnegative(),
        carbs: z.number().int().nonnegative(),
        fats: z.number().int().nonnegative(),
      })
    )
    .min(1),
});

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

  const meals = await prisma.mealLog.findMany({
    where,
    include: { items: true },
    orderBy: { date: "desc" },
  });
  return NextResponse.json({ meals });
}

export async function POST(request: Request) {
  const { user, response } = await requireUser();
  if (response) return response;

  if (user!.role !== "CLIENT") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const payload = await request.json();
  const parsed = extraMealSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const profile = await prisma.clientProfile.findFirst({
    where: { userId: user!.id },
    select: { id: true },
  });
  if (!profile) {
    return NextResponse.json({ error: "Client profile missing" }, { status: 404 });
  }

  const consumedCaloriesTotal = parsed.data.items.reduce((sum, item) => sum + item.calories, 0);

  const log = await prisma.mealLog.create({
    data: {
      clientId: profile.id,
      date: new Date(new Date(parsed.data.date).toDateString()),
      name: parsed.data.name,
      status: "EATEN",
      plannedCaloriesTotal: null,
      consumedCaloriesTotal,
      complianceStatus: "UNKNOWN",
    },
  });

  await prisma.mealLogItem.createMany({
    data: parsed.data.items.map((item) => ({
      mealLogId: log.id,
      name: item.name,
      plannedQuantity: null,
      plannedUnit: item.unit,
      plannedCalories: null,
      plannedProtein: null,
      plannedCarbs: null,
      plannedFats: null,
      consumedQuantity: item.quantity,
      consumedCalories: item.calories,
      consumedProtein: item.protein,
      consumedCarbs: item.carbs,
      consumedFats: item.fats,
      isExtra: true,
    })),
  });

  return NextResponse.json({ logId: log.id });
}
