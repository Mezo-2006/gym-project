import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { requireCoach } from "@/lib/guards";
import { z } from "zod";

const clientCreateSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  goals: z.string().optional(),
  caloriesTarget: z.number().int().positive(),
  proteinTarget: z.number().int().positive(),
  carbsTarget: z.number().int().positive(),
  fatsTarget: z.number().int().positive(),
  waterTargetMl: z.number().int().positive(),
});

export async function GET() {
  const { user, response } = await requireCoach();
  if (response) return response;

  const clients = await prisma.clientProfile.findMany({
    where: { coachId: user!.id },
    include: { user: { select: { id: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ clients });
}

export async function POST(request: Request) {
  const { user, response } = await requireCoach();
  if (response) return response;

  const payload = await request.json();
  const parsed = clientCreateSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { email, password, name, goals, caloriesTarget, proteinTarget, carbsTarget, fatsTarget, waterTargetMl } =
    parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email already in use." }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);

  const client = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: "CLIENT",
      clientProfile: {
        create: {
          coachId: user!.id,
          name,
          goals,
          caloriesTarget,
          proteinTarget,
          carbsTarget,
          fatsTarget,
          waterTargetMl,
        },
      },
    },
    include: { clientProfile: true },
  });

  return NextResponse.json({ client });
}
