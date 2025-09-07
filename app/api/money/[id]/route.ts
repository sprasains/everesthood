import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateTransactionSchema = z.object({
  amount: z.number().min(0.01).optional(),
  currency: z.string().min(3).max(3).optional(),
  description: z.string().min(1).max(200).optional(),
  category: z.string().min(1).max(50).optional(),
  type: z.enum(['income', 'expense', 'transfer']).optional(),
  date: z.string().datetime().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional()
});

const updateBudgetSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  amount: z.number().min(0.01).optional(),
  currency: z.string().min(3).max(3).optional(),
  category: z.string().min(1).max(50).optional(),
  period: z.enum(['weekly', 'monthly', 'yearly']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional()
});

const updateBillSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  amount: z.number().min(0.01).optional(),
  currency: z.string().min(3).max(3).optional(),
  dueDate: z.string().datetime().optional(),
  frequency: z.enum(['once', 'weekly', 'monthly', 'yearly']).optional(),
  category: z.string().min(1).max(50).optional(),
  isPaid: z.boolean().optional(),
  notes: z.string().optional()
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const type = url.searchParams.get('type') || 'transaction';

    if (type === 'transaction') {
      const transaction = await prisma.transaction.findUnique({
        where: { 
          id: params.id,
          userId: session.user.id
        }
      });

      if (!transaction) {
        return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
      }

      return NextResponse.json(transaction);
    }

    if (type === 'budget') {
      const budget = await prisma.budget.findUnique({
        where: { 
          id: params.id,
          userId: session.user.id
        }
      });

      if (!budget) {
        return NextResponse.json({ error: 'Budget not found' }, { status: 404 });
      }

      return NextResponse.json(budget);
    }

    if (type === 'bill') {
      const bill = await prisma.bill.findUnique({
        where: { 
          id: params.id,
          userId: session.user.id
        }
      });

      if (!bill) {
        return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
      }

      return NextResponse.json(bill);
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });

  } catch (error) {
    console.error('Error fetching money item:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const url = new URL(request.url);
    const type = url.searchParams.get('type') || 'transaction';

    if (type === 'transaction') {
      const validatedData = updateTransactionSchema.parse(body);

      const transaction = await prisma.transaction.update({
        where: { 
          id: params.id,
          userId: session.user.id
        },
        data: validatedData
      });

      return NextResponse.json(transaction);
    }

    if (type === 'budget') {
      const validatedData = updateBudgetSchema.parse(body);

      const budget = await prisma.budget.update({
        where: { 
          id: params.id,
          userId: session.user.id
        },
        data: validatedData
      });

      return NextResponse.json(budget);
    }

    if (type === 'bill') {
      const validatedData = updateBillSchema.parse(body);

      const bill = await prisma.bill.update({
        where: { 
          id: params.id,
          userId: session.user.id
        },
        data: validatedData
      });

      return NextResponse.json(bill);
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating money item:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const type = url.searchParams.get('type') || 'transaction';

    if (type === 'transaction') {
      await prisma.transaction.delete({
        where: { 
          id: params.id,
          userId: session.user.id
        }
      });

      return NextResponse.json({ message: 'Transaction deleted successfully' });
    }

    if (type === 'budget') {
      await prisma.budget.delete({
        where: { 
          id: params.id,
          userId: session.user.id
        }
      });

      return NextResponse.json({ message: 'Budget deleted successfully' });
    }

    if (type === 'bill') {
      await prisma.bill.delete({
        where: { 
          id: params.id,
          userId: session.user.id
        }
      });

      return NextResponse.json({ message: 'Bill deleted successfully' });
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });

  } catch (error) {
    console.error('Error deleting money item:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
