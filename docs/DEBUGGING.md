# 🔧 Debugging & Troubleshooting Guide

## Quick Start

1. **Enable Debug Mode**
   ```bash
   export FEATURE_DEBUG=true
   npm run dev
   ```

2. **Access Debug Panel**
   - Navigate to `/debug` (Admin only)
   - Or use individual API endpoints

## Available Debug Tools

### 1. System Health Monitor
- **Endpoint**: `/api/debug/health`
- **Purpose**: Check database, Redis, queue, and storage health
- **Usage**: Monitor system status in real-time

**Example Request:**
```bash
curl http://localhost:3000/api/debug/health
```

**Response:**
```json
{
  "status": "healthy",
  "services": {
    "database": {
      "status": "healthy",
      "latency": 45,
      "details": { "total_connections": 5, "active_connections": 2 }
    },
    "redis": {
      "status": "healthy",
      "latency": 12,
      "details": { "used_memory": "2.5MB" }
    }
  },
  "system": {
    "memory": { "heapUsed": 45678912, "heapTotal": 67108864 },
    "uptime": 3600,
    "version": "v18.17.0"
  }
}
```

### 2. API Request Debugger
- **Endpoint**: `/api/debug/requests`
- **Purpose**: View recent API requests and responses
- **Usage**: Debug API flow issues

**Example Request:**
```bash
# Get recent requests
curl "http://localhost:3000/api/debug/requests?limit=10&method=GET"

# Test an API endpoint
curl -X POST http://localhost:3000/api/debug/requests \
  -H "Content-Type: application/json" \
  -d '{
    "method": "GET",
    "url": "http://localhost:3000/api/users",
    "timeout": 5000
  }'
```

### 3. Database Query Tool
- **Endpoint**: `/api/debug/database`
- **Purpose**: Execute custom database queries
- **Usage**: Debug data issues

**Example Request:**
```bash
# Get model data
curl "http://localhost:3000/api/debug/database?model=User&limit=5"

# Execute custom query
curl -X POST http://localhost:3000/api/debug/database \
  -H "Content-Type: application/json" \
  -d '{
    "query": "SELECT COUNT(*) FROM User WHERE createdAt > $1",
    "params": ["2024-01-01"],
    "type": "raw"
  }'
```

### 4. Error Log Viewer
- **Endpoint**: `/api/debug/logs`
- **Purpose**: View application logs by level
- **Usage**: Debug errors and warnings

**Example Request:**
```bash
# Get error logs
curl "http://localhost:3000/api/debug/logs?level=error&limit=20"

# Get logs with search
curl "http://localhost:3000/api/debug/logs?search=database&level=all"

# Clear logs
curl -X POST http://localhost:3000/api/debug/logs \
  -H "Content-Type: application/json" \
  -d '{"action": "clear", "level": "error"}'
```

### 5. Cache Inspector
- **Endpoint**: `/api/debug/cache`
- **Purpose**: View Redis cache contents
- **Usage**: Debug caching issues

**Example Request:**
```bash
curl http://localhost:3000/api/debug/cache
```

### 6. Performance Monitor
- **Endpoint**: `/api/debug/performance`
- **Purpose**: Monitor memory, CPU, and request metrics
- **Usage**: Debug performance issues

**Example Request:**
```bash
# Get performance metrics
curl http://localhost:3000/api/debug/performance

# Reset metrics
curl -X POST http://localhost:3000/api/debug/performance \
  -H "Content-Type: application/json" \
  -d '{"action": "reset"}'
```

### 7. Environment Checker
- **Endpoint**: `/api/debug/env`
- **Purpose**: Verify environment variables
- **Usage**: Debug configuration issues

**Example Request:**
```bash
curl http://localhost:3000/api/debug/env
```

### 8. Schema Inspector
- **Endpoint**: `/api/debug/schema`
- **Purpose**: View database schema and relationships
- **Usage**: Debug database structure

**Example Request:**
```bash
# Get full schema
curl http://localhost:3000/api/debug/schema

# Get specific table details
curl "http://localhost:3000/api/debug/schema?table=User&includeStats=true"
```

### 9. Request Tracer
- **Endpoint**: `/api/debug/trace`
- **Purpose**: Trace request flow through the system
- **Usage**: Debug complex request flows

**Example Request:**
```bash
# Get specific request trace
curl "http://localhost:3000/api/debug/trace?requestId=req_123"

# Get recent traces
curl "http://localhost:3000/api/debug/trace?limit=10&userId=user_456"

# Simulate and trace a request
curl -X POST http://localhost:3000/api/debug/trace \
  -H "Content-Type: application/json" \
  -d '{
    "action": "simulate",
    "endpoint": "http://localhost:3000/api/users",
    "method": "GET"
  }'
```

### 10. API Testing Tool
- **Endpoint**: `/api/debug/test`
- **Purpose**: Test API endpoints with custom parameters
- **Usage**: Debug API behavior

