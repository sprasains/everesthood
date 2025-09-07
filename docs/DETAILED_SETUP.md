# 🛠️ Detailed Installation & Setup Guide

## Detailed Installation Steps

### Windows Installation

#### 1. Node.js Installation
1. Open your web browser and go to https://nodejs.org
2. Click the "LTS" (Long Term Support) download button
3. Once downloaded, double-click the file (it will be named like `node-v18.x.x-x64.msi`)
4. In the installer:
   - Click "Next"
   - Check "I accept the terms..."
   - Click "Next"
   - Keep the default location (usually `C:\Program Files\nodejs`)
   - Click "Next"
   - Keep all default features selected
   - Click "Next"
   - Click "Install"
   - If Windows asks "Do you want to allow...", click "Yes"
5. Verify installation:
   - Press `Windows + R`
   - Type `powershell` and press Enter
   - In PowerShell, type:
   ```powershell
   node --version
   npm --version
   ```
   You should see version numbers, not errors

#### 2. PNPM Installation
1. Open PowerShell as Administrator:
   - Press `Windows + X`
   - Click "Windows PowerShell (Admin)" or "Terminal (Admin)"
2. Copy and paste this command:
   ```powershell
   iwr https://get.pnpm.io/install.ps1 -useb | iex
   ```
3. Close PowerShell and open a new one
4. Verify by typing:
   ```powershell
   pnpm --version
   ```

#### 3. PostgreSQL Installation
1. Go to https://www.postgresql.org/download/windows/
2. Click "Download the installer"
3. Download the latest version for Windows
4. Run the installer:
   - Click "Next"
   - Keep default installation folder
   - Keep all components selected
   - Keep default data location
   - **IMPORTANT**: Remember the password you set for the postgres user!
   - Keep default port (5432)
   - Keep default locale
5. On the final screen, uncheck "Stack Builder"
6. Click "Finish"

### Mac Installation

#### 1. Homebrew Installation
1. Open Terminal (Press `Cmd + Space`, type "terminal")
2. Install Homebrew:
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```
3. Follow any instructions in the terminal about adding Homebrew to your PATH

#### 2. Node.js and PNPM
```bash
# Install Node.js
brew install node

# Install PNPM
brew install pnpm

# Verify installations
node --version
pnpm --version
```

#### 3. PostgreSQL
```bash
# Install PostgreSQL
brew install postgresql@14

# Start PostgreSQL
brew services start postgresql@14

# Verify installation
psql --version
```

## Database Setup

### 1. Create Database

#### Windows:
1. Open Command Prompt as Administrator
2. Log into PostgreSQL:
   ```cmd
   psql -U postgres
   ```
   - When prompted for password, enter the one you set during installation
3. Create database:
   ```sql
   CREATE DATABASE everesthood;
   ```
4. Verify database creation:
   ```sql
   \l
   ```
   You should see 'everesthood' in the list
5. Exit psql:
   ```sql
   \q
   ```

#### Mac:
```bash
# Create database
createdb everesthood

# Verify creation
psql -l
```

### 2. Database Migration Setup
1. Open your project in VS Code
2. Open terminal (`` Ctrl + ` ``)
3. Generate Prisma client:
   ```bash
   pnpm prisma generate
   ```
4. Create database tables:
   ```bash
   pnpm prisma db push
   ```
5. Verify database setup:
   ```bash
   pnpm prisma studio
   ```
   This should open a browser window showing your database structure

### 3. Seed Initial Data
```bash
# Run all seeds
pnpm prisma db seed

# Verify data
pnpm prisma studio
```

## Environment Configuration

### 1. Create Environment Files

Create a file named `.env.local` in your project root:

```env
# Database connection (replace USER and PASSWORD with your values)
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/everesthood"

# Authentication (replace with your own random string)
NEXTAUTH_SECRET="generate-a-random-string-here"
NEXTAUTH_URL="http://localhost:3000"

# Redis configuration (if using local Redis)
REDIS_URL="redis://localhost:6379"

# API Keys (replace with your values if using these services)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""

# File Storage (if using AWS S3)
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_REGION=""
S3_BUCKET_NAME=""
```

