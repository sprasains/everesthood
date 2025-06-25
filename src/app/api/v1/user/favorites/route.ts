import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.error("Unauthorized access attempt to favorites API");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const favoriteArticles = await prisma.favorite.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" } as any, // Explicitly cast to bypass type error
      include: {
        article: {
          select: {
            id: true,
            title: true,
            content: true,
            createdAt: true,
          },
        },
      },
    });

    console.log(
      `Fetched ${favoriteArticles.length} favorite articles for user ${session.user.id}`
    );

    return NextResponse.json(
      favoriteArticles.map(
        (fav: {
          article: {
            id: string;
            title: string;
            content: string | null;
            createdAt: Date;
          };
        }) => ({
          ...fav.article,
          content: fav.article.content || "", // Handle null case
        })
      )
    );
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
