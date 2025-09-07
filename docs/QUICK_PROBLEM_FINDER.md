# 🔍 Quick Problem Navigator

## How to Use This Guide

1. Find your issue type in the Problem Categories below
2. Click the link to jump to that section
3. Follow the step-by-step solutions
4. If the first solution doesn't work, try alternatives provided
5. If nothing works, follow the Recovery Steps

## Problem Categories

### 🛠️ Setup Issues
- [Node.js Not Found](#nodejs-not-found)
- [Wrong Node Version](#wrong-node-version)
- [VS Code Extension Problems](#vs-code-extension-problems)
- [Environment Setup Fails](#environment-setup-fails)
- [First-time Setup Issues](#first-time-setup-issues)

### 💾 Database Issues
- [Cannot Connect to Database](#cannot-connect-to-database)
- [Authentication Failed](#authentication-failed)
- [Migration Errors](#migration-errors)
- [Data Seeding Failed](#data-seeding-failed)
- [Database Performance Issues](#database-performance-issues)

### 🏗️ Build & Run Issues
- [Build Fails](#build-fails)
- [Memory Errors During Build](#memory-errors-during-build)
- [Static Generation Failed](#static-generation-failed)
- [Hot Reload Not Working](#hot-reload-not-working)
- [Production Build Issues](#production-build-issues)

### 📝 TypeScript Errors
- [Type Assignment Errors](#type-assignment-errors)
- [Missing Type Definitions](#missing-type-definitions)
- [Path Alias Issues](#path-alias-issues)
- [Import Errors](#import-errors)
- [Generic Type Errors](#generic-type-errors)

### 📦 Package Manager Issues
- [PNPM Not Found](#pnpm-not-found)
- [Dependency Conflicts](#dependency-conflicts)
- [Package Installation Fails](#package-installation-fails)
- [Lock File Issues](#lock-file-issues)
- [Workspace Problems](#workspace-problems)

### 🌳 Git Issues
- [Pull/Push Failed](#pullpush-failed)
- [Merge Conflicts](#merge-conflicts)
- [Branch Problems](#branch-problems)
- [Git Hooks Issues](#git-hooks-issues)
- [Large File Issues](#large-file-issues)

### ⚡ Performance Issues
- [Slow Development Server](#slow-development-server)
- [Slow Hot Reload](#slow-hot-reload)
- [Memory Leaks](#memory-leaks)
- [High CPU Usage](#high-cpu-usage)
- [Slow Database Queries](#slow-database-queries)

### 🔐 Authentication Issues
- [NextAuth Configuration](#nextauth-configuration)
- [OAuth Callback Failed](#oauth-callback-failed)
- [Session Problems](#session-problems)
- [JWT Issues](#jwt-issues)
- [Permission Errors](#permission-errors)

### 🌐 Network Issues
- [CORS Errors](#cors-errors)
- [API Timeouts](#api-timeouts)
- [Fetch Failures](#fetch-failures)
- [WebSocket Issues](#websocket-issues)
- [SSL/TLS Problems](#ssltls-problems)

### 💻 Memory Issues
- [Heap Out of Memory](#heap-out-of-memory)
- [Process Memory Leaks](#process-memory-leaks)
- [Cache Overflow](#cache-overflow)
- [Large Dataset Handling](#large-dataset-handling)
- [Browser Memory Issues](#browser-memory-issues)

## 🚨 Common Error Messages

### Build Errors
```
Error: Build optimization failed: found pages without a React Component as default export
```
➜ [Jump to Solution](#build-fails)

```
FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed
```
➜ [Jump to Solution](#memory-errors-during-build)

### TypeScript Errors
```
TS2307: Cannot find module '@/components/X' or its corresponding type declarations
```
➜ [Jump to Solution](#import-errors)

```
TS2322: Type 'X' is not assignable to type 'Y'
```
➜ [Jump to Solution](#type-assignment-errors)

### Database Errors
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
➜ [Jump to Solution](#cannot-connect-to-database)

```
Error: The migration is missing from the database
```
➜ [Jump to Solution](#migration-errors)

### Authentication Errors
```
[next-auth][error][OAUTH_CALLBACK_ERROR]
```
➜ [Jump to Solution](#oauth-callback-failed)

```
Error: No authorization token was found
```
➜ [Jump to Solution](#jwt-issues)

## 🚑 Emergency Recovery

### When Nothing Works
1. [Complete System Reset](#complete-reset-procedure)
2. [Database Reset](#database-reset-procedure)
3. [Clean Environment Setup](#environment-setup-fails)

### Before Asking for Help
1. Collect error messages
2. Note steps already tried
3. Gather environment info:
   ```bash
   node --version
   pnpm --version
   git --version
   psql --version
   ```
4. Check logs:
   ```bash
   # Next.js logs
   cat .next/logs/error.log
   
   # PostgreSQL logs
   # Windows
   type "C:\Program Files\PostgreSQL\14\data\log\postgresql-2025-09-01.log"
   # Mac
   cat /usr/local/var/log/postgres.log
   ```

## 🔄 Preventive Measures

### Daily Checks
```bash
# 1. Update dependencies
pnpm update

# 2. Check types
pnpm type-check

# 3. Run tests
pnpm test

# 4. Verify database
pnpm prisma studio

# 5. Check build
pnpm build
```

### Weekly Maintenance
```bash
# 1. Clean unused dependencies
pnpm store prune

# 2. Update Node.js
volta install node@latest

# 3. Backup database
pg_dump -U postgres everesthood > backup.sql

# 4. Clear caches
rm -rf .next
rm -rf node_modules/.cache
```

## 📱 Platform-Specific Solutions

### Windows
- [Windows Setup Guide](#windows-specific-setup)
- [Windows Permission Issues](#windows-permission-fixes)
- [Windows Path Problems](#windows-path-solutions)

### Mac
- [Mac Setup Guide](#mac-specific-setup)
- [Mac Permission Issues](#mac-permission-fixes)
- [Mac Path Problems](#mac-path-solutions)

### Linux
- [Linux Setup Guide](#linux-specific-setup)
- [Linux Permission Issues](#linux-permission-fixes)
- [Linux Path Problems](#linux-path-solutions)

## 🎯 Quick Solutions for Common Scenarios

### First-Time Setup
```bash
# 1. Install tools
volta install node@18
volta install pnpm@8

# 2. Clone and setup
git clone https://github.com/sprasains/everesthood.git
cd everesthood
pnpm install

# 3. Environment setup
cp .env.example .env.local
# Edit .env.local with your values

# 4. Database setup
pnpm prisma generate
pnpm prisma db push
pnpm prisma db seed

# 5. Start development
pnpm dev
```

### Daily Development Issues
```bash
# 1. Pull latest changes
git pull origin main

# 2. Update dependencies
pnpm install

# 3. Reset if needed
pnpm reset-dev

# 4. Start development
pnpm dev
```

### Production Deployment Issues
```bash
# 1. Verify production build
pnpm build

# 2. Check for errors
pnpm lint
pnpm test

# 3. Test production locally
pnpm start

# 4. Deploy
pnpm deploy
```

## 📊 Status Verification

### System Health Check
```bash
# 1. Check Node.js
node --version

# 2. Check PNPM
pnpm --version

# 3. Check PostgreSQL
psql --version

# 4. Check Next.js
pnpm next --version

# 5. Check TypeScript
pnpm tsc --version
```

### Project Health Check
```bash
# 1. Dependency status
pnpm audit

# 2. Type check
pnpm type-check

# 3. Lint check
pnpm lint

# 4. Test status
pnpm test

# 5. Build check
pnpm build
```

Remember: Always read error messages carefully and try the simplest solution first. If you're stuck, our community is here to help!
