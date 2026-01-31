import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCoach } from "@/lib/guards";
import { z } from "zod";

const assignSchema = z.object({
  mealPlanId: z.string(),
  clientId: z.string(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
});

export async function POST(request: Request) {
  const { user, response } = await requireCoach();
  if (response) return response;

  const payload = await request.json();
  const parsed = assignSchema.safeParse(payload);
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

  const client = await prisma.clientProfile.findFirst({
    where: { id: parsed.data.clientId, coachId: user!.id },
    select: { id: true },
  });
  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  const assignment = await prisma.mealPlanAssignment.create({
    data: {
      mealPlanId: plan.id,
      clientId: client.id,
      startDate: new Date(parsed.data.startDate),
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : undefined,
    },
  });

  return NextResponse.json({ assignment });
}

export async function GET() {
  const { user, response } = await requireCoach();
  if (response) return response;

  const assignments = await prisma.mealPlanAssignment.findMany({
    where: { client: { coachId: user!.id } },
    include: {
      mealPlan: { select: { id: true, name: true } },
      client: { include: { user: { select: { email: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ assignments });
}