**Example Request:**
```bash
# Test an endpoint
curl -X POST http://localhost:3000/api/debug/test \
  -H "Content-Type: application/json" \
  -d '{
    "method": "POST",
    "url": "http://localhost:3000/api/posts",
    "headers": {"Content-Type": "application/json"},
    "body": {"title": "Test Post", "content": "Test Content"},
    "timeout": 10000
  }'
```

## Common Debugging Scenarios

### 1. API Not Responding
```bash
# Check system health
curl http://localhost:3000/api/debug/health

# Check recent requests
curl "http://localhost:3000/api/debug/requests?limit=10"

# Check error logs
curl "http://localhost:3000/api/debug/logs?level=error&limit=20"
```

### 2. Database Issues
```bash
# Check database health
curl http://localhost:3000/api/debug/health

# View database schema
curl http://localhost:3000/api/debug/schema

# Test database query
curl -X POST http://localhost:3000/api/debug/database \
  -H "Content-Type: application/json" \
  -d '{"query": "SELECT COUNT(*) FROM User"}'
```

### 3. Authentication Issues
```bash
# Check environment variables
curl http://localhost:3000/api/debug/env

# Test authentication endpoint
curl -X POST http://localhost:3000/api/debug/test \
  -H "Content-Type: application/json" \
  -d '{"endpoint": "/api/auth/session", "method": "GET"}'
```

### 4. Performance Issues
```bash
# Check performance metrics
curl http://localhost:3000/api/debug/performance

# Check system health
curl http://localhost:3000/api/debug/health

# Reset performance metrics
curl -X POST http://localhost:3000/api/debug/performance \
  -H "Content-Type: application/json" \
  -d '{"action": "reset"}'
```

## Log Analysis

### View Logs in Real-time
```bash
# Development
tail -f logs/app.log | jq '.'

# Production
tail -f logs/app.log | jq '.level == "error"'
```

### Filter Logs by Request ID
```bash
# Find all logs for a specific request
grep "requestId123" logs/app.log | jq '.'
```

### Filter Logs by User
```bash
# Find all logs for a specific user
grep "userId456" logs/app.log | jq '.'
```

### Filter Logs by Level
```bash
# Error logs only
grep '"level":50' logs/app.log | jq '.'

# Warning logs only
grep '"level":40' logs/app.log | jq '.'

# Info logs only
grep '"level":30' logs/app.log | jq '.'
```

## Database Debugging

### Check Table Sizes
```sql
SELECT 
  schemaname,
  tablename,
  attname,
  n_distinct,
  correlation
FROM pg_stats
WHERE schemaname = 'public'
ORDER BY tablename;
```

### Check Index Usage
```sql
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

### Check Slow Queries
```sql
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  rows
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

### Check Connection Pool
```sql
SELECT 
  count(*) as total_connections,
  count(*) FILTER (WHERE state = 'active') as active_connections,
  count(*) FILTER (WHERE state = 'idle') as idle_connections
FROM pg_stat_activity 
WHERE datname = current_database();
```

## Redis Debugging

### Check Redis Status
```bash
# Connect to Redis
redis-cli

# Check info
INFO

# Check keys
KEYS *

# Check memory usage
INFO memory
```

### Monitor Redis Commands
```bash
# Monitor all commands
redis-cli MONITOR

# Monitor specific pattern
redis-cli MONITOR | grep "user:"
```

### Check Redis Performance
```bash
# Check slow log
redis-cli SLOWLOG GET 10

# Check client list
redis-cli CLIENT LIST
```

## Queue Debugging

### Check Queue Status
```bash
# View queue dashboard
open http://localhost:3001

# Check queue stats via API
curl http://localhost:3000/api/queue/debug
```

### Check Failed Jobs
```bash
# View failed jobs
curl http://localhost:3000/api/queue/dlq
```

### Check Queue Health
```bash
# Check queue health
curl http://localhost:3000/api/queue/health
```

## Frontend Debugging

### React DevTools
- Install React DevTools browser extension
- Use Profiler to identify performance issues
- Use Components to inspect state

### Network Tab
- Check API request/response details
- Verify headers and authentication
- Check for CORS issues

### Console Debugging
```javascript
// Enable debug logging
localStorage.setItem('debug', 'true');

// Check user session
console.log('Session:', await getSession());

// Check API responses
fetch('/api/debug/health').then(r => r.json()).then(console.log);
```

### Debug Panel Usage
1. Navigate to `/debug` with admin credentials
2. Use tabs to switch between different debugging tools
3. Use filters to narrow down results
4. Export data for further analysis

## Production Debugging

### Enable Debug Mode
```bash
# Set environment variable
export FEATURE_DEBUG=true

# Restart application
pm2 restart everesthood
```

### Access Debug Panel
- Navigate to `/debug` with admin credentials
- Use individual API endpoints for specific debugging

### Monitor Logs
```bash
# View application logs
pm2 logs everesthood

# View error logs only
pm2 logs everesthood --err

# View logs with timestamps
pm2 logs everesthood --timestamp
```

### Monitor Performance
```bash
# Check system resources
htop

# Check memory usage
free -h

# Check disk usage
df -h
```

## Troubleshooting Checklist

