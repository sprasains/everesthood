import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userWithFavorites = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      favorites: {
        orderBy: { createdAt: "desc" },
        include: {
          article: true, // Include the full article data for each favorite
        },
      },
    },
  });

  if (!userWithFavorites) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const favoriteArticles = userWithFavorites.favorites.map(
    (fav) => fav.article
  );

  return NextResponse.json(favoriteArticles);
}
