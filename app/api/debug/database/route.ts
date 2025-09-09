import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const model = searchParams.get('model');
  const limit = parseInt(searchParams.get('limit') || '10');
  const include = searchParams.get('include');
  
  try {
    const data = await queryModel(model, limit, include);
    return NextResponse.json({ 
      data, 
      model, 
      limit, 
      include,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ 
      error: error.message,
      model,
      limit,
      include,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const body = await req.json();
  const { query, params = [], type = 'select' } = body;
  
  if (!query) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 });
  }
  
  // Security check - only allow SELECT queries in production
  if (process.env.NODE_ENV === 'production' && !query.trim().toLowerCase().startsWith('select')) {
    return NextResponse.json({ 
      error: 'Only SELECT queries allowed in production' 
    }, { status: 403 });
  }
  
  try {
    const startTime = Date.now();
    let result;
    
    if (type === 'raw') {
      result = await prisma.$queryRawUnsafe(query, ...params);
    } else {
      // Use Prisma client methods
      result = await executePrismaQuery(query, params);
    }
    
    const endTime = Date.now();
    
    return NextResponse.json({ 
      result, 
      query, 
      params,
      metrics: {
        duration: endTime - startTime,
        rowCount: Array.isArray(result) ? result.length : 1
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ 
      error: error.message,
      query,
      params,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

async function queryModel(model?: string, limit: number = 10, include?: string) {
  if (!model) {
    // Return list of available models
    return {
      models: [
        'User', 'Post', 'Comment', 'AgentTemplate', 'AgentInstance',
        'Wallet', 'Tip', 'Friendship', 'Achievement', 'UserAchievement',
        'AmbassadorProfile', 'ExclusiveContent', 'SpotlightProfile',
        'HealthMetric', 'Product', 'Persona', 'Guide', 'NewsArticle'
      ]
    };
  }
  
  const includeObj = include ? { [include]: true } : undefined;
  
  switch (model.toLowerCase()) {
    case 'user':
      return await prisma.user.findMany({
        take: limit,
        include: includeObj,
        orderBy: { createdAt: 'desc' }
      });
    
    case 'post':
      return await prisma.post.findMany({
        take: limit,
        include: includeObj,
        orderBy: { createdAt: 'desc' }
      });
    
    case 'comment':
      return await prisma.comment.findMany({
        take: limit,
        include: includeObj,
        orderBy: { createdAt: 'desc' }
      });
    
    case 'agenttemplate':
      return await prisma.agentTemplate.findMany({
        take: limit,
        include: includeObj,
        orderBy: { createdAt: 'desc' }
      });
    
    case 'agentinstance':
      return await prisma.agentInstance.findMany({
        take: limit,
        include: includeObj,
        orderBy: { createdAt: 'desc' }
      });
    
    case 'wallet':
      return await prisma.wallet.findMany({
        take: limit,
        include: includeObj,
        orderBy: { createdAt: 'desc' }
      });
    
    case 'tip':
      return await prisma.tip.findMany({
        take: limit,
        include: includeObj,
        orderBy: { createdAt: 'desc' }
      });
    
    case 'friendship':
      return await prisma.friendship.findMany({
        take: limit,
        include: includeObj,
        orderBy: { createdAt: 'desc' }
      });
    
    case 'achievement':
      return await prisma.achievement.findMany({
        take: limit,
        include: includeObj,
        orderBy: { createdAt: 'desc' }
      });
    
    case 'userachievement':
      return await prisma.userAchievement.findMany({
        take: limit,
        include: includeObj,
        orderBy: { createdAt: 'desc' }
      });
    
    case 'ambassadorprofile':
      return await prisma.ambassadorProfile.findMany({
        take: limit,
        include: includeObj,
        orderBy: { createdAt: 'desc' }
      });
    
    case 'exclusivecontent':
      return await prisma.exclusiveContent.findMany({
        take: limit,
        include: includeObj,
        orderBy: { createdAt: 'desc' }
      });
    
    case 'spotlightprofile':
      return await prisma.spotlightProfile.findMany({
        take: limit,
        include: includeObj,
        orderBy: { createdAt: 'desc' }
      });
    
    case 'healthmetric':
      return await prisma.healthMetric.findMany({
        take: limit,
        include: includeObj,
        orderBy: { createdAt: 'desc' }
      });
    
    case 'product':
      return await prisma.product.findMany({
        take: limit,
        include: includeObj,
        orderBy: { createdAt: 'desc' }
      });
    
    case 'persona':
      return await prisma.persona.findMany({
        take: limit,
        include: includeObj,
        orderBy: { createdAt: 'desc' }
      });
    
    case 'guide':
      return await prisma.guide.findMany({
        take: limit,
        include: includeObj,
        orderBy: { createdAt: 'desc' }
      });
    
    case 'newsarticle':
      return await prisma.newsArticle.findMany({
        take: limit,
        include: includeObj,
        orderBy: { createdAt: 'desc' }
      });
    
    default:
      throw new Error(`Unknown model: ${model}`);
  }
}

async function executePrismaQuery(query: string, params: any[]) {
  // Parse and execute Prisma-style queries
  // This is a simplified implementation
  const parts = query.trim().split(' ');
  const operation = parts[0].toLowerCase();
  
  switch (operation) {
    case 'findmany':
      return await prisma.$queryRawUnsafe(query, ...params);
    case 'findfirst':
      return await prisma.$queryRawUnsafe(query, ...params);
    case 'count':
      return await prisma.$queryRawUnsafe(query, ...params);
    default:
      return await prisma.$queryRawUnsafe(query, ...params);
  }
}
