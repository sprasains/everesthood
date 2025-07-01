import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Create a new poll (linked to a new post)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  // Add admin check here, e.g., if (session.user.email !== process.env.ADMIN_EMAIL) ...
  if (!session?.user?.id)
    return new NextResponse("Unauthorized", { status: 401 });

  const { question, options, postContent } = await req.json(); // options is an array of strings

  const newPost = await prisma.post.create({
    data: {
      content: postContent,
      authorId: session.user.id,
      poll: {
        create: {
          question: question,
          options: {
            create: options.map((opt: string) => ({ text: opt })),
          },
        },
      },
    },
    include: { poll: { include: { options: true } } },
  });
  return NextResponse.json(newPost);
}
