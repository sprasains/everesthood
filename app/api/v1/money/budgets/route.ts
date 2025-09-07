import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return new NextResponse('Unauthorized', { status: 401 });

  const url = new URL(req.url);
  const month = url.searchParams.get('month');
  const year = url.searchParams.get('year');

  let dateFilter = {};
  if (month && year) {
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0);
    dateFilter = {
      startDate: {
        lte: endDate,
      },
      endDate: {
        gte: startDate,
      },
    };
  }

  const budgets = await prisma.budget.findMany({
    where: {
      userId: session.user.id,
      ...dateFilter,
    },
    include: {
      category: true,
      expenses: {
        where:
          month && year
            ? {
                date: {
                  gte: new Date(parseInt(year), parseInt(month) - 1, 1),
                  lte: new Date(parseInt(year), parseInt(month), 0),
                },
              }
            : undefined,
      },
    },
    orderBy: {
      category: {
        name: 'asc',
      },
    },
  });

  interface Expense {
    amount: number;
    date: Date;
  }

  interface Budget {
    id: string;
    amount: number;
    expenses: Expense[];
  }

  // Calculate progress for each budget
  const budgetsWithProgress = budgets.map((budget: Budget) => ({
    ...budget,
    spent: budget.expenses.reduce(
      (sum: number, exp: Expense) => sum + exp.amount,
      0
    ),
    remaining:
      budget.amount -
      budget.expenses.reduce(
        (sum: number, exp: Expense) => sum + exp.amount,
        0
      ),
  }));

  return NextResponse.json(budgetsWithProgress);
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return new NextResponse('Unauthorized', { status: 401 });

    const data = await req.json();
    const { name, amount, categoryId, startDate, endDate } = data;

    if (!name || !amount || !categoryId) {
      return NextResponse.json(
        { error: 'Name, amount, and category are required' },
        { status: 400 }
      );
    }

    const budget = await prisma.budget.create({
      data: {
        name,
        amount,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
        categoryId,
        userId: session.user.id,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(budget, { status: 201 });
  } catch (error) {
    console.error('Error creating budget:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return new NextResponse('Unauthorized', { status: 401 });

    const data = await req.json();
    const { id, name, amount, categoryId, startDate, endDate } = data;

    if (!id) {
      return NextResponse.json(
        { error: 'Budget ID is required' },
        { status: 400 }
      );
    }

    const budget = await prisma.budget.update({
      where: {
        id,
        userId: session.user.id, // Ensure ownership
      },
      data: {
        name,
        amount,
        categoryId,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(budget);
  } catch (error) {
    console.error('Error updating budget:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return new NextResponse('Unauthorized', { status: 401 });

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json(
        { error: 'Budget ID is required' },
        { status: 400 }
      );
    }

    await prisma.budget.delete({
      where: {
        id,
        userId: session.user.id, // Ensure ownership
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting budget:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
