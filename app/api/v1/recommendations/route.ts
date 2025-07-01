import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const userId = session.user.id;

    // 1. Find user's liked news articles
    const likedArticles = await prisma.newsArticleLike.findMany({ where: { userId }, include: { newsArticle: true } });

    const interactedArticles = [
        ...likedArticles.map(l => l.newsArticle),
    ];

    if (interactedArticles.length === 0) {
        // Fallback: return latest news articles if no history
        const latest = await prisma.newsArticle.findMany({ orderBy: { publishedAt: 'desc' }, take: 20 });
        return NextResponse.json(latest);
    }
    
    // 2. Tally the categories
    const categoryCounts = interactedArticles.reduce((acc: Record<string, number>, article) => {
        if (article.category) {
            acc[article.category] = (acc[article.category] || 0) + 1;
        }
        return acc;
    }, {});

    // 3. Find the top 3 categories
    const topCategories = Object.entries(categoryCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([category]) => category);

    // 4. Fetch new articles from those categories that the user hasn't interacted with
    const interactedArticleIds = new Set(interactedArticles.map(a => a.id));

    const recommendations = await prisma.newsArticle.findMany({
        where: {
            category: { in: topCategories },
            id: { notIn: Array.from(interactedArticleIds) }
        },
        orderBy: { publishedAt: 'desc' },
        take: 20,
    });
    
    return NextResponse.json(recommendations);
}
