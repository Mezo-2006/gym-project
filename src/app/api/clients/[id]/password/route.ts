import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCoach } from "@/lib/guards";
import { hashPassword } from "@/lib/auth";
import { z } from "zod";

const updateSchema = z.object({
  password: z.string().min(8),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireCoach();
  if (response) return response;

  const { id } = await params;

  const payload = await request.json();
  const parsed = updateSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const profile = await prisma.clientProfile.findFirst({
    where: { id, coachId: user!.id },
    select: { userId: true },
  });

  if (!profile) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  const passwordHash = await hashPassword(parsed.data.password);
  await prisma.user.update({
    where: { id: profile.userId },
    data: { passwordHash },
  });

  return NextResponse.json({ ok: true });
}
