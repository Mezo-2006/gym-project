import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCoach } from "@/lib/guards";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).optional(),
});

export async function GET() {
  const { user, response } = await requireCoach();
  if (response) return response;

  const plans = await prisma.mealPlan.findMany({
    where: { coachId: user!.id },
    include: {
      _count: { select: { days: true, assignments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ plans });
}

export async function POST(request: Request) {
  const { user, response } = await requireCoach();
  if (response) return response;

  const payload = await request.json();
  const parsed = createSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const plan = await prisma.mealPlan.create({
    data: {
      coachId: user!.id,
      name: parsed.data.name,
      description: parsed.data.description,
      status: parsed.data.status ?? "DRAFT",
    },
  });

  return NextResponse.json({ plan });
}
