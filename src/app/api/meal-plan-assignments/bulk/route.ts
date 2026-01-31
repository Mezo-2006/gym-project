/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCoach } from "@/lib/guards";
import { z } from "zod";

const bulkSchema = z.object({
  mealPlanId: z.string(),
  clientIds: z.array(z.string().min(1)).min(1),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
});

export async function POST(request: Request) {
  const { user, response } = await requireCoach();
  if (response) return response;

  const payload = await request.json();
  const parsed = bulkSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const prismaClient = prisma as any;
  const plan = await prismaClient.mealPlan.findFirst({
    where: { id: parsed.data.mealPlanId, coachId: user!.id },
    select: { id: true },
  });
  if (!plan) {
    return NextResponse.json({ error: "Meal plan not found" }, { status: 404 });
  }

  const clients = await prismaClient.clientProfile.findMany({
    where: { id: { in: parsed.data.clientIds }, coachId: user!.id },
    select: { id: true },
  });

  const assignments = clients.map((client: { id: string }) => ({
    mealPlanId: plan.id,
    clientId: client.id,
    startDate: new Date(parsed.data.startDate),
    endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : undefined,
  }));

  if (!assignments.length) {
    return NextResponse.json({ error: "No valid clients" }, { status: 400 });
  }

  await prismaClient.mealPlanAssignment.createMany({ data: assignments });

  return NextResponse.json({ created: assignments.length });
}
