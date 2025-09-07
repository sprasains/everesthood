# 🚨 Troubleshooting Guide

## News & Content Curation Issues

### News Feed Problems

**Issue**: News feed is empty or not loading
```bash
# Check if news sources are active
curl -s http://localhost:3000/api/news/sources | jq '.sources[] | select(.isActive == true)'

# Check if articles exist
curl -s http://localhost:3000/api/news | jq '.articles | length'
```

**Solutions**:
1. Verify news sources are active and have fetched articles
2. Check database for NewsArticle records
3. Ensure user has set news preferences
4. Check API endpoint responses for errors

**Issue**: User preferences not working
```bash
# Check user preferences
curl -s http://localhost:3000/api/news/preferences | jq .
```

**Solutions**:
1. Ensure user is authenticated
2. Check if UserNewsPreference record exists
3. Verify categories and sources are valid
4. Test preference update API

**Issue**: Recommendations not showing
```bash
# Test recommendation API
curl -s "http://localhost:3000/api/news/recommendations?algorithm=hybrid" | jq .
```

**Solutions**:
1. Check if user has interaction history
2. Verify recommendation algorithm is working
3. Ensure user preferences are set
4. Check for errors in recommendation logic

### Admin Features Issues

**Issue**: Cannot access news source management
**Solutions**:
1. Verify user has ADMIN or SUPER_ADMIN role
2. Check authentication status
3. Ensure proper permissions are set

**Issue**: RSS feeds not updating
```bash
# Check source configuration
curl -s http://localhost:3000/api/news/sources | jq '.sources[] | select(.type == "RSS")'
```

**Solutions**:
1. Verify RSS feed URLs are accessible
2. Check fetch intervals are set correctly
3. Ensure background jobs are running
4. Check for RSS parsing errors

### Content Curation Issues

**Issue**: Featured/trending articles not showing
**Solutions**:
1. Check if articles are marked as featured/trending
2. Verify curation API is working
3. Check admin permissions
4. Ensure proper article status

## Queue Troubleshooting Checklist

- Redis reachable? `redis-cli ping` or check `app/api/queue/health`.
- Are jobs scheduled? Check Bull Board `/admin/queues`.
- Job stuck in active: worker may be processing but hung — check worker logs for runId.
- Job stuck in waiting: worker may not be connected, or job priority/locking issue.
- Job failed: inspect `failed` tab in Bull Board and logs; check schema validation errors.
- Why my job didn't run?
  - Payload too big: Redis has job size limits; try reducing payload or store input in DB and pass reference.
  - Schema validation failed: ensure payload matches `lib/queue/types.ts` zod schemas.
  - Bad credentials in worker: check worker credential fetch logs.

Examples (jq):
```
# see counts
curl -s http://localhost:3000/api/queue/health | jq .

# fetch recent failed jobs from bullboard HTTP API or Redis directly
```

## Database Issues

### News Database Problems

**Issue**: NewsArticle table not found
**Solutions**:
1. Run database migrations: `npx prisma migrate dev`
2. Check Prisma schema for NewsArticle model
3. Verify database connection

**Issue**: User preferences not saving
**Solutions**:
1. Check UserNewsPreference model in schema
2. Verify user authentication
3. Check for validation errors
4. Ensure proper API endpoint usage

## API Issues

### News API Problems

**Issue**: 401 Unauthorized errors
**Solutions**:
1. Check authentication headers
2. Verify session is valid
3. Ensure user is logged in
4. Check NextAuth configuration

**Issue**: 403 Forbidden errors (Admin features)
**Solutions**:
1. Verify user role is ADMIN or SUPER_ADMIN
2. Check role assignment in database
3. Ensure proper permission checks

**Issue**: 500 Internal Server Errors
**Solutions**:
1. Check server logs for detailed errors
2. Verify database connections
3. Check for missing environment variables
4. Ensure proper error handling

## Frontend Issues

### News UI Problems

**Issue**: News page not loading
**Solutions**:
1. Check browser console for errors
2. Verify API endpoints are accessible
3. Check authentication status
4. Ensure proper component imports

**Issue**: User interactions not working
**Solutions**:
1. Check API calls in network tab
2. Verify interaction endpoints
3. Check for JavaScript errors
4. Ensure proper state management

## Performance Issues

### News Feed Performance

**Issue**: Slow news feed loading
**Solutions**:
1. Check database query performance
2. Implement pagination
3. Add proper indexing
4. Use caching for frequently accessed data

**Issue**: High database load
**Solutions**:
1. Optimize database queries
2. Add database indexes
3. Implement query caching
4. Use connection pooling

## Common Error Messages

### News-Specific Errors

**"Failed to fetch news"**
- Check API endpoint availability
- Verify authentication
- Check network connectivity

**"No articles found"**
- Check if news sources have articles
- Verify user preferences
- Check filtering parameters

**"Failed to update interaction"**
- Check authentication status
- Verify article exists
- Check interaction type validity

**"Forbidden: Cannot access admin features"**
- Verify user role
- Check admin permissions
- Ensure proper authentication

## Debug Commands

```bash
# Check news sources
curl -s http://localhost:3000/api/news/sources | jq .

# Check user preferences
curl -s http://localhost:3000/api/news/preferences | jq .

# Test news feed
curl -s "http://localhost:3000/api/news?limit=5" | jq .

# Check recommendations
curl -s "http://localhost:3000/api/news/recommendations?limit=5" | jq .

# Test article interaction
curl -X POST http://localhost:3000/api/news/[articleId]/interact \
  -H "Content-Type: application/json" \
  -d '{"type": "like"}'
```
