import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateCartItemSchema = z.object({
  quantity: z.number().min(1).max(100)
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: {
        product: {
          include: {
            seller: {
              select: {
                id: true,
                name: true,
                rating: true,
                verified: true
              }
            }
          }
        }
      },
      orderBy: { addedAt: 'desc' }
    });

    // Calculate totals
    const total = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return NextResponse.json({
      cartItems,
      summary: {
        total,
        itemCount,
        itemTypes: cartItems.length
      }
    });

  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { itemId, quantity } = body;

    if (!itemId || quantity === undefined) {
      return NextResponse.json({ error: 'Item ID and quantity are required' }, { status: 400 });
    }

    const validatedData = updateCartItemSchema.parse({ quantity });

    const cartItem = await prisma.cartItem.update({
      where: { 
        id: itemId,
        userId: session.user.id
      },
      data: validatedData,
      include: {
        product: {
          include: {
            seller: {
              select: {
                id: true,
                name: true,
                rating: true,
                verified: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(cartItem);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating cart item:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const itemId = url.searchParams.get('itemId');

    if (!itemId) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    await prisma.cartItem.delete({
      where: { 
        id: itemId,
        userId: session.user.id
      }
    });

    return NextResponse.json({ message: 'Item removed from cart successfully' });

  } catch (error) {
    console.error('Error removing cart item:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
