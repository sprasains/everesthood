import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  // 1. Get Category Engagement (from likes and favorites)
  const categoryInteractions = await prisma.article.findMany({
    where: {
      OR: [
        { likes: { some: { userId: session.user.id } } },
        { favorites: { some: { userId: session.user.id } } },
      ],
    },
    select: { category: true },
  });

  const categoryCounts = categoryInteractions.reduce((acc: Record<string, number>, { category }) => {
    if (category) {
      acc[category] = (acc[category] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // 2. Get Trend Trajectory (e.g., articles read per day)
  const userActivities = await prisma.userActivity.findMany({
    where: { userId: session.user.id, action: 'read_article' },
    orderBy: { createdAt: 'asc' },
    select: { createdAt: true }
  });

  // 3. Get Persona Usage (mocked for now)
  return NextResponse.json({
    knowledgeGraph: categoryCounts,
    trendTrajectory: userActivities,
    personaInsights: { ZenGPT: 10, HustleBot: 5 },
  });
}
