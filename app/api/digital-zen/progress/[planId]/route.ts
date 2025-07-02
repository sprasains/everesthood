import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

async function checkAndAwardAchievements({ userId, planId, progress, planTasks }) {
  const newAchievements = [];
  // Helper to award
  async function award(name) {
    const achievement = await prisma.achievement.findUnique({ where: { name } });
    if (!achievement) return;
    const already = await prisma.userAchievement.findUnique({ where: { userId_achievementId: { userId, achievementId: achievement.id } } });
    if (!already) {
      await prisma.userAchievement.create({ data: { userId, achievementId: achievement.id } });
      newAchievements.push({ name: achievement.name, icon: achievement.icon });
    }
  }
  // First Detox Day
  if (progress.length === 1) await award("First Detox Day");
  // Streak Starter (2+ days with at least one task)
  const days = [...new Set(planTasks.map(t => t.day))].sort((a, b) => a - b);
  let streak = 0;
  for (const day of days) {
    const dayTasks = planTasks.filter(t => t.day === day);
    if (dayTasks.some(t => progress.includes(t.id))) {
      streak++;
    } else {
      break;
    }
  }
  if (streak >= 2) await award("Streak Starter");
  if (streak >= 7) await award("Consistency Champ");
  // Detox Master (all tasks complete)
  if (progress.length === planTasks.length) await award("Detox Master");
  return newAchievements;
}

export async function GET(req, { params }: { params: { planId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = session.user.id;
  const tasks = await prisma.digitalDetoxTask.findMany({
    where: { planId: params.planId },
    select: { id: true },
  });
  const progresses = await prisma.digitalDetoxProgress.findMany({
    where: {
      userId,
      taskId: { in: tasks.map(t => t.id) },
      completedAt: { not: null },
    },
    select: { taskId: true },
  });
  return NextResponse.json(progresses.map(p => p.taskId));
}

export async function POST(req, { params }: { params: { planId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = session.user.id;
  const { taskId } = await req.json();
  if (!taskId) return NextResponse.json({ error: 'Missing taskId' }, { status: 400 });
  await prisma.digitalDetoxProgress.upsert({
    where: { userId_taskId: { userId, taskId } },
    update: { completedAt: new Date() },
    create: { userId, taskId, completedAt: new Date() },
  });
  // Return updated progress and any new achievements
  const planTasks = await prisma.digitalDetoxTask.findMany({ where: { planId: params.planId } });
  const tasks = planTasks.map(t => ({ id: t.id, day: t.day }));
  const progresses = await prisma.digitalDetoxProgress.findMany({
    where: { userId, taskId: { in: planTasks.map(t => t.id) }, completedAt: { not: null } },
    select: { taskId: true },
  });
  const progressIds = progresses.map(p => p.taskId);
  const newAchievements = await checkAndAwardAchievements({ userId, planId: params.planId, progress: progressIds, planTasks });
  return NextResponse.json({ progress: progressIds, newAchievements });
}

export async function DELETE(req, { params }: { params: { planId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = session.user.id;
  const { taskId } = await req.json();
  if (!taskId) return NextResponse.json({ error: 'Missing taskId' }, { status: 400 });
  await prisma.digitalDetoxProgress.updateMany({
    where: { userId, taskId },
    data: { completedAt: null },
  });
  // Return updated progress
  const planTasks = await prisma.digitalDetoxTask.findMany({ where: { planId: params.planId } });
  const progresses = await prisma.digitalDetoxProgress.findMany({
    where: { userId, taskId: { in: planTasks.map(t => t.id) }, completedAt: { not: null } },
    select: { taskId: true },
  });
  return NextResponse.json(progresses.map(p => p.taskId));
} 