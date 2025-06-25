import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET all custom personas for the logged-in user
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const personas = await prisma.customPersona.findMany({
    where: { ownerId: session.user.id },
    orderBy: { createdAt: 'asc' },
  });
  return NextResponse.json(personas);
}

// POST a new custom persona
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const { name, prompt, icon } = await req.json();
  if (!name || !prompt) return new NextResponse("Name and prompt are required", { status: 400 });

  const newPersona = await prisma.customPersona.create({
    data: { name, prompt, icon, ownerId: session.user.id },
  });
  return NextResponse.json(newPersona, { status: 201 });
}
