import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthCookieOptions, hashPassword, signToken } from "@/lib/auth";
import { registerSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const {
    email,
    password,
    role,
    name,
    coachId,
    caloriesTarget,
    proteinTarget,
    carbsTarget,
    fatsTarget,
    waterTargetMl,
  } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email already in use." }, { status: 409 });
  }

  if (role === "CLIENT" && !coachId) {
    return NextResponse.json({ error: "coachId is required for clients." }, { status: 400 });
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role,
      clientProfile:
        role === "CLIENT"
          ? {
              create: {
                coachId: coachId!,
                name,
                caloriesTarget: caloriesTarget!,
                proteinTarget: proteinTarget!,
                carbsTarget: carbsTarget!,
                fatsTarget: fatsTarget!,
                waterTargetMl: waterTargetMl!,
              },
            }
          : undefined,
    },
    select: { id: true, email: true, role: true },
  });

  const token = signToken({ sub: user.id, role: user.role });
  const response = NextResponse.json({ user });
  response.cookies.set("fitflow_token", token, getAuthCookieOptions());
  return response;
}
