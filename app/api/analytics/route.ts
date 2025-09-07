import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const type = url.searchParams.get('type') || 'overview';
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    if (type === 'overview') {
      // Get comprehensive user analytics
      const [
        totalAgents,
        totalRuns,
        totalPosts,
        totalComments,
        totalAchievements,
        totalHealthMetrics,
        totalTransactions,
        totalCartItems,
        totalWishlistItems,
        recentActivity
      ] = await Promise.all([
        prisma.agentInstance.count({
          where: { userId: session.user.id }
        }),
        prisma.agentRun.count({
          where: { 
            agentInstance: { userId: session.user.id }
          }
        }),
        prisma.post.count({
          where: { userId: session.user.id }
        }),
        prisma.comment.count({
          where: { userId: session.user.id }
        }),
        prisma.userAchievement.count({
          where: { userId: session.user.id }
        }),
        prisma.healthMetric.count({
          where: { userId: session.user.id }
        }),
        prisma.transaction.count({
          where: { userId: session.user.id }
        }),
        prisma.cartItem.count({
          where: { userId: session.user.id }
        }),
        prisma.wishlistItem.count({
          where: { userId: session.user.id }
        }),
        prisma.userActivity.findMany({
          where: { 
            userId: session.user.id,
            ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        })
      ]);

      return NextResponse.json({
        overview: {
          totalAgents,
          totalRuns,
          totalPosts,
          totalComments,
          totalAchievements,
          totalHealthMetrics,
          totalTransactions,
          totalCartItems,
          totalWishlistItems
        },
        recentActivity
      });
    }

    if (type === 'health') {
      const healthMetrics = await prisma.healthMetric.findMany({
        where: { 
          userId: session.user.id,
          ...(Object.keys(dateFilter).length > 0 && { date: dateFilter })
        },
        orderBy: { date: 'desc' }
      });

      const healthGoals = await prisma.healthGoal.findMany({
        where: { userId: session.user.id }
      });

      // Calculate health insights
      const categoryStats = healthMetrics.reduce((acc, metric) => {
        if (!acc[metric.category]) {
          acc[metric.category] = { count: 0, totalValue: 0, metrics: [] };
        }
        acc[metric.category].count++;
        acc[metric.category].totalValue += metric.value;
        acc[metric.category].metrics.push(metric);
        return acc;
      }, {} as any);

      return NextResponse.json({
        metrics: healthMetrics,
        goals: healthGoals,
        categoryStats,
        insights: {
          totalMetrics: healthMetrics.length,
          activeGoals: healthGoals.filter(g => !g.isCompleted).length,
          completedGoals: healthGoals.filter(g => g.isCompleted).length,
          averageProgress: healthGoals.length > 0 
            ? healthGoals.reduce((sum, goal) => sum + goal.progress, 0) / healthGoals.length 
            : 0
        }
      });
    }

    if (type === 'financial') {
      const transactions = await prisma.transaction.findMany({
        where: { 
          userId: session.user.id,
          ...(Object.keys(dateFilter).length > 0 && { date: dateFilter })
        },
        orderBy: { date: 'desc' }
      });

      const budgets = await prisma.budget.findMany({
        where: { userId: session.user.id }
      });

      const bills = await prisma.bill.findMany({
        where: { userId: session.user.id }
      });

      // Calculate financial insights
      const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const categoryBreakdown = transactions.reduce((acc, transaction) => {
        if (!acc[transaction.category]) {
          acc[transaction.category] = { income: 0, expense: 0, count: 0 };
        }
        if (transaction.type === 'income') {
          acc[transaction.category].income += transaction.amount;
        } else if (transaction.type === 'expense') {
          acc[transaction.category].expense += transaction.amount;
        }
        acc[transaction.category].count++;
        return acc;
      }, {} as any);

      return NextResponse.json({
        transactions,
        budgets,
        bills,
        insights: {
          totalIncome,
          totalExpenses,
          netIncome: totalIncome - totalExpenses,
          savingsRate: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0,
          categoryBreakdown,
          upcomingBills: bills.filter(b => !b.isPaid && new Date(b.dueDate) > new Date()).length
        }
      });
    }

    if (type === 'shopping') {
      const cartItems = await prisma.cartItem.findMany({
        where: { userId: session.user.id },
        include: { product: true }
      });

      const wishlistItems = await prisma.wishlistItem.findMany({
        where: { userId: session.user.id },
        include: { product: true }
      });

      const productReviews = await prisma.productReview.findMany({
        where: { userId: session.user.id }
      });

      // Calculate shopping insights
      const cartTotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

      const categoryBreakdown = cartItems.reduce((acc, item) => {
        if (!acc[item.product.category]) {
          acc[item.product.category] = { count: 0, totalValue: 0 };
        }
        acc[item.product.category].count += item.quantity;
        acc[item.product.category].totalValue += item.product.price * item.quantity;
        return acc;
      }, {} as any);

      return NextResponse.json({
        cartItems,
        wishlistItems,
        productReviews,
        insights: {
          cartTotal,
          cartItemCount,
          wishlistCount: wishlistItems.length,
          reviewCount: productReviews.length,
          categoryBreakdown
        }
      });
    }

    if (type === 'productivity') {
      const tasks = await prisma.task.findMany({
        where: { 
          userId: session.user.id,
          ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
        },
        orderBy: { createdAt: 'desc' }
      });

      const completedTasks = tasks.filter(t => t.isCompleted);
      const pendingTasks = tasks.filter(t => !t.isCompleted);

      const dailyCompletion = tasks.reduce((acc, task) => {
        const date = task.createdAt.toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = { completed: 0, total: 0 };
        }
        acc[date].total++;
        if (task.isCompleted) {
          acc[date].completed++;
        }
        return acc;
      }, {} as any);

      return NextResponse.json({
        tasks,
        insights: {
          totalTasks: tasks.length,
          completedTasks: completedTasks.length,
          pendingTasks: pendingTasks.length,
          completionRate: tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0,
          dailyCompletion
        }
      });
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
