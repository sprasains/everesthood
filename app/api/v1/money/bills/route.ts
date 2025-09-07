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
      dueDate: {
        gte: startDate,
        lte: endDate,
      },
    };
  }

  const bills = await prisma.bill.findMany({
    where: {
      userId: session.user.id,
      ...dateFilter,
    },
    orderBy: [{ dueDate: 'asc' }, { amount: 'desc' }],
    include: {
      category: true,
    },
  });

  return NextResponse.json(bills);
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return new NextResponse('Unauthorized', { status: 401 });

    const data = await req.json();
    const { name, amount, dueDate, categoryId, isRecurring, recurringPeriod } =
      data;

    if (!name || !amount || !dueDate) {
      return NextResponse.json(
        { error: 'Name, amount, and due date are required' },
        { status: 400 }
      );
    }

    const bill = await prisma.bill.create({
      data: {
        name,
        amount,
        dueDate: new Date(dueDate),
        isRecurring: isRecurring || false,
        recurringPeriod: recurringPeriod || null,
        categoryId,
        userId: session.user.id,
      },
    });

    return NextResponse.json(bill, { status: 201 });
  } catch (error) {
    console.error('Error creating bill:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return new NextResponse('Unauthorized', { status: 401 });

    const data = await req.json();
    const {
      id,
      name,
      amount,
      dueDate,
      categoryId,
      isRecurring,
      recurringPeriod,
      isPaid,
    } = data;

    if (!id) {
      return NextResponse.json(
        { error: 'Bill ID is required' },
        { status: 400 }
      );
    }

    const bill = await prisma.bill.update({
      where: {
        id,
        userId: session.user.id, // Ensure ownership
      },
      data: {
        name,
        amount,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        categoryId,
        isRecurring,
        recurringPeriod,
        isPaid,
        paidAt: isPaid ? new Date() : null,
      },
    });

    return NextResponse.json(bill);
  } catch (error) {
    console.error('Error updating bill:', error);
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
        { error: 'Bill ID is required' },
        { status: 400 }
      );
    }

    await prisma.bill.delete({
      where: {
        id,
        userId: session.user.id, // Ensure ownership
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting bill:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
