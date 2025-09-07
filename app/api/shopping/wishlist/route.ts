import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const addToWishlistSchema = z.object({
  productId: z.string().min(1)
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const wishlistItems = await prisma.wishlistItem.findMany({
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

    return NextResponse.json({ wishlistItems });

  } catch (error) {
    console.error('Error fetching wishlist:', error);
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
    const validatedData = addToWishlistSchema.parse(body);

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { 
        id: validatedData.productId,
        isActive: true
      }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Check if already in wishlist
    const existingItem = await prisma.wishlistItem.findFirst({
      where: {
        userId: session.user.id,
        productId: validatedData.productId
      }
    });

    if (existingItem) {
      return NextResponse.json({ error: 'Product already in wishlist' }, { status: 400 });
    }

    const wishlistItem = await prisma.wishlistItem.create({
      data: {
        userId: session.user.id,
        productId: validatedData.productId
      },
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

    return NextResponse.json(wishlistItem, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error adding to wishlist:', error);
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
    const productId = url.searchParams.get('productId');

    if (!itemId && !productId) {
      return NextResponse.json({ error: 'Item ID or Product ID is required' }, { status: 400 });
    }

    const where: any = { userId: session.user.id };
    if (itemId) {
      where.id = itemId;
    } else if (productId) {
      where.productId = productId;
    }

    await prisma.wishlistItem.deleteMany({
      where
    });

    return NextResponse.json({ message: 'Item removed from wishlist successfully' });

  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
