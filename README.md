# 🌟 Everhood - AI Vibe Hub for Gen-Z

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
- **News Feed:** Personalized, real-time, and friend-filtered
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
- **Learning:** Follow trending news, unlock achievements, and join discussions
- **Networking:** Add friends, join circles, and collaborate
- **Monetization:** Become a creator, receive tips, and unlock premium features
- **Wellness:** Track mood, join digital detox, and manage life events

---

## 🗂️ Feature Catalog
- **Authentication:** NextAuth.js, social login, JWT/session
- **AI Engine:** Google Gemini Pro, OpenAI
- **News & Content:** Aggregated feeds, likes, comments
- **Posts & Comments:** Rich text, mentions, likes, threaded replies
- **Friends & Circles:** Social graph, friend requests, circles
- **Achievements & Badges:** XP, streaks, badges, leaderboards
- **Jobs & Companies:** Curated jobs, company profiles, applications
- **Payments:** Stripe integration, tipping, subscriptions
- **Resume Tools:** AI resume analysis
- **Family & Money:** Budgets, bills, events, subscriptions
- **Productivity:** Tasks, digital detox, journaling
- **Notifications:** Real-time, for all major events
- **Admin & Moderation:** Reports, blocks, moderation tools

---

## 💡 Ideas & Creativity
- **Custom AI Personas:** Build your own AI assistant for unique insights
- **Content Creation:** Share posts, guides, and resources with the community
- **Career Showcases:** Highlight achievements, projects, and skills
- **Collaborative Circles:** Create private or public circles for focused discussions
- **Hackathons & Challenges:** Compete in platform-wide events

---

## 🧠 Knowledge & Learning
- **AI Summaries:** Stay updated with digestible, persona-driven content
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
