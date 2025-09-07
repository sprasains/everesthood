import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createProductSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(1000),
  price: z.number().min(0),
  originalPrice: z.number().min(0).optional(),
  currency: z.string().min(3).max(3),
  category: z.string().min(1).max(50),
  brand: z.string().min(1).max(100),
  image: z.string().url().optional(),
  inStock: z.boolean().default(true),
  discount: z.number().min(0).max(100).optional(),
  tags: z.array(z.string()).default([]),
  sellerId: z.string().min(1)
});

const addToCartSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().min(1).max(100)
});

const addToWishlistSchema = z.object({
  productId: z.string().min(1)
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const type = url.searchParams.get('type') || 'products';
    const category = url.searchParams.get('category');
    const search = url.searchParams.get('search');
    const sortBy = url.searchParams.get('sortBy') || 'popularity';
    const minPrice = url.searchParams.get('minPrice');
    const maxPrice = url.searchParams.get('maxPrice');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');

    if (type === 'products') {
      const where: any = { isActive: true };
      
      if (category) where.category = category;
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { brand: { contains: search, mode: 'insensitive' } },
          { tags: { hasSome: [search] } }
        ];
      }
      if (minPrice || maxPrice) {
        where.price = {};
        if (minPrice) where.price.gte = parseFloat(minPrice);
        if (maxPrice) where.price.lte = parseFloat(maxPrice);
      }

      const orderBy: any = {};
      switch (sortBy) {
        case 'price-low':
          orderBy.price = 'asc';
          break;
        case 'price-high':
          orderBy.price = 'desc';
          break;
        case 'rating':
          orderBy.rating = 'desc';
          break;
        case 'newest':
          orderBy.createdAt = 'desc';
          break;
        default:
          orderBy.reviewCount = 'desc';
      }

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          include: {
            seller: {
              select: {
                id: true,
                name: true,
                rating: true,
                verified: true
              }
            },
            reviews: {
              where: { isVerified: true },
              select: {
                rating: true
              }
            },
            _count: {
              select: {
                reviews: {
                  where: { isVerified: true }
                }
              }
            }
          },
          orderBy,
          skip: (page - 1) * limit,
          take: limit
        }),
        prisma.product.count({ where })
      ]);

      // Calculate average ratings
      const productsWithRatings = products.map(product => ({
        ...product,
        rating: product.reviews.length > 0 
          ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
          : 0,
        reviewCount: product._count.reviews
      }));

      return NextResponse.json({
        products: productsWithRatings,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    }

    if (type === 'cart') {
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

      return NextResponse.json({ cartItems });
    }

    if (type === 'wishlist') {
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
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });

  } catch (error) {
    console.error('Error fetching shopping data:', error);
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
    const action = url.searchParams.get('action') || 'add-to-cart';

    if (action === 'add-to-cart') {
      const validatedData = addToCartSchema.parse(body);

      // Check if product exists and is in stock
      const product = await prisma.product.findUnique({
        where: { 
          id: validatedData.productId,
          isActive: true,
          inStock: true
        }
      });

      if (!product) {
        return NextResponse.json({ error: 'Product not found or out of stock' }, { status: 404 });
      }

      // Check if item already in cart
      const existingItem = await prisma.cartItem.findFirst({
        where: {
          userId: session.user.id,
          productId: validatedData.productId
        }
      });

      if (existingItem) {
        // Update quantity
        const updatedItem = await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + validatedData.quantity },
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

        return NextResponse.json(updatedItem);
      } else {
        // Add new item to cart
        const cartItem = await prisma.cartItem.create({
          data: {
            userId: session.user.id,
            productId: validatedData.productId,
            quantity: validatedData.quantity
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

        return NextResponse.json(cartItem, { status: 201 });
      }
    }

    if (action === 'add-to-wishlist') {
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
    }

    if (action === 'create-product') {
      const validatedData = createProductSchema.parse(body);

      const product = await prisma.product.create({
        data: {
          ...validatedData,
          sellerId: session.user.id
        },
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
      });

      return NextResponse.json(product, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action parameter' }, { status: 400 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error in shopping action:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
