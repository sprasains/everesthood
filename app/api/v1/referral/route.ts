import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Define bonus amounts
const REFERRER_BONUS_EXECUTIONS = 100;
const REFERRED_USER_BONUS_EXECUTIONS = 50;

export async function GET() {
  return NextResponse.json({ ok: true });
}

export async function POST(req: Request) {
  try {
    const { referralCode, newUserId } = await req.json();

    if (!referralCode || !newUserId) {
      return new NextResponse('Referral code and new user ID are required', {
        status: 400,
      });
    }

    // Find the referrer user by their referral code
    const referrer = await prisma.user.findUnique({
      where: {
        referralCode: referralCode,
      },
    });

    if (!referrer) {
      return new NextResponse('Invalid referral code', { status: 404 });
    }

    // Check if this referral has already been processed for this new user
    const existingReferral = await prisma.ambassadorMetric.findFirst({
      where: {
        referredUserId: newUserId,
      },
    });

    if (existingReferral) {
      return new NextResponse('Referral already processed for this user', {
        status: 409,
      });
    }

    // Grant bonus to the referrer
    await prisma.user.update({
      where: {
        id: referrer.id,
      },
      data: {
        bonusExecutionCredits: {
          increment: REFERRER_BONUS_EXECUTIONS,
        },
      },
    });

    // Grant bonus to the new user
    await prisma.user.update({
      where: {
        id: newUserId,
      },
      data: {
        bonusExecutionCredits: {
          increment: REFERRED_USER_BONUS_EXECUTIONS,
        },
      },
    });

    // Record the referral in AmbassadorMetric
    await prisma.ambassadorMetric.create({
      data: {
        ambassadorId: referrer.id,
        referredUserId: newUserId,
      },
    });

    console.log(
      `Referral processed: User ${newUserId} referred by ${referrer.id}.`
    );

    return new NextResponse('Referral bonus granted successfully', {
      status: 200,
    });
  } catch (error) {
    console.error('Error processing referral:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
