import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const applyJobSchema = z.object({
  coverLetter: z.string().optional(),
  resumeUrl: z.string().url().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = applyJobSchema.parse(body);

    // Verify job exists and is active
    const job = await prisma.job.findFirst({
      where: {
        id: params.id,
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      }
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found or expired' }, { status: 404 });
    }

    // Check if user already applied
    const existingApplication = await prisma.jobApplication.findUnique({
      where: {
        userId_jobId: {
          userId: session.user.id,
          jobId: params.id
        }
      }
    });

    if (existingApplication) {
      return NextResponse.json({ error: 'You have already applied for this job' }, { status: 400 });
    }

    const application = await prisma.jobApplication.create({
      data: {
        ...validatedData,
        userId: session.user.id,
        jobId: params.id,
      }
    });

    // Update job application count
    await prisma.job.update({
      where: { id: params.id },
      data: { applications: { increment: 1 } }
    });

    return NextResponse.json(application, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error applying for job:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
