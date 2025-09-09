
<!--
Why this doc exists: This README provides a quick start, system overview, and feature catalog for developers and users. It is kept in sync with code and guides all local setup, troubleshooting, and feature verification.
-->

## Verification Checklist
- [ ] Can run local setup and see dashboard at http://localhost:3000
- [ ] Can view usage graph on billing page
- [ ] Can run worker and see jobs processed
- [ ] All referenced file paths exist
- [ ] All commands and links are valid

# 🏔️ EverestHood/AgentForge Overview

> **Layman:** A digital assistant factory—create, schedule, and run smart agents to automate your work and life.
> **Business:** A SaaS platform for scalable, reliable automation, social learning, and creator monetization, supporting both on-demand and scheduled workflows.
> **Technical:** A Dockerized, full-stack system with unified job queueing, modular agent logic, robust scheduling, and modern cloud infrastructure.

---

## System Diagram

```mermaid
graph TD;
  User["User"] --> API["API"]
  API --> Queue["Redis Queue"]
  Scheduler["Scheduler"] --> Queue
  Queue --> Worker["Worker"]
  Worker --> Agent["Agent Logic"]
  Worker --> DB["Database"]
  API --> DB
  API --> Redis
```

---

## Business Value

- **All-in-one social, learning, and productivity hub for Gen-Z**
- **AI-powered insights and automation for career and life**
- **Personalized news and content curation system**
- **Gamified engagement and community building**
- **Monetization for creators and influencers**
- **Premium SaaS model with clear upgrade paths**
- **Usage-based billing with interactive usage graph for transparency**

---
---

# 🛠️ DX Automation Fixers

## Available Fix Scripts

- `fix:missing-env` — Verifies `.env` against `required-env.json`, prints missing. Report: `tmp/reports/fix-missing-env.json`
- `fix:imports` — Organizes and dedupes imports in all code files. Report: `tmp/reports/fix-imports.json`
- `fix:dead-code` — Reports unused exports/files using `ts-prune`. Report: `tmp/reports/fix-dead-code.json`
- `fix:routes` — Checks API/file co-location and missing handlers. Report: `tmp/reports/fix-routes.json`

## Usage

Run any fixer with:

```sh
npm run fix:missing-env
npm run fix:imports
npm run fix:dead-code
npm run fix:routes
```

Each fixer writes a report under `tmp/reports` with file paths and suggested patches.
# 🌟 Everhood - AI Vibe Hub for Gen-Z


### Quick Start Runbook
- Clone repo, install dependencies, set up .env
- Run `npx prisma migrate dev` and `npx prisma db seed`
- Start app: `npm run dev`
- Start worker: `cd worker && node index.js`
- Visit http://localhost:3000 and verify dashboard, billing usage graph, and agent jobs

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

---

## 🚀 Overview
Everhood is a next-generation social and productivity platform designed for Gen-Z and young professionals. It combines AI-powered insights, gamified learning, career tools, and a vibrant social community—all in one place.

---

## ⚡️ Tech Stack Quick Start

### 🟥 Redis (Caching, Queues)
- **Local (Recommended for Dev):**
  - With Docker:
    ```sh
    docker run --name everesthood-redis -p 6379:6379 -d redis
    ```
  - With Homebrew (macOS):
    ```sh
    brew install redis
    brew services start redis
    ```
  - Set in `.env`:
    ```env
    REDIS_URL=redis://localhost:6379
    ```
- **Cloud (Production/Remote):**
  - Use a service like [Upstash](https://upstash.com/) or [Redis Cloud](https://redis.com/redis-enterprise-cloud/)
  - Set in `.env`:
    ```env
    REDIS_URL=rediss://<your-cloud-redis-url>
    ```

### 🟦 Postgres (Database)
- **Local:**
  - With Docker:
    ```sh
    docker run --name everesthood-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres
    ```
  - With Homebrew (macOS):
    ```sh
    brew install postgresql
    brew services start postgresql
    ```
  - Set in `.env`:
    ```env
    DATABASE_URL=postgresql://postgres:postgres@localhost:5432/everesthood
    ```
- **Cloud:**
  - Use [Supabase](https://supabase.com/), [Neon](https://neon.tech/), or AWS RDS.
  - Set in `.env` with your cloud DB URL.

### ⚡️ Next.js (Frontend/Backend)
- **Dev:**
  - Start dev server:
    ```sh
    npm run dev
    ```
- **Build:**
    ```sh
    npm run build
    npm start
    ```

### 🟣 Prisma (ORM)
- **Migrate DB:**
    ```sh
    npx prisma migrate dev
    ```
- **Generate Types:**
    ```sh
    npx prisma generate
    ```

### 🐳 Docker (All-in-One)
- **Start all services:**
    ```sh
    docker-compose up -d
    ```
- **Stop all services:**
    ```sh
    docker-compose down
    ```

### 🗝️ .env Example
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/everesthood
REDIS_URL=redis://localhost:6379
NEXTAUTH_SECRET=your-secret
...
```

---

## 🏆 Key Features

### 🎯 Core Platform
- **AI-Powered Summaries:** Personalized content summaries with 4 unique AI personas (ZenGPT, HustleBot, DataDaddy, CoachAda)
- **Gen-Z Content Curation:** Real-time feeds from Hypebeast, The Tab, Dazed, Nylon, and more
- **Gamified Learning:** XP system, streaks, achievements, and leaderboards
- **Social Community:** Discord-style social features, friend system, circles, and threaded comments
- **Premium Subscription:** Stripe-powered freemium model with trials and creator monetization
- **Job Board:** Curated AI/tech jobs, company profiles, and easy application flow
- **Resume Vibe Check:** AI-powered resume analysis and feedback
- **Profile Spotlight & Tipping:** Microtransactions for visibility and creator support
- **Family, Money, Health, Productivity:** Life simplification modules for holistic growth

### 🤖 AI Personas
- **ZenGPT:** Calm, mindful AI guide for balanced insights
- **HustleBot:** High-energy startup mentor for growth focus
- **DataDaddy:** Analytical insights master with data-driven perspectives
- **CoachAda:** Supportive career coach for professional development

### 🧩 Integration & Modules
- **Dashboard:** Command center with widgets for community, jobs, streaks, and more
- **Debug & Troubleshooting:** Comprehensive debugging system with health monitoring, API testing, database tools, and performance analytics
- **News & Content Curation:** Personalized news feeds, RSS aggregation, AI recommendations, and content curation
- **Opportunities:** Career, jobs, and resume tools
- **Achievements:** Track progress, unlock badges, and compete on leaderboards
- **Family & Money:** Budgeting, bills, events, and family management
- **Productivity Hub:** Tasks, digital detox, and journaling

---

## 📚 Usage Guide

### Quick Start
1. **Sign Up:** Create an account with Google, GitHub, or email
2. **Complete Profile:** Add your interests, skills, and goals
3. **Explore Dashboard:** Access news, jobs, achievements, and more
4. **Connect:** Add friends, join circles, and participate in discussions
5. **Level Up:** Earn XP, unlock achievements, and climb leaderboards
6. **Upgrade:** Try premium for advanced AI, analytics, and creator tools

### Ways to Use
- **Career Growth:** Use AI summaries, job board, and resume checker
- **Stay Informed:** Personalized news feeds, content curation, and AI-powered recommendations
- **Learning:** Follow trending news, unlock achievements, and join discussions
- **Networking:** Add friends, join circles, and collaborate
- **Monetization:** Become a creator, receive tips, and unlock premium features
- **Wellness:** Track mood, join digital detox, and manage life events

---

- **Authentication:** NextAuth.js, social login, JWT/session
- **AI Engine:** Google Gemini Pro, OpenAI
- **News & Content Curation:** RSS aggregation, personalized feeds, AI recommendations, content curation tools
- **Posts & Comments:** Rich text, mentions, likes, threaded replies
- **Friends & Circles:** Social graph, friend requests, circles
- **Achievements & Badges:** XP, streaks, badges, leaderboards
- **Jobs & Companies:** Curated jobs, company profiles, applications
- **Payments:** Stripe integration, tipping, subscriptions
- **Usage-based Billing:** Interactive usage graph on billing page
- **Resume Tools:** AI resume analysis
- **Family & Money:** Budgets, bills, events, subscriptions
- **Productivity:** Tasks, digital detox, journaling
- **Notifications:** Real-time, for all major events
- **Admin & Moderation:** Reports, blocks, moderation tools

---

## 💡 Ideas & Creativity
- **Custom AI Personas:** Build your own AI assistant for unique insights
- **Content Creation:** Share posts, guides, and resources with the community
- **News Curation:** Discover, curate, and share relevant news and content
- **Career Showcases:** Highlight achievements, projects, and skills
- **Collaborative Circles:** Create private or public circles for focused discussions
- **Hackathons & Challenges:** Compete in platform-wide events

---

## Feature Index
For a detailed overview of feature implementation status and verification steps, see:
- [FEATURES.json](./FEATURES.json) - Canonical feature definitions
- [PARITY_REPORT.md](./PARITY_REPORT.md) - Implementation status and gaps

### Quick Feature Status
- ✅ Authentication System (OAuth, email/password)
- 🟡 AI Agent Templates (templating, job queue)
- ✅ Social Core Features (profiles, friends, posts)
- ✅ News & Content Curation (personalized feeds, RSS, AI recommendations)
- ✅ Job Board & Career Tools
- 🟡 Usage-based Billing (metered usage, Stripe)
- ✅ Achievements & Gamification

### Feature Documentation
- Detailed feature specs: [FEATURE_DOCUMENTATION.md](./FEATURE_DOCUMENTATION.md)
- User guide: [USER_GUIDE.md](./USER_GUIDE.md)
- Technical overview: [TECHNICAL_GUIDE.md](./TECHNICAL_GUIDE.md)
- System architecture: [SYSTEM_OVERVIEW.md](./SYSTEM_OVERVIEW.md)

---

## 🧠 Knowledge & Learning
- **AI Summaries:** Stay updated with digestible, persona-driven content
- **News & Content Curation:** Personalized news feeds with AI-powered recommendations
- **Guides & Tutorials:** Access and contribute to a growing library of guides
- **Community Wisdom:** Learn from peers, mentors, and creators
- **Analytics:** Track your growth, engagement, and learning progress

---

## 🎯 Target Audience
- Gen-Z students and young professionals
- Content creators and influencers
- Career switchers and job seekers
- AI/tech enthusiasts
- Anyone seeking a vibrant, gamified, and AI-powered social platform

---

## 💸 Pricing & Tiers

| Tier      | Price      | Features                                                                 |
|-----------|------------|--------------------------------------------------------------------------|
| Free      | $0         | Core social, AI summaries, news, basic jobs, achievements                |
| Premium   | $9.99/mo   | Unlimited AI, advanced analytics, premium jobs, profile spotlight, etc.  |
| Creator   | $19.99/mo  | All premium + monetization, tipping, advanced API, custom branding       |

- **Upgrade:** Go to your profile > Subscription to upgrade or manage your plan.
- **Tipping:** Support creators directly via post tipping.

---

## 🛠️ Troubleshooting
- **Login Issues:** Ensure cookies are enabled and OAuth credentials are correct
- **Database Errors:** Run `npx prisma migrate deploy` and check `.env` variables
- **API Errors:** Check logs in the Docker container or local terminal
- **Payments:** Ensure Stripe keys are set and webhooks are configured
- **Testing:** Use `npm run test:e2e` for end-to-end tests
- **Common Fixes:** Run `npm run fix:all` to auto-fix common code issues

---

## 📝 Contribution & Ideas
- **Suggest Features:** Open a GitHub issue or join our Discord
- **Contribute Code:** Fork, branch, PR, and follow our code style
- **Write Guides:** Add tutorials, walkthroughs, or creative use cases
- **Join Events:** Participate in hackathons, challenges, and community calls

---

## 🧪 Testing & Quality
- **E2E:** Playwright tests for all major flows (`npm run test:e2e`)
- **Unit/Integration:** Add tests in `src/tests/`
- **CI/CD:** Automated checks on PRs

---

## 🏗️ Project Structure
```
everhood-platform/
├── app/                       # Next.js 14 App Router (routes, pages, API)
│   ├── components/            # Reusable UI and feature components
│   ├── api/                   # API routes (RESTful endpoints)
│   └── ...                    # Other app features (dashboard, news, etc.)
├── src/
│   ├── agents/                # Agent logic and registry
│   ├── scheduler/             # Job scheduling logic
│   ├── types/                 # TypeScript type definitions (NextAuth, Prisma, etc.)
│   ├── prisma/                # Prisma schema, seeds, and migrations
│   ├── tests/                 # E2E and integration tests
│   └── ...
├── lib/                       # Shared libraries and utilities (auth, redis, stripe, etc.)
├── worker/                    # Worker service (job queue, background jobs)
│   └── Dockerfile             # Worker Dockerfile
├── migrations/                # Prisma migration files
├── public/                    # Static assets and PWA files
├── scripts/                   # Data aggregation and cron scripts
├── Dockerfile                 # Main app Dockerfile
├── docker-compose.yml         # Multi-service orchestration
└── README.md                  # This file
```

---

## 🌊 Deployment
- **Docker:** `docker-compose up --build` (recommended)
- **Local:** `npm install`, `npx prisma migrate dev`, `npm run dev`
- **Environment:** Copy `.env.example` to `.env` and fill in all required secrets

## 🔧 Debugging & Troubleshooting

### Quick Debug Commands
```bash
# Start with debug mode enabled
npm run debug

# Check system health
npm run debug:health

# View real-time logs
npm run debug:logs

# Open debug panel
npm run debug:panel

# Check environment variables
npm run debug:env

# View performance metrics
npm run debug:performance
```

### Debug Panel
- **URL:** `http://localhost:3000/debug` (Admin only)
- **Features:** System health, error logs, API requests, database tools, environment checker
- **Access:** Requires admin user role

### API Debug Endpoints
- **Health:** `/api/debug/health` - System health monitoring
- **Logs:** `/api/debug/logs` - Error log viewer with filtering
- **Requests:** `/api/debug/requests` - API request/response debugging
- **Database:** `/api/debug/database` - Database query tool
- **Performance:** `/api/debug/performance` - Performance metrics
- **Environment:** `/api/debug/env` - Environment variables checker
- **Schema:** `/api/debug/schema` - Database schema inspector
- **Trace:** `/api/debug/trace` - Request flow tracer
- **Test:** `/api/debug/test` - API endpoint testing tool

### Documentation
- **Complete Guide:** [docs/DEBUGGING.md](./docs/DEBUGGING.md)
- **Troubleshooting:** Common scenarios and solutions
- **Emergency Procedures:** Step-by-step recovery processes

---

## 📞 Support & Community
- **Docs:** [docs.everhood.ai](https://docs.everhood.ai)
- **Discord:** [discord.gg/everhood](https://discord.gg/everhood)
- **Email:** [hello@everhood.ai](mailto:hello@everhood.ai)
- **GitHub Issues:** [Create an Issue](https://github.com/everhood/issues)

---

**Built with 💜 for Gen-Z by Gen-Z**

## 🏁 Feature Flags (Runtime Toggles)

The platform supports runtime feature flags via the `FeatureFlag` table in the database. This allows you to toggle features (like Redis bypass) without redeploying or changing environment variables.

### Bypass Redis with Feature Flag
- The `bypass_redis` flag controls whether Redis/BullMQ is bypassed (mocked) or used for real.
- All Redis logic checks this flag at runtime (with a fallback to the `BYPASS_REDIS` env variable for safety).
- You can toggle this flag at any time:

**Bypass Redis (default):**
```sql
UPDATE "FeatureFlag" SET value = true WHERE key = 'bypass_redis';
```

**Enable Redis:**
```sql
UPDATE "FeatureFlag" SET value = false WHERE key = 'bypass_redis';
```

- This can be done via any Postgres client or Prisma Studio.
- The flag is cached in-memory for 10 seconds for performance.

### How It Works
- The codebase uses a utility (`lib/featureFlags.ts`) to fetch and cache feature flags.
- All Redis/BullMQ/cache logic uses `isRedisBypassed()` to check the flag before connecting or running jobs.
- This enables safe local development and easy future enablement of Redis.

---

## 🤖 Advanced Agent Infrastructure

- **Dynamic Agent Registry:** Add new agents by creating files in `src/agents/` (see `exampleAgent.ts`, `enterpriseDataAnalyst.ts`).
- **Credential Handling:** AgentTemplate defines required credentials; users provide them when creating AgentInstances. Credentials are merged (instance → template → env) and used securely by the worker.
- **Job API:** The API at `app/api/v1/agents/run/route.ts` authenticates, creates an AgentRun, and enqueues a job.
- **Worker:** `worker/index.js` loads the correct agent, merges credentials, runs the job, and updates status/output.
- **Scheduler:** `src/scheduler/index.ts` runs scheduled jobs using cron and Redlock (see below).

---

## 🧠 Agent Infrastructure & Execution

- **Unified Queue:** All agent runs (manual or scheduled) are enqueued to a Redis-backed BullMQ queue.
- **Worker:** The worker (`worker/index.js`) processes jobs by dynamically loading agent modules from `src/agents/`, merging credentials, and updating job status in the database.
- **Scheduler:** The scheduler (`src/scheduler/index.ts`) runs every minute (cron), enqueues due agent jobs, and uses Redlock for distributed locking.
- **BullMQ Dashboard:** A Bull-Board dashboard is available at `/admin/queues` (see `bull-board-server.js`). It is protected by JWT authentication and supports per-user job filtering.
- **Credentials:** Agent credentials are captured via UI (if required by the template), stored encrypted in `AgentInstance.configOverride.credentials`, and never echoed back to the client.
- **Testing:** Run `npm test` for unit/integration tests. See `src/tests/agents/` and `src/tests/integration/`.

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

- **User authentication required:**
  - Set `JWT_SECRET=your-jwt-secret` in your `.env`.
  - When accessing the dashboard, include the header:
    - `Authorization: Bearer <your-jwt-token>`
  - Only jobs belonging to the authenticated user (by userId in the JWT) will be shown.
  - If the token is missing or invalid, access is denied.
- The dashboard uses the centralized BullMQ queue from `lib/queue.js`.
- All job filtering and authentication is handled server-side.

---

## Bull Board Dashboard (Admin Queues)

### How to Access
- Visit `/admin/queues` (must be logged in as admin)
- You will see Bull Board with queues: `agent:run`, `agent:webhook`, `agent:cron`
- Non-admins see read-only dashboard; admins can retry, pause, clean jobs

### Validation Steps
1. Log in as admin
2. Go to `/admin/queues`
3. Confirm all queues are listed
4. Trigger a test job (see scripts/queue-smoke.ts)
5. See job appear in Bull Board
6. Retry, pause, or clean jobs as admin
7. For stuck jobs, use `/api/queue/debug` endpoint

### Screenshot Instructions
- Take a screenshot of `/admin/queues` showing all queues and job stats
- For validation, include job details and admin controls

---
