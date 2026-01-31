import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCoach } from "@/lib/guards";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).optional(),
});

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireCoach();
  if (response) return response;

  const { id } = await params;

  const plan = await prisma.mealPlan.findFirst({
    where: { id, coachId: user!.id },
    include: {
      days: {
        orderBy: { dayIndex: "asc" },
        include: {
          meals: {
            orderBy: { sortOrder: "asc" },
            include: { foods: true },
          },
        },
      },
      assignments: {
        include: {
          client: { include: { user: { select: { email: true } } } },
        },
      },
    },
  });

  if (!plan) {
    return NextResponse.json({ error: "Meal plan not found" }, { status: 404 });
  }

  return NextResponse.json({ plan });
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

  const updated = await prisma.mealPlan.updateMany({
    where: { id, coachId: user!.id },
    data: parsed.data,
  });

  if (!updated.count) {
    return NextResponse.json({ error: "Meal plan not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireCoach();
  if (response) return response;

  const { id } = await params;

  await prisma.mealPlan.deleteMany({ where: { id, coachId: user!.id } });

  return NextResponse.json({ ok: true });
}
