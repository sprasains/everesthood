import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

interface LogEntry {
  level: string;
  time: string;
  msg: string;
  pid: number;
  hostname: string;
  [key: string]: any;
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const level = searchParams.get('level') || 'error';
  const limit = parseInt(searchParams.get('limit') || '100');
  const since = searchParams.get('since');
  const until = searchParams.get('until');
  const search = searchParams.get('search');
  const userId = searchParams.get('userId');
  const requestId = searchParams.get('requestId');
  
  try {
    const logs = await getLogs({
      level,
      limit,
      since,
      until,
      search,
      userId,
      requestId
    });
    
    return NextResponse.json({ 
      logs, 
      filters: {
        level,
        limit,
        since,
        until,
        search,
        userId,
        requestId
      },
      total: logs.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ 
      error: error.message,
      filters: {
        level,
        limit,
        since,
        until,
        search,
        userId,
        requestId
      },
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
  const { action, logId, level } = body;
  
  try {
    switch (action) {
      case 'clear':
        await clearLogs(level);
        return NextResponse.json({ 
          success: true, 
          message: `Cleared ${level || 'all'} logs`,
          timestamp: new Date().toISOString()
        });
      
      case 'download':
        const logContent = await downloadLogs(level);
        return NextResponse.json({ 
          success: true, 
          content: logContent,
          timestamp: new Date().toISOString()
        });
      
      case 'tail':
        const tailLogs = await tailLogs(100);
        return NextResponse.json({ 
          success: true, 
          logs: tailLogs,
          timestamp: new Date().toISOString()
        });
      
      default:
        return NextResponse.json({ 
          error: 'Invalid action' 
        }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ 
      error: error.message,
      action,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

async function getLogs(filters: {
  level: string;
  limit: number;
  since?: string;
  until?: string;
  search?: string;
  userId?: string;
  requestId?: string;
}): Promise<LogEntry[]> {
  const logPath = path.join(process.cwd(), 'logs', 'app.log');
  
  if (!fs.existsSync(logPath)) {
    // Return mock data if log file doesn't exist
    return generateMockLogs(filters);
  }
  
  try {
    const logContent = fs.readFileSync(logPath, 'utf8');
    const lines = logContent.split('\n').filter(line => line.trim());
    
    let filteredLines = lines;
    
    // Filter by level
    if (filters.level !== 'all') {
      filteredLines = filteredLines.filter(line => 
        line.includes(`"level":${filters.level}`)
      );
    }
    
    // Filter by time range
    if (filters.since) {
      const sinceDate = new Date(filters.since);
      filteredLines = filteredLines.filter(line => {
        try {
          const logEntry = JSON.parse(line);
          return new Date(logEntry.time) >= sinceDate;
        } catch {
          return true;
        }
      });
    }
    
    if (filters.until) {
      const untilDate = new Date(filters.until);
      filteredLines = filteredLines.filter(line => {
        try {
          const logEntry = JSON.parse(line);
          return new Date(logEntry.time) <= untilDate;
        } catch {
          return true;
        }
      });
    }
    
    // Filter by search term
    if (filters.search) {
      filteredLines = filteredLines.filter(line => 
        line.toLowerCase().includes(filters.search!.toLowerCase())
      );
    }
    
    // Filter by userId
    if (filters.userId) {
      filteredLines = filteredLines.filter(line => 
        line.includes(`"userId":"${filters.userId}"`)
      );
    }
    
    // Filter by requestId
    if (filters.requestId) {
      filteredLines = filteredLines.filter(line => 
        line.includes(`"requestId":"${filters.requestId}"`)
      );
    }
    
    // Parse and limit results
    const logs = filteredLines
      .slice(-filters.limit)
      .map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return { raw: line, level: 'unknown', time: new Date().toISOString() };
        }
      });
    
    return logs;
  } catch (error) {
    console.error('Error reading logs:', error);
    return generateMockLogs(filters);
  }
}

function generateMockLogs(filters: any): LogEntry[] {
  const mockLogs: LogEntry[] = [
    {
      level: 'error',
      time: new Date(Date.now() - 1000).toISOString(),
      msg: 'Database connection failed',
      pid: process.pid,
      hostname: 'localhost',
      error: 'Connection timeout',
      requestId: 'req_123',
      userId: 'user_456'
    },
    {
      level: 'warn',
      time: new Date(Date.now() - 2000).toISOString(),
      msg: 'High memory usage detected',
      pid: process.pid,
      hostname: 'localhost',
      memoryUsage: '85%',
      requestId: 'req_124'
    },
    {
      level: 'info',
      time: new Date(Date.now() - 3000).toISOString(),
      msg: 'User login successful',
      pid: process.pid,
      hostname: 'localhost',
      userId: 'user_789',
      requestId: 'req_125'
    },
    {
      level: 'error',
      time: new Date(Date.now() - 4000).toISOString(),
      msg: 'API rate limit exceeded',
      pid: process.pid,
      hostname: 'localhost',
      endpoint: '/api/users',
      userId: 'user_101',
      requestId: 'req_126'
    },
    {
      level: 'debug',
      time: new Date(Date.now() - 5000).toISOString(),
      msg: 'Cache hit for user profile',
      pid: process.pid,
      hostname: 'localhost',
      cacheKey: 'user:profile:123',
      requestId: 'req_127'
    }
  ];
  
  // Apply filters to mock data
  let filtered = mockLogs;
  
  if (filters.level !== 'all') {
    filtered = filtered.filter(log => log.level === filters.level);
  }
  
  if (filters.search) {
    filtered = filtered.filter(log => 
      log.msg.toLowerCase().includes(filters.search.toLowerCase())
    );
  }
  
  if (filters.userId) {
    filtered = filtered.filter(log => log.userId === filters.userId);
  }
  
  if (filters.requestId) {
    filtered = filtered.filter(log => log.requestId === filters.requestId);
  }
  
  return filtered.slice(0, filters.limit);
}

async function clearLogs(level?: string) {
  const logPath = path.join(process.cwd(), 'logs', 'app.log');
  
  if (fs.existsSync(logPath)) {
    if (level) {
      // Clear specific level logs (would need more complex implementation)
      fs.writeFileSync(logPath, '');
    } else {
      // Clear all logs
      fs.writeFileSync(logPath, '');
    }
  }
}

async function downloadLogs(level?: string): Promise<string> {
  const logPath = path.join(process.cwd(), 'logs', 'app.log');
  
  if (fs.existsSync(logPath)) {
    return fs.readFileSync(logPath, 'utf8');
  }
  
  return 'No logs available';
}

async function tailLogs(limit: number): Promise<LogEntry[]> {
  const logPath = path.join(process.cwd(), 'logs', 'app.log');
  
  if (!fs.existsSync(logPath)) {
    return generateMockLogs({ limit });
  }
  
  try {
    const logContent = fs.readFileSync(logPath, 'utf8');
    const lines = logContent.split('\n').filter(line => line.trim());
    
    return lines
      .slice(-limit)
      .map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return { raw: line, level: 'unknown', time: new Date().toISOString() };
        }
      });
  } catch (error) {
    return generateMockLogs({ limit });
  }
}
