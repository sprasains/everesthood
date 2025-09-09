import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

interface TestRequest {
  method: string;
  url: string;
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

interface TestResponse {
  success: boolean;
  request: TestRequest;
  response?: {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    data: any;
  };
  error?: string;
  metrics: {
    duration: number;
    timestamp: string;
  };
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const body = await req.json();
  const { 
    method = 'GET', 
    url, 
    headers = {}, 
    body: requestBody, 
    timeout = 10000,
    followRedirects = true,
    validateSSL = true
  } = body;
  
  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }
  
  // Validate URL
  try {
    new URL(url);
  } catch {
    return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
  }
  
  // Security check - only allow localhost and same domain in production
  if (process.env.NODE_ENV === 'production') {
    const urlObj = new URL(url);
    const allowedHosts = ['localhost', '127.0.0.1', process.env.NEXTAUTH_URL];
    
    if (!allowedHosts.some(host => urlObj.hostname.includes(host))) {
      return NextResponse.json({ 
        error: 'Only localhost and same domain requests allowed in production' 
      }, { status: 403 });
    }
  }
  
  try {
    const startTime = Date.now();
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    // Prepare headers
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'EverestHood-Debug-Tool/1.0',
      ...headers
    };
    
    // Add authentication if available
    if (session.accessToken) {
      requestHeaders['Authorization'] = `Bearer ${session.accessToken}`;
    }
    
    // Prepare fetch options
    const fetchOptions: RequestInit = {
      method,
      headers: requestHeaders,
      signal: controller.signal,
      redirect: followRedirects ? 'follow' : 'manual'
    };
    
    // Add body for non-GET requests
    if (requestBody && method !== 'GET') {
      fetchOptions.body = typeof requestBody === 'string' 
        ? requestBody 
        : JSON.stringify(requestBody);
    }
    
    const response = await fetch(url, fetchOptions);
    
    clearTimeout(timeoutId);
    const endTime = Date.now();
    
    // Get response data
    const contentType = response.headers.get('content-type') || '';
    let responseData: any;
    
    if (contentType.includes('application/json')) {
      try {
        responseData = await response.json();
      } catch {
        responseData = await response.text();
      }
    } else if (contentType.includes('text/')) {
      responseData = await response.text();
    } else {
      // For binary content, return metadata only
      responseData = {
        type: 'binary',
        size: response.headers.get('content-length') || 'unknown',
        contentType
      };
    }
    
    const result: TestResponse = {
      success: true,
      request: {
        method,
        url,
        headers: requestHeaders,
        body: requestBody,
        timeout
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
    };
    
    return NextResponse.json(result);
    
  } catch (error) {
    const endTime = Date.now();
    
    const result: TestResponse = {
      success: false,
      request: {
        method,
        url,
        headers,
        body: requestBody,
        timeout
      },
      error: error.message,
      metrics: {
        duration: endTime - Date.now(),
        timestamp: new Date().toISOString()
      }
    };
    
    return NextResponse.json(result, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const endpoint = searchParams.get('endpoint');
  
  if (!endpoint) {
    return NextResponse.json({ error: 'endpoint parameter is required' }, { status: 400 });
  }
  
  // Test the endpoint with a simple GET request
  try {
    const startTime = Date.now();
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'User-Agent': 'EverestHood-Debug-Tool/1.0'
      }
    });
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
      endpoint,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      data: responseData,
      duration: endTime - startTime,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      endpoint,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