### 1. Check System Health
- [ ] Database connection
- [ ] Redis connection
- [ ] Queue system
- [ ] Storage system

### 2. Check Environment
- [ ] All required environment variables set
- [ ] Database URL correct
- [ ] Redis URL correct
- [ ] Authentication secrets set

### 3. Check Logs
- [ ] No error logs
- [ ] No warning logs
- [ ] Request logs showing properly
- [ ] Authentication logs working

### 4. Check Performance
- [ ] Memory usage normal
- [ ] CPU usage normal
- [ ] Response times acceptable
- [ ] No memory leaks

### 5. Check API Endpoints
- [ ] All endpoints responding
- [ ] Authentication working
- [ ] Database queries working
- [ ] Error handling working

## Emergency Procedures

### 1. Database Issues
```bash
# Check database connection
npx prisma db pull

# Reset database (CAUTION: Data loss)
npx prisma migrate reset --force

# Restore from backup
pg_restore -d everesthood backup.sql
```

### 2. Redis Issues
```bash
# Restart Redis
sudo systemctl restart redis

# Clear Redis cache
redis-cli FLUSHALL

# Check Redis logs
sudo journalctl -u redis -f
```

### 3. Application Issues
```bash
# Restart application
pm2 restart everesthood

# Check application logs
pm2 logs everesthood --lines 100

# Check system resources
htop
```

### 4. Queue Issues
```bash
# Restart queue worker
pm2 restart worker

# Clear failed jobs
curl -X DELETE http://localhost:3000/api/queue/dlq

# Check queue status
curl http://localhost:3000/api/queue/health
```

## Best Practices

1. **Always check logs first** - Most issues are visible in logs
2. **Use debug panel** - Provides comprehensive system overview
3. **Test API endpoints** - Verify functionality step by step
4. **Monitor performance** - Keep an eye on system resources
5. **Document issues** - Keep track of problems and solutions
6. **Use version control** - Track changes that might cause issues
7. **Backup regularly** - Always have recent backups available
8. **Test in staging** - Reproduce issues in staging environment first

## Debug Panel Features

### System Health Tab
- Real-time health status of all services
- Performance metrics and system information
- Quick refresh and monitoring capabilities

### Error Logs Tab
- Filterable log viewer by level, time, and search terms
- Download logs for offline analysis
- Clear logs functionality
- Detailed log entry inspection

### API Requests Tab
- Recent request history with status codes
- Request/response details
- Performance metrics per request
- Error tracking and analysis

### Database Tab
- Interactive query tool
- Model data browser
- Schema inspection
- Performance monitoring

### Environment Tab
- Environment variable validation
- Configuration status overview
- Security recommendations
- Feature flag status

## API Response Formats

### Health Check Response
```json
{
  "status": "healthy|degraded|unhealthy",
  "services": {
    "database": { "status": "healthy", "latency": 45 },
    "redis": { "status": "healthy", "latency": 12 },
    "queue": { "status": "healthy", "details": {...} },
    "storage": { "status": "healthy", "details": {...} }
  },
  "system": {
    "memory": {...},
    "uptime": 3600,
    "version": "v18.17.0"
  }
}
```

### Log Entry Format
```json
{
  "level": "error|warn|info|debug",
  "time": "2024-01-01T12:00:00.000Z",
  "msg": "Error message",
  "pid": 12345,
  "hostname": "localhost",
  "requestId": "req_123",
  "userId": "user_456",
  "error": "Detailed error information"
}
```

### Request Trace Format
```json
{
  "requestId": "req_123",
  "method": "GET",
  "url": "/api/users",
  "startTime": "2024-01-01T12:00:00.000Z",
  "endTime": "2024-01-01T12:00:00.150Z",
  "totalDuration": 150,
  "status": 200,
  "steps": [
    {
      "step": "request_received",
      "timestamp": "2024-01-01T12:00:00.000Z"
    },
    {
      "step": "database_query",
      "timestamp": "2024-01-01T12:00:00.025Z",
      "duration": 80
    }
  ],
  "errors": [],
  "performance": {
    "databaseQueries": 1,
    "cacheHits": 0,
    "cacheMisses": 1,
    "externalCalls": 0
  }
}
```

## Security Considerations

1. **Admin Only Access** - All debug endpoints require admin privileges
2. **Production Restrictions** - Some features are limited in production
3. **Sensitive Data Masking** - Passwords and secrets are masked in responses
4. **Rate Limiting** - Debug endpoints should be rate limited
5. **Audit Logging** - All debug actions should be logged
6. **Network Security** - Debug panel should only be accessible from trusted networks

## Performance Impact

1. **Minimal Overhead** - Debug tools are designed to have minimal performance impact
2. **Conditional Loading** - Debug features are only loaded when enabled
3. **Efficient Queries** - Database queries are optimized for debugging
4. **Caching** - Debug data is cached when appropriate
5. **Resource Limits** - Debug operations have resource limits to prevent abuse

This comprehensive debugging system provides developers with all the tools needed to identify, diagnose, and resolve issues quickly and efficiently.
