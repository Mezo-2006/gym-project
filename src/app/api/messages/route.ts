import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/guards";
import { messageSchema } from "@/lib/validators";

export async function GET(request: Request) {
  const { user, response } = await requireUser();
  if (response) return response;

  const url = new URL(request.url);
  const peerId = url.searchParams.get("peerId");
  if (!peerId) {
    return NextResponse.json({ error: "peerId required" }, { status: 400 });
  }

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: user!.id, recipientId: peerId },
        { senderId: peerId, recipientId: user!.id },
      ],
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ messages });
}

export async function POST(request: Request) {
  const { user, response } = await requireUser();
  if (response) return response;

  const payload = await request.json();
  const parsed = messageSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const message = await prisma.message.create({
    data: {
      senderId: user!.id,
      recipientId: parsed.data.recipientId,
      body: parsed.data.body,
    },
  });

  return NextResponse.json({ message });
}
