import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('id')

    if (!session?.user?.email && !userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: userId ? { id: userId } : { email: session!.user!.email! },
      include: {
        userAchievements: {
          include: {
            achievement: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Zod schema for profile update
    const profileUpdateSchema = z.object({
      name: z.string().min(1).max(100).optional(),
      bio: z.string().max(500).optional(),
      profilePicture: z.string().url().optional(),
      coverPicture: z.string().url().optional(),
    });

    let body;
    try {
      body = await request.json();
      profileUpdateSchema.parse(body);
    } catch (err) {
      return NextResponse.json({ error: "Invalid profile data", details: err instanceof z.ZodError ? err.errors : err }, { status: 400 });
    }

    const allowedFields = [
      'name', 'persona', 'weeklyGoal', 'publicProfile', 
      'xp', 'level', 'streak', 'dailyProgress', 'lastActiveDate'
    ]

    const updateData: any = {}
    for (const [key, value] of Object.entries(body)) {
      if (allowedFields.includes(key)) {
        updateData[key] = value
      }
    }

    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: updateData
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error updating user profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}