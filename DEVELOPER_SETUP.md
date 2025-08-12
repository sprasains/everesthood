# 🛠️ Everhood Developer Setup Guide

## 🚦 Local Setup (No Docker)

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Git](https://git-scm.com/)
- [Homebrew](https://brew.sh/) (macOS only)
- [Postgres](https://www.postgresql.org/download/)
- [Redis](https://redis.io/docs/getting-started/installation/)

### 1. Install Postgres & Redis (macOS example)
```sh
brew install postgresql
brew services start postgresql
brew install redis
brew services start redis
```

### 2. Clone the repo & install dependencies
```sh
git clone <your-repo-url>
cd everesthood
npm install
```

### 3. Setup environment variables
```sh
cp .env.example .env
# Fill in all required secrets in .env
```

### 4. Setup database
```sh
npx prisma migrate dev
npx prisma db seed
```

### 5. Start the app
```sh
npm run dev
```
### 6. Worker Service (Required for LLM/AI Jobs)
- The worker in `worker/index.js` now processes real agent jobs using BullMQ and Prisma.
- It dynamically loads agent modules from `src/agents/`, merges credentials, and updates job status in the database.
- To run the worker, open a new terminal and run:
  ```sh
  cd worker
  npm install bullmq ioredis prisma @prisma/client pino
  node index.js
  ```
- If you do not run the worker, LLM jobs (AI code generation, summaries, etc.) will not work locally.
- See the "Advanced Agent Infrastructure" and "Monitoring" sections below for more details.

### Troubleshooting
- If you see errors about Redis or Postgres, make sure both are running.
- If you see errors about the worker, see above.
- For more help, see [Redis Quickstart](https://redis.io/docs/getting-started/installation/) and [Postgres Quickstart](https://www.postgresql.org/download/).

### First Run Checklist
- [ ] Install Node.js, Git, Redis, Postgres
- [ ] Copy `.env.example` to `.env` and fill in all secrets
- [ ] Start Redis and Postgres
- [ ] Run `npm install`
- [ ] Run `npx prisma migrate dev` and `npx prisma db seed`
- [ ] Start the worker (if present)
- [ ] Run `npm run dev` to start the app

---

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

## ⏰ Running the Agent Scheduler

The scheduler runs agent jobs on a schedule (every minute by default).

```bash
node src/scheduler/index.ts
```
- Uses cron and Redlock for reliability.
- Only one instance will enqueue jobs at a time.

---

## 📊 Bull-Board Dashboard (Job Monitoring)

To monitor agent jobs:

```bash
node bull-board-server.js
```

Visit [http://localhost:3009/admin/queues](http://localhost:3009/admin/queues)

---

## 📋 Structured Logging

The worker uses [pino](https://getpino.io/) for logs. Logs include job IDs, agent names, user IDs, and errors. Set log level with `LOG_LEVEL` in your .env.

---

## 🤖 Advanced Agent Infrastructure

- **Dynamic Agent Registry:** Add new agents by creating files in `src/agents/` (see `exampleAgent.ts`, `enterpriseDataAnalyst.ts`).
- **Credential Handling:** AgentTemplate defines required credentials; users provide them when creating AgentInstances. Credentials are merged (instance → template → env) and used securely by the worker.
- **Job API:** The API at `app/api/v1/agents/run/route.ts` authenticates, creates an AgentRun, and enqueues a job.
- **Worker:** `worker/index.js` loads the correct agent, merges credentials, runs the job, and updates status/output.
- **Scheduler:** `src/scheduler/index.ts` runs scheduled jobs using cron and Redlock (see below).

---

## 🧑‍💻 How the Worker Service & Queue Work (Layman's Guide)

### What is the Worker Service?
The worker is a background process that handles heavy/slow AI jobs (like LLM code generation or summaries) so your main app stays fast and responsive. It listens for jobs on a queue (in Redis), processes them, and saves the results to the database.

### How Does It All Work Together?

1. **User triggers an AI action** (e.g., generate summary) in the web app.
2. **The app adds a job** to a queue in Redis (using BullMQ).
3. **The worker process** (in `worker/index.js`) listens for new jobs on that queue.
4. **When a job arrives**, the worker processes it (calls OpenAI/Gemini, etc.).
5. **The worker saves the result** (e.g., summary text) to the database.
6. **The app fetches the result** and shows it to the user.

### Visual Diagram
```
[User] → [Web App/API] → [Redis Queue] → [Worker] → [Database] → [Web App]
```

### Why Use This Pattern?
- **Keeps the web app fast:** Heavy AI work doesn't block user requests.
- **Scalable:** Add more workers for more jobs.
- **Reliable:** Jobs are retried if they fail, and not lost if the server restarts.

### Pros & Cons
**Pros:**
- Decouples slow work from the UI
- Scalable and robust (handles retries, failures)
- Easy to monitor and debug jobs

**Cons:**
- More moving parts (need Redis, worker process)
- Slightly more complex to set up and debug
- Need to keep job schema in sync between app and worker

### How to Run the Worker
1. Open a new terminal in the `worker/` directory.
2. Install dependencies:
   ```sh
   npm install bullmq ioredis prisma @prisma/client
   ```
3. Start the worker:
   ```sh
   node index.js
   ```
4. The worker will log jobs as it processes them.

### How to Extend the Worker
- Edit `worker/index.js` to add new job types or integrate real LLM APIs (see code comments).
- Update the Prisma model if you want to store more job info/results.
- Use BullMQ features like repeatable jobs, rate limiting, and concurrency for advanced needs.

### Where to Look for Examples
- See the full, annotated BullMQ worker in `worker/index.js` (with layman explanations).
- See the "Advanced Worker Service Setup & Examples" section below for more code samples.

---

## 🧑‍💻 Advanced Worker Service Setup & Examples

The Everesthood app uses a background worker to process LLM/AI jobs (e.g., code generation, summaries) via a Redis-backed queue. For robust, production-grade job processing, use [BullMQ](https://docs.bullmq.io/) (already installed) and [Prisma](https://www.prisma.io/) for DB updates.

### 1. Install Required Packages

In the `worker/` directory:
```sh
npm install bullmq ioredis prisma @prisma/client
```

### 2. Example: BullMQ Worker Template

Create or update `worker/index.js`:
```js
// worker/index.js
const { Worker, Queue } = require('bullmq');
const IORedis = require('ioredis');
const { PrismaClient } = require('@prisma/client');

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');
const prisma = new PrismaClient();

// Define the queue name (must match the producer)
const queueName = 'llm-jobs';

// Example job processor
const processor = async (job) => {
  console.log('Processing job:', job.id, job.name, job.data);
  // Simulate LLM API call (replace with real OpenAI/Gemini logic)
  const result = `Simulated LLM result for prompt: ${job.data.prompt}`;
  // Optionally update DB with result
  await prisma.llmJob.update({
    where: { id: job.data.dbId },
    data: { status: 'completed', result },
  });
  return result;
};

// Start the worker
const worker = new Worker(queueName, processor, { connection });

worker.on('completed', (job, result) => {
  console.log(`Job ${job.id} completed:`, result);
});
worker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err);
});

console.log(`Worker started for queue: ${queueName}`);
```

### 3. Example: Adding Jobs to the Queue (Producer)

In your app (e.g., API route or service):
```js
const { Queue } = require('bullmq');
const IORedis = require('ioredis');
const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');
const queue = new Queue('llm-jobs', { connection });

// Add a job
await queue.add('generate-summary', {
  prompt: 'Summarize this text...',
  dbId: 123, // Reference to DB row
});
```

### 4. Example: LLM API Integration (OpenAI/Gemini)

Replace the simulated logic in the worker with real API calls:
```js
const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const processor = async (job) => {
  const { prompt, dbId } = job.data;
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
  });
  const result = response.choices[0].message.content;
  await prisma.llmJob.update({ where: { id: dbId }, data: { status: 'completed', result } });
  return result;
};
```

### 5. Example: Prisma Model for LLM Jobs

Add to `prisma/schema.prisma`:
```prisma
model LlmJob {
  id        Int      @id @default(autoincrement())
  prompt   String
  result   String?
  status   String   @default("pending")
  createdAt DateTime @default(now())
}
```
Then run:
```sh
npx prisma migrate dev
```

### 6. Extending the Worker
- Add new job types by changing the job name (e.g., `queue.add('summarize', {...})`) and branching logic in the worker's processor.
- Use BullMQ's repeatable jobs, rate limiting, and concurrency for advanced use cases.
- See [BullMQ docs](https://docs.bullmq.io/) for more features.

### 7. Monitoring & Debugging
- Use [Arena](https://github.com/bee-queue/arena) or [Bull Board](https://github.com/vcapretz/bull-board) for a web UI to monitor jobs.
- Log job events in the worker for troubleshooting.