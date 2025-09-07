# 🔧 Extended Troubleshooting Guide

## Quick Problem Finder
Find your issue type and jump to the solution:

1. [Setup Issues](#setup-issues)
2. [Database Issues](#database-issues)
3. [Build & Run Issues](#build--run-issues)
4. [TypeScript Errors](#typescript-errors)
5. [Package Manager Issues](#package-manager-issues)
6. [Git Issues](#git-issues)
7. [Performance Issues](#performance-issues)
8. [Authentication Issues](#authentication-issues)
9. [Network Issues](#network-issues)
10. [Memory Issues](#memory-issues)

## Setup Issues

### Node.js Installation Problems

#### Error: Node.js command not found
```bash
# Check if Node is in PATH
node --version

# If not found, add to PATH
# Windows (PowerShell Admin):
$env:PATH += ";C:\Program Files\nodejs"

# Mac:
echo 'export PATH="/usr/local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

#### Error: Wrong Node version
```bash
# Check current version
node --version

# Using volta (recommended)
volta install node@18
volta pin node@18

# Using nvm
nvm install 18
nvm use 18
nvm alias default 18
```

### VS Code Setup Issues

#### Extensions not working
1. Command Palette (`Ctrl+Shift+P`)
2. Type: `Extensions: Install Extensions`
3. Look for error messages
4. Try:
   ```bash
   # Windows
   code --extensions-dir "%USERPROFILE%\.vscode\extensions-backup"
   
   # Mac
   code --extensions-dir ~/.vscode/extensions-backup
   ```

#### Intellisense not working
1. Delete JavaScript/TypeScript language server cache:
   - Windows: Delete `%APPDATA%\Code\User\workspaceStorage`
   - Mac: Delete `~/Library/Application Support/Code/User/workspaceStorage`
2. Reload VS Code

## Database Issues

### Connection Problems

#### Error: ECONNREFUSED
```bash
# 1. Check if PostgreSQL is running
# Windows
net start postgresql-x64-14
# Mac
brew services list postgresql

# 2. Check port availability
# Windows
netstat -ano | findstr :5432
# Mac
lsof -i :5432

# 3. Test connection
psql -U postgres -h localhost -p 5432 -d everesthood -c "\conninfo"
```

#### Error: Authentication failed
```bash
# 1. Reset postgres password
# Windows
psql -U postgres -c "ALTER USER postgres WITH PASSWORD 'newpassword';"

# 2. Update .env.local
DATABASE_URL="postgresql://postgres:newpassword@localhost:5432/everesthood"

# 3. Verify connection
psql -U postgres -d everesthood -c "SELECT 1;"
```

### Migration Issues

#### Error: Migration failed
```bash
# 1. Check migration status
pnpm prisma migrate status

# 2. Reset database (WARNING: Deletes all data)
pnpm prisma migrate reset

# 3. If still failing, try force reset
pnpm prisma db push --force-reset

# 4. Check for conflicting migrations
pnpm prisma migrate diff
```

#### Error: Prisma Schema Conflicts
```bash
# 1. Backup current schema
cp prisma/schema.prisma prisma/schema.prisma.backup

# 2. Pull current database schema
pnpm prisma db pull

# 3. Compare differences
diff prisma/schema.prisma.backup prisma/schema.prisma

# 4. Resolve and regenerate client
pnpm prisma generate
```

## Build & Run Issues

### Next.js Build Problems

#### Error: Build fails with memory error
```bash
# 1. Increase Node memory
# Windows
set NODE_OPTIONS=--max_old_space_size=4096
# Mac
export NODE_OPTIONS=--max_old_space_size=4096

# 2. Clear Next.js cache
rm -rf .next
pnpm next clean

# 3. Fresh install
rm -rf node_modules
pnpm install

# 4. Rebuild
pnpm build
```

#### Error: Static Generation Failed
```bash
# 1. Check for data fetching errors
pnpm build --debug

# 2. Try production build locally
pnpm build
pnpm start

# 3. Check API routes
curl http://localhost:3000/api/health
```

### Runtime Issues

#### Error: Hot Reload not working
```bash
# 1. Check file watchers
# Linux/Mac
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# 2. Clear Next.js cache
rm -rf .next
pnpm next clean

# 3. Restart development server with debug
pnpm dev --debug
```

#### Error: API Routes 500 error
```bash
# 1. Check API logs
pnpm dev --debug

# 2. Test API endpoint
curl -v http://localhost:3000/api/your-endpoint

# 3. Check environment variables
pnpm check-env
```

## TypeScript Errors

### Type Checking Issues

#### Error: Type 'X' is not assignable to type 'Y'
```bash
# 1. Check TypeScript version
pnpm tsc --version

# 2. Clear TypeScript cache
rm -rf node_modules/.cache/typescript

# 3. Regenerate Prisma types
pnpm prisma generate

# 4. Run type check with details
pnpm tsc --noEmit --pretty
```

#### Error: Could not find a declaration file for module 'X'
```bash
# 1. Install missing types
pnpm add -D @types/module-name

# 2. Check tsconfig.json paths
cat tsconfig.json

# 3. Rebuild types
pnpm type-check --force
```

## Package Manager Issues

### PNPM Problems

#### Error: pnpm command not found after installation
```bash
# 1. Check PNPM installation
which pnpm

# 2. Reinstall PNPM
npm install -g pnpm

# 3. Add to PATH
# Windows (PowerShell Admin)
$env:PATH += ";$env:APPDATA\npm"
# Mac
echo 'export PATH="$HOME/.local/share/pnpm:$PATH"' >> ~/.zshrc

# 4. Verify installation
pnpm --version
```

#### Error: Peer dependencies conflict
```bash
# 1. Check dependency tree
pnpm why package-name

# 2. Clear PNPM store
pnpm store prune

# 3. Force resolution
pnpm install --force

# 4. Update all dependencies
pnpm update
```

## Git Issues

### Repository Problems

#### Error: git pull fails
```bash
# 1. Check remote connection
git remote -v
git fetch --dry-run

# 2. Save local changes
git stash

# 3. Reset local branch
git fetch origin
git reset --hard origin/main

# 4. Reapply changes
git stash pop
```

#### Error: Merge conflicts
```bash
# 1. Check status
git status

# 2. Abort current merge
git merge --abort

# 3. Get latest changes
git fetch origin

# 4. Reset to clean state
git reset --hard HEAD
git clean -fd
```

## Performance Issues

### Slow Development Server

#### Error: Dev server taking too long to start
```bash
# 1. Check CPU usage
# Windows
tasklist /v
# Mac
top

# 2. Clear all caches
rm -rf .next
rm -rf node_modules/.cache
pnpm next clean

# 3. Start with profiling
NODE_OPTIONS='--prof' pnpm dev
```

#### Error: Hot reload is slow
```bash
# 1. Check file watchers
# Linux/Mac
sysctl fs.inotify.max_user_watches
sudo sysctl fs.inotify.max_user_watches=524288

# 2. Exclude heavy folders
echo "node_modules\n.next\n" > .watchignore

# 3. Start with fewer pages
pnpm dev --only pages/index.tsx
```

## Authentication Issues

### NextAuth Problems

#### Error: NEXTAUTH_SECRET not configured
```bash
# 1. Generate secret
openssl rand -base64 32

# 2. Add to .env.local
echo "NEXTAUTH_SECRET=your-generated-secret" >> .env.local

# 3. Verify environment
pnpm check-env
```

#### Error: OAuth callback failed
```bash
# 1. Check callback URL
echo $NEXTAUTH_URL

# 2. Verify provider settings
cat pages/api/auth/[...nextauth].ts

# 3. Check provider console
# - Google Cloud Console
# - GitHub OAuth Apps
# etc.
```

## Network Issues

### API Connection Problems

#### Error: CORS issues
```bash
# 1. Check CORS configuration
cat next.config.mjs

# 2. Test API with CORS headers
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS \
     http://localhost:3000/api/endpoint

# 3. Update CORS settings
# next.config.mjs
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: '*' }
      ],
    }
  ]
}
```

#### Error: API timeout
```bash
# 1. Check API response time
time curl http://localhost:3000/api/endpoint

# 2. Monitor API calls
pnpm dev --debug

# 3. Check database queries
# Add to prisma schema
log = ['query', 'info', 'warn', 'error']
```

## Memory Issues

### Memory Leaks

#### Error: JavaScript heap out of memory
```bash
# 1. Increase Node memory
export NODE_OPTIONS="--max-old-space-size=4096"

# 2. Check memory usage
# Windows
tasklist /FI "IMAGENAME eq node.exe" /FI "MEMUSAGE gt 1000000"
# Mac
ps -eo pmem,command | grep node

# 3. Run garbage collection
node --expose-gc
global.gc()
```

#### Error: Process runs out of memory
```bash
# 1. Monitor memory usage
node --trace-gc

# 2. Check for memory leaks
node --inspect

# 3. Use Chrome DevTools
# Open chrome://inspect
# Click "inspect" under Remote Target
```

## Recovery Steps

### Complete Reset

If nothing else works:

```bash
# 1. Save environment variables
cp .env.local .env.backup

# 2. Remove all generated files
rm -rf .next
rm -rf node_modules
rm -rf .env.local

# 3. Clear package manager cache
pnpm store prune

# 4. Reset git
git reset --hard HEAD
git clean -fd

# 5. Fresh install
pnpm install

# 6. Restore environment
cp .env.backup .env.local

# 7. Rebuild
pnpm build
```

### Database Reset

Complete database reset:

```bash
# 1. Backup current database
pg_dump -U postgres everesthood > backup.sql

# 2. Drop and recreate database
psql -U postgres -c "DROP DATABASE everesthood;"
psql -U postgres -c "CREATE DATABASE everesthood;"

# 3. Push schema
pnpm prisma db push

# 4. Run migrations
pnpm prisma migrate deploy

# 5. Seed data
pnpm prisma db seed
```

Remember: If these steps don't solve your problem:
1. Check the error message carefully
2. Look for similar issues in our GitHub issues
3. Ask for help in our Discord channel
4. Include all relevant error messages and steps you've tried when asking for help
