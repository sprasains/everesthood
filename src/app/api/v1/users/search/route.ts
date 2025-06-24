import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return new NextResponse("Unauthorized", { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  if (!q) return NextResponse.json([]);

  // Use raw query to call the stored procedure for friend search
  // Assumes stored procedure: EXEC search_friends @userId = ?, @keyword = ?
  const results = await prisma.$queryRawUnsafe(
    `EXEC search_friends @userId = ?, @keyword = ?`,
    session.user.id,
    q
  );

  return NextResponse.json(results);
}
