import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthCookieOptions, signToken, verifyPassword } from "@/lib/auth";
import { loginSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  const token = signToken({ sub: user.id, role: user.role });
  const response = NextResponse.json({ user: { id: user.id, email: user.email, role: user.role } });
  response.cookies.set("fitflow_token", token, getAuthCookieOptions());
  return response;
}
