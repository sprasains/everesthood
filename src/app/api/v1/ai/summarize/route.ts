import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { generateSummary } from "@/lib/gemini";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });

    const body = await request.json();
    const { content, personaId } = body as { content: string; personaId: keyof typeof defaultPersonas | string };
    if (!content) return new NextResponse("Content is required", { status: 400 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return new NextResponse("User not found", { status: 404 });

    if (user.subscriptionTier === 'FREE') {
      // Add your summary limit logic here if needed
    }

    // Determine the prompt for the AI
    let personaPrompt = "";
    const defaultPersonas = {
      ZenGPT: "You are ZenGPT, a calm and mindful AI guide. Summarize this content in a peaceful, balanced tone that promotes mindfulness and work-life balance:",
      HustleBot: "You are HustleBot, a high-energy startup mentor. Summarize this content with enthusiasm, focusing on growth opportunities and hustle mentality:",
      DataDaddy: "You are DataDaddy, an analytical insights master. Summarize this content with data-driven insights, charts, and statistical perspectives:",
      CoachAda: "You are CoachAda, a supportive career coach. Summarize this content with encouragement and career development focus:"
    };

    if (defaultPersonas[personaId as keyof typeof defaultPersonas]) {
      personaPrompt = defaultPersonas[personaId as keyof typeof defaultPersonas];
    } else {
      // It's a custom persona, fetch it from the DB
      const customPersona = await prisma.customPersona.findFirst({
        where: { id: personaId, ownerId: user.id }
      });
      if (customPersona) {
        personaPrompt = customPersona.prompt;
      } else {
        personaPrompt = defaultPersonas.ZenGPT;
      }
    }

    // Generate AI summary using the resolved prompt
    const summary = await generateSummary(content, personaPrompt);

    await prisma.user.update({
      where: { id: user.id },
      data: { xp: { increment: 15 } }
    });

    return NextResponse.json({ summary, persona: personaId, xpGained: 15 });
  } catch (error) {
    console.error('Error generating summary:', error);
    return new NextResponse("Failed to generate summary", { status: 500 });
  }
}