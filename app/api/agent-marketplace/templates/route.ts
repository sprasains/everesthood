// app/api/agent-marketplace/templates/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET() {
  // Fetch agent templates from Prisma
  const templates = await prisma.agentTemplate.findMany({
    where: {
      isPublic: true,
      deletedAt: null
    },
    include: {
      reviews: {
        select: {
          rating: true,
          id: true
        }
      },
      _count: {
        select: {
          agentInstances: true,
          reviews: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Format templates with calculated fields
  const formattedTemplates = templates.map(template => ({
    ...template,
    reviewCount: template._count.reviews,
    instanceCount: template._count.agentInstances,
    averageRating: template.reviews.length > 0 
      ? template.reviews.reduce((sum, review) => sum + review.rating, 0) / template.reviews.length
      : 0
  }));

  return NextResponse.json(formattedTemplates);
}
