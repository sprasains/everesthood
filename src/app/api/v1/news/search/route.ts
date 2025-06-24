import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return new NextResponse("Unauthorized", { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  if (!q) return NextResponse.json([]);

  // Use raw query to call the stored procedure
  const results = await prisma.$queryRawUnsafe(
    `EXEC search_news @keyword = ?`,
    q
  );

  return NextResponse.json(results);
}
