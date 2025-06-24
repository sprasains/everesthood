import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { generateSummary } from "@/lib/gemini"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { content, persona = 'ZenGPT' } = body

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    // Check user limits for free users
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if free user has exceeded daily limit
    if (user.subscriptionStatus === 'free' && user.summariesUsed >= 3) {
      return NextResponse.json(
        { error: 'Daily limit exceeded. Upgrade to Premium for unlimited summaries.' },
        { status: 429 }
      )
    }

    // Generate AI summary
    const summary = await generateSummary(content, persona)

    // Update user stats
    await prisma.user.update({
      where: { id: user.id },
      data: {
        summariesUsed: { increment: 1 },
        xp: { increment: 15 } // XP for using AI summary
      }
    })

    return NextResponse.json({ 
      summary,
      persona,
      xpGained: 15
    })
  } catch (error) {
    console.error('Error generating summary:', error)
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    )
  }
}