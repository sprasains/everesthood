# 🛠️ Everhood Developer Setup Guide

## 📋 Prerequisites

Before you start, make sure you have the following installed on your computer:

### Required Software
- **Node.js** (version 18 or higher) - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)
- **Docker** (optional but recommended) - [Download here](https://www.docker.com/)
- **VS Code** (recommended editor) - [Download here](https://code.visualstudio.com/)

### Check Your Installations
Open your terminal/command prompt and run:
```bash
node --version  # Should be 18.x or higher
npm --version   # Should be 9.x or higher
git --version   # Should be 2.x or higher
docker --version # Should be 20.x or higher (if using Docker)
```

---

## 🚀 Step-by-Step Setup

### Step 1: Clone the Repository
1. **Open your terminal/command prompt**
2. **Navigate to where you want to store the project:**
   ```bash
   cd /path/to/your/projects
   ```
3. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/everhood.git
   cd everhood
   ```

### Step 2: Install Dependencies
1. **Install Node.js packages:**
   ```bash
   npm install
   ```
2. **Wait for installation to complete** (this may take a few minutes)

### Step 3: Set Up Environment Variables
1. **Copy the example environment file:**
   ```bash
   cp .env.example .env.local
   ```
2. **Open the `.env.local` file** in your text editor
3. **Fill in the required values** (see Environment Variables section below)

### Step 4: Set Up Database

#### Option A: Using Docker (Recommended)
1. **Start PostgreSQL and Redis with Docker:**
   ```bash
   docker-compose up -d postgres redis
   ```
2. **Wait for services to start** (check with `docker-compose ps`)

#### Option B: Local Installation
1. **Install PostgreSQL:**
   - **macOS:** `brew install postgresql && brew services start postgresql`
   - **Windows:** Download from [postgresql.org](https://www.postgresql.org/download/windows/)
   - **Linux:** `sudo apt-get install postgresql postgresql-contrib`

2. **Install Redis:**
   - **macOS:** `brew install redis && brew services start redis`
   - **Windows:** Download from [redis.io](https://redis.io/download)
   - **Linux:** `sudo apt-get install redis-server`

### Step 5: Set Up Database Schema
1. **Generate Prisma client:**
   ```bash
   npx prisma generate
   ```
2. **Run database migrations:**
   ```bash
   npx prisma migrate dev
   ```
3. **Seed the database with initial data:**
   ```bash
   npx prisma db seed
   ```

### Step 6: Start the Development Server
1. **Start the development server:**
   ```bash
   npm run dev
   ```
2. **Open your browser** and go to `http://localhost:3000`
3. **You should see the Everhood application running!**

---

## 🔧 Environment Variables

### Required Variables
Create a `.env.local` file in the root directory with these variables:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/everesthood"

# Redis (for caching and job queues)
REDIS_URL="redis://localhost:6379"

# NextAuth (authentication)
NEXTAUTH_SECRET="your-super-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# OAuth Providers (optional for development)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# AI Services (optional for development)
OPENAI_API_KEY="your-openai-api-key"
GOOGLE_AI_API_KEY="your-google-ai-api-key"

# Stripe (for payments - optional for development)
STRIPE_SECRET_KEY="your-stripe-secret-key"
STRIPE_PUBLISHABLE_KEY="your-stripe-publishable-key"
STRIPE_WEBHOOK_SECRET="your-stripe-webhook-secret"

# Email (optional for development)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Feature Flags
BYPASS_REDIS="true"  # Set to false to use real Redis
```

### Getting API Keys

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Add `http://localhost:3000/api/auth/callback/google` to authorized redirect URIs

#### GitHub OAuth
1. Go to [GitHub Settings → Developer settings → OAuth Apps](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Add `http://localhost:3000/api/auth/callback/github` to callback URL

#### OpenAI API
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an account and get your API key
3. Add billing information (required for API usage)

#### Stripe
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Create an account and get your API keys
3. Set up webhooks for payment processing

---

## 🧪 Testing Your Setup

### Run Tests
1. **Run all tests:**
   ```bash
   npm test
   ```

2. **Run end-to-end tests:**
   ```bash
   npm run test:e2e
   ```

3. **Run tests in watch mode:**
   ```bash
   npm run test:watch
   ```

### Check Database Connection
1. **Open Prisma Studio:**
   ```bash
   npx prisma studio
   ```
2. **This opens a web interface** at `http://localhost:5555`
3. **Browse your database tables** to verify everything is working

### Test API Endpoints
1. **Start the development server** (`npm run dev`)
2. **Visit** `http://localhost:3000/api/health`
3. **You should see a JSON response** indicating the API is working

---

## 🐛 Common Issues and Solutions

### "Module not found" errors
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Database connection issues
```bash
# Check if PostgreSQL is running
docker-compose ps

# Restart database services
docker-compose restart postgres redis

# Reset database (WARNING: This deletes all data)
npx prisma migrate reset
```

### Port already in use
```bash
# Find what's using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use a different port
npm run dev -- -p 3001
```

### Prisma errors
```bash
# Regenerate Prisma client
npx prisma generate

# Reset database and run migrations
npx prisma migrate reset
npx prisma migrate dev
```

---

## 📁 Project Structure

```
everhood/
├── app/                    # Next.js 14 App Router
│   ├── api/               # API routes
│   ├── components/        # Reusable UI components
│   ├── dashboard/         # Dashboard pages
│   ├── agents/            # AI agents pages
│   ├── jobs/              # Job board pages
│   └── ...                # Other feature pages
├── lib/                   # Shared utilities
├── prisma/                # Database schema and migrations
├── src/                   # Source code
│   ├── agents/            # Agent logic
│   ├── tests/             # Test files
│   └── types/             # TypeScript types
├── public/                # Static assets
└── migrations/            # Database migrations
```

---

## 🚀 Development Workflow

### Making Changes
1. **Create a new branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** in the code

3. **Test your changes:**
   ```bash
   npm test
   npm run lint
   ```

4. **Commit your changes:**
   ```bash
   git add .
   git commit -m "Add your feature description"
   ```

5. **Push to GitHub:**
   ```bash
   git push origin feature/your-feature-name
   ```

### Code Quality Tools
1. **Linting:**
   ```bash
   npm run lint
   ```

2. **Type checking:**
   ```bash
   npm run type-check
   ```

3. **Format code:**
   ```bash
   npm run format
   ```

4. **Fix common issues:**
   ```bash
   npm run fix:all
   ```

---

## 🐳 Docker Development

### Using Docker Compose
1. **Start all services:**
   ```bash
   docker-compose up -d
   ```

2. **View logs:**
   ```bash
   docker-compose logs -f
   ```

3. **Stop services:**
   ```bash
   docker-compose down
   ```

### Building Docker Image
```bash
# Build the image
docker build -t everhood .

# Run the container
docker run -p 3000:3000 everhood
```

---

## 📚 Useful Commands

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript check
```

### Database
```bash
npx prisma studio    # Open database GUI
npx prisma migrate dev    # Run migrations
npx prisma generate  # Generate Prisma client
npx prisma db seed   # Seed database
```

### Testing
```bash
npm test             # Run all tests
npm run test:e2e     # Run end-to-end tests
npm run test:watch   # Run tests in watch mode
```

### Utilities
```bash
npm run fix:all      # Fix common code issues
npm run format       # Format code with Prettier
npm run clean        # Clean build artifacts
```

---

## 🔍 Debugging

### VS Code Debugging
1. **Open VS Code** in the project directory
2. **Go to Run and Debug** (Ctrl+Shift+D)
3. **Select "Next.js: debug server-side"**
4. **Press F5** to start debugging

### Browser Debugging
1. **Open browser developer tools** (F12)
2. **Go to Console tab** to see errors
3. **Go to Network tab** to see API calls
4. **Go to Sources tab** to set breakpoints

### Database Debugging
1. **Use Prisma Studio:**
   ```bash
   npx prisma studio
   ```
2. **Check database logs:**
   ```bash
   docker-compose logs postgres
   ```

---

## 📞 Getting Help

### Documentation
- **README.md** - Main project documentation
- **USER_GUIDE.md** - User-facing documentation
- **TECHNICAL_GUIDE.md** - Technical architecture details

### Community
- **GitHub Issues** - Report bugs and request features
- **Discord** - Join the community chat
- **Email** - Contact the development team

### Common Resources
- **Next.js Documentation** - [nextjs.org/docs](https://nextjs.org/docs)
- **Prisma Documentation** - [prisma.io/docs](https://prisma.io/docs)
- **MUI Documentation** - [mui.com](https://mui.com)
- **TypeScript Documentation** - [typescriptlang.org/docs](https://typescriptlang.org/docs)

---

## 🎉 You're Ready!

Your development environment is now set up and ready to go! Here's what you can do next:

1. **Explore the codebase** - Start with `app/page.tsx` and work your way through
2. **Try the features** - Test the AI agents, job board, and social features
3. **Make your first change** - Try adding a new feature or fixing a bug
4. **Join the community** - Connect with other developers working on the project

**Happy coding! 🚀** 