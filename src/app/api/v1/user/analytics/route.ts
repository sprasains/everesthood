import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  // 1. Get Category Engagement (from news article likes only)
  const categoryInteractions = await prisma.newsArticle.findMany({
    where: {
      likes: { some: { userId: session.user.id } },
    },
    select: { category: true },
  });

  const categoryCounts = categoryInteractions.reduce((acc: Record<string, number>, { category }) => {
    if (category) {
      acc[category] = (acc[category] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // 2. (Removed: userActivity tracking, as model does not exist)

  // 3. Get Persona Usage (mocked for now)
  return NextResponse.json({
    knowledgeGraph: categoryCounts,
    personaInsights: { ZenGPT: 10, HustleBot: 5 },
  });
}
