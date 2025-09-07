import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createTransactionSchema = z.object({
  amount: z.number().min(0.01),
  currency: z.string().min(3).max(3),
  description: z.string().min(1).max(200),
  category: z.string().min(1).max(50),
  type: z.enum(['income', 'expense', 'transfer']),
  date: z.string().datetime(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional()
});

const createBudgetSchema = z.object({
  name: z.string().min(1).max(100),
  amount: z.number().min(0.01),
  currency: z.string().min(3).max(3),
  category: z.string().min(1).max(50),
  period: z.enum(['weekly', 'monthly', 'yearly']),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional()
});

const createBillSchema = z.object({
  name: z.string().min(1).max(100),
  amount: z.number().min(0.01),
  currency: z.string().min(3).max(3),
  dueDate: z.string().datetime(),
  frequency: z.enum(['once', 'weekly', 'monthly', 'yearly']),
  category: z.string().min(1).max(50),
  isPaid: z.boolean().default(false),
  notes: z.string().optional()
});

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
    const category = url.searchParams.get('category');
    const limit = parseInt(url.searchParams.get('limit') || '50');

    if (type === 'overview') {
      // Get financial overview
      const where: any = { userId: session.user.id };
      if (startDate || endDate) {
        where.date = {};
        if (startDate) where.date.gte = new Date(startDate);
        if (endDate) where.date.lte = new Date(endDate);
      }

      const [transactions, budgets, bills] = await Promise.all([
        prisma.transaction.findMany({
          where,
          orderBy: { date: 'desc' },
          take: limit
        }),
        prisma.budget.findMany({
          where: { userId: session.user.id },
          orderBy: { startDate: 'desc' }
        }),
        prisma.bill.findMany({
          where: { userId: session.user.id },
          orderBy: { dueDate: 'asc' }
        })
      ]);

      // Calculate totals
      const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const totalBalance = totalIncome - totalExpenses;
      const savingsRate = totalIncome > 0 ? (totalBalance / totalIncome) * 100 : 0;

      return NextResponse.json({
        overview: {
          totalBalance,
          totalIncome,
          totalExpenses,
          savingsRate,
          transactionCount: transactions.length
        },
        recentTransactions: transactions.slice(0, 10),
        budgets,
        upcomingBills: bills.filter(b => !b.isPaid).slice(0, 5)
      });
    }

    if (type === 'transactions') {
      const where: any = { userId: session.user.id };
      if (startDate || endDate) {
        where.date = {};
        if (startDate) where.date.gte = new Date(startDate);
        if (endDate) where.date.lte = new Date(endDate);
      }
      if (category) where.category = category;

      const transactions = await prisma.transaction.findMany({
        where,
        orderBy: { date: 'desc' },
        take: limit
      });

      return NextResponse.json({ transactions });
    }

    if (type === 'budgets') {
      const budgets = await prisma.budget.findMany({
        where: { userId: session.user.id },
        orderBy: { startDate: 'desc' }
      });

      return NextResponse.json({ budgets });
    }

    if (type === 'bills') {
      const bills = await prisma.bill.findMany({
        where: { userId: session.user.id },
        orderBy: { dueDate: 'asc' }
      });

      return NextResponse.json({ bills });
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });

  } catch (error) {
    console.error('Error fetching money data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const url = new URL(request.url);
    const type = url.searchParams.get('type') || 'transaction';

    if (type === 'transaction') {
      const validatedData = createTransactionSchema.parse(body);

      const transaction = await prisma.transaction.create({
        data: {
          userId: session.user.id,
          ...validatedData
        }
      });

      return NextResponse.json(transaction, { status: 201 });
    }

    if (type === 'budget') {
      const validatedData = createBudgetSchema.parse(body);

      const budget = await prisma.budget.create({
        data: {
          userId: session.user.id,
          ...validatedData
        }
      });

      return NextResponse.json(budget, { status: 201 });
    }

    if (type === 'bill') {
      const validatedData = createBillSchema.parse(body);

      const bill = await prisma.bill.create({
        data: {
          userId: session.user.id,
          ...validatedData
        }
      });

      return NextResponse.json(bill, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating money data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
