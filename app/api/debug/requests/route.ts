import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface RequestLog {
  id: string;
  method: string;
  url: string;
  status: number;
  duration: number;
  timestamp: string;
  userAgent?: string;
  ip?: string;
  userId?: string;
  error?: string;
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') || '50');
  const endpoint = searchParams.get('endpoint');
  const method = searchParams.get('method');
  const status = searchParams.get('status');
  
  try {
    // Get recent API requests from logs or database
    const requests = await getRecentRequests(limit, { endpoint, method, status });
    
    return NextResponse.json({
      requests,
      total: requests.length,
      filters: { limit, endpoint, method, status }
    });
  } catch (error) {
    return NextResponse.json({ 
      error: error.message,
      filters: { limit, endpoint, method, status }
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const body = await req.json();
  const { method = 'GET', url, headers = {}, body: requestBody, timeout = 10000 } = body;
  
  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }
  
  try {
    const startTime = Date.now();
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`,
        ...headers
      },
      body: requestBody ? JSON.stringify(requestBody) : undefined,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    const endTime = Date.now();
    const responseText = await response.text();
    
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }
    
    return NextResponse.json({
      success: true,
      request: {
        method,
        url,
        headers,
        body: requestBody
      },
      response: {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: responseData
      },
      metrics: {
        duration: endTime - startTime,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      request: {
        method,
        url,
        headers,
        body: requestBody
      },
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

async function getRecentRequests(
  limit: number, 
  filters: { endpoint?: string; method?: string; status?: string } = {}
): Promise<RequestLog[]> {
  // In a real implementation, this would query from a request log table
  // For now, return mock data
  const mockRequests: RequestLog[] = [
    {
      id: 'req_1',
      method: 'GET',
      url: '/api/users',
      status: 200,
      duration: 45,
      timestamp: new Date(Date.now() - 1000).toISOString(),
      userAgent: 'Mozilla/5.0...',
      ip: '127.0.0.1',
      userId: 'user_1'
    },
    {
      id: 'req_2',
      method: 'POST',
      url: '/api/posts',
      status: 201,
      duration: 120,
      timestamp: new Date(Date.now() - 2000).toISOString(),
      userAgent: 'Mozilla/5.0...',
      ip: '127.0.0.1',
      userId: 'user_2'
    },
    {
      id: 'req_3',
      method: 'GET',
      url: '/api/debug/health',
      status: 500,
      duration: 2000,
      timestamp: new Date(Date.now() - 3000).toISOString(),
      userAgent: 'Mozilla/5.0...',
      ip: '127.0.0.1',
      error: 'Database connection failed'
    }
  ];

  let filtered = mockRequests;
  
  if (filters.endpoint) {
    filtered = filtered.filter(req => req.url.includes(filters.endpoint!));
  }
  
  if (filters.method) {
    filtered = filtered.filter(req => req.method === filters.method);
  }
  
  if (filters.status) {
    filtered = filtered.filter(req => req.status.toString() === filters.status);
  }
  
  return filtered.slice(0, limit);
}