### 2. Environment Variables Check
Run this command to verify your environment:
```bash
pnpm check-env
```

### 3. Local Development Settings
Create a file named `.env.development` for development-specific settings:
```env
# Development settings
NODE_ENV="development"
DEBUG="app:*"
LOG_LEVEL="debug"
```

## Common Problems and Solutions

### Database Connection Issues

#### Error: Could not connect to database
1. Check if PostgreSQL is running:
   ```bash
   # Windows
   net start postgresql-x64-14

   # Mac
   brew services list
   ```

2. Verify connection details:
   ```bash
   # Test connection
   psql -U postgres -h localhost -p 5432 everesthood
   ```

3. Common solutions:
   - Check if password in `.env.local` matches PostgreSQL password
   - Make sure PostgreSQL is running on port 5432
   - Try restarting PostgreSQL:
     ```bash
     # Windows
     net stop postgresql-x64-14
     net start postgresql-x64-14

     # Mac
     brew services restart postgresql
     ```

#### Error: Database "everesthood" does not exist
```sql
# Log into PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE everesthood;

# Verify
\l
```

### PNPM Issues

#### Error: Command not found: pnpm
1. Reinstall PNPM:
   ```bash
   # Windows (PowerShell Admin)
   iwr https://get.pnpm.io/install.ps1 -useb | iex

   # Mac
   brew reinstall pnpm
   ```

2. Add to PATH (Windows):
   ```powershell
   $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH","User")
   ```

#### Error: pnpm install fails
1. Clear PNPM cache:
   ```bash
   pnpm store prune
   ```

2. Delete node_modules and try again:
   ```bash
   rm -rf node_modules
   pnpm install
   ```

### Node.js Issues

#### Error: Node version not compatible
1. Install correct version:
   ```bash
   # Using volta (recommended)
   volta install node@18

   # Or using nvm
   nvm install 18
   nvm use 18
   ```

2. Verify version:
   ```bash
   node --version
   # Should show v18.x.x
   ```

### Environment Issues

#### Error: Environment variables not loading
1. Check file names:
   - `.env.local` should be in project root
   - No spaces in file name
   - Hidden files visible

2. Verify format:
   - No spaces around `=`
   - Values in quotes
   - No trailing spaces

3. Reload environment:
   ```bash
   # Close and reopen terminal, then
   pnpm dev
   ```

### Build Issues

#### Error: Build fails
1. Clear build cache:
   ```bash
   # Remove build artifacts
   rm -rf .next
   
   # Clear Next.js cache
   pnpm next clean
   ```

2. Rebuild:
   ```bash
   pnpm build
   ```

#### Error: TypeScript errors
1. Check types:
   ```bash
   pnpm type-check
   ```

2. Update TypeScript:
   ```bash
   pnpm add -D typescript@latest
   ```

### Quick Fixes

#### Project won't start
```bash
# 1. Kill all Node processes
taskkill /F /IM node.exe /T  # Windows
pkill node  # Mac

# 2. Clear all caches
pnpm clear-all

# 3. Fresh install
rm -rf node_modules
pnpm install

# 4. Start fresh
pnpm dev
```

#### Database reset
```bash
# 1. Drop database
psql -U postgres -c "DROP DATABASE everesthood;"

# 2. Create fresh database
psql -U postgres -c "CREATE DATABASE everesthood;"

# 3. Push schema
pnpm prisma db push

# 4. Seed data
pnpm prisma db seed
```

## Verification Steps

### 1. Check Installation
```bash
# Check all tools
node --version  # Should be 18.x.x
pnpm --version  # Should be 8.x.x
psql --version  # Should be 14.x

# Check database
psql -U postgres -c "\l" | grep everesthood
```

### 2. Check Project
```bash
# Build project
pnpm build

# Run tests
pnpm test

# Check types
pnpm type-check
```

### 3. Check Services
```bash
# Check database connection
pnpm prisma studio

# Check development server
pnpm dev
# Visit http://localhost:3000
```

Remember: If you're stuck, don't hesitate to ask for help! Save any error messages you see - they'll help us help you faster.
