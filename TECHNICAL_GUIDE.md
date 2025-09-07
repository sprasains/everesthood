# 🛠️ TECHNICAL GUIDE

<!--
Why this doc exists: This guide documents the architecture, queue topology, and technical verification steps for EverestHood. It is kept in sync with code and diagrams for onboarding and debugging.
-->

## Verification Checklist
- [ ] Can trace job flow from API to worker to DB
- [ ] Can view system architecture diagram
- [ ] Can view usage graph on billing page
- [ ] All referenced file paths and diagrams exist
- [ ] All commands and links are valid

## Verification Checklist
- [ ] Review architecture diagrams: All major components and data flows are represented
- [ ] Queue topology matches current codebase (see `src/lib/queue/`)
- [ ] Worker lifecycle steps are up-to-date (see `worker/index.js`)
- [ ] All referenced file paths exist
- [ ] All diagrams/screenshots are present or have placeholders

---

## System Architecture

![System Architecture Diagram](./docs/screenshots/architecture-diagram.png)

- **App**: Next.js frontend (`app/`, `src/pages/`)
- **API**: Route handlers (`src/api/v1/`)
- **Queue**: BullMQ, Redis (`src/lib/queue/`)
- **Worker**: Processes jobs (`worker/index.js`)
- **Database**: Prisma/Postgres (`prisma/`)
- **Billing Usage Graph**: Chart.js-powered graph on billing page visualizes usage and costs (see `app/settings/billing/page.tsx`)

---

## Queue Topology

- **Queues**: Defined in `src/lib/queue/`
- **Types**: LLM jobs, notifications, digests, etc.
- **Monitoring**: [Bull Board](http://localhost:3000/admin/queues) ![Bull Board Screenshot](./docs/screenshots/bull-board.png)

---


## Agent & Job Runbook (Technical)

### How to Verify Agent Execution
1. **Startup:** Worker loads agent modules from `src/agents/`
2. **Job Fetch:** Worker listens to queues via BullMQ/Redis
3. **Execution:** Worker runs agent logic, updates DB
4. **Completion:** Worker updates job status, emits events
5. **Monitor Jobs:** Use Bull Board at `/admin/queues` to view job status and logs
6. **Troubleshoot:** Check worker logs, Bull Board, and TROUBLESHOOTING.md for stuck jobs or errors

### URLs & Verification
- Bull Board: `/admin/queues`
- Worker: `worker/index.js`
- Queue: `src/lib/queue/`
- Troubleshooting: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

---

## Links
- [README](./README.md)
- [USER_GUIDE](./USER_GUIDE.md)
- [TROUBLESHOOTING](./TROUBLESHOOTING.md)
- [CHANGELOG](./CHANGELOG.md)
# 🛠️ Technical Guide: EverestHood/AgentForge

> **See also:** [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md) | [BUSINESS_OVERVIEW.md](./BUSINESS_OVERVIEW.md) | [SYSTEM_OVERVIEW.md](./SYSTEM_OVERVIEW.md) | [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

---

## 1. System Architecture

```mermaid
graph TD;
  UI["Frontend (UI/API)"] --> API["API Endpoint"]
  API --> Queue["Redis Queue (agent-jobs)"]
  Scheduler["Scheduler (cron)"] --> Queue
  Queue --> Worker["Worker Service"]
  Worker --> Agents["Agent Logic (src/agents/)"]
  Worker --> DB["Postgres DB"]
  UI --> DB
  UI --> Redis
```

- **Layman:** The system is like a restaurant: users place orders (jobs), a kitchen (worker) cooks them, and a scheduler can place orders automatically.
- **Business:** All agent executions—manual or scheduled—use the same queue and worker, ensuring reliability and scalability.
- **Technical:** Both API and scheduler enqueue jobs to Redis; the worker consumes jobs and runs agent logic, persisting results to Postgres.

---

## 2. Service Breakdown

| Service    | Description |
|------------|-------------|
| frontend   | Next.js app (UI & API, includes usage graph in billing) |
| worker     | Processes jobs from Redis queue |
| scheduler  | Triggers scheduled agent runs |
| postgres   | Database |
| redis      | Caching & job queue |
| kong       | API gateway |
| auth       | GoTrue authentication |
| realtime   | Realtime events |
| storage    | MinIO file storage |

---

## 3. Feature Modules & Patterns
- **AI Personas & Summaries:** Modular agent logic in `src/agents/`, dynamically loaded by the worker
- **Social & Gamification:** Prisma models for posts, friends, achievements, and XP
- **Job Board & Resume:** Job fetching, company creation, resume analysis agents
- **Payments & Tipping:** Stripe integration, webhooks, and user balance fields
- **Family, Money, Productivity:** Modular models and API endpoints for each life module
- **Notifications & Moderation:** Real-time triggers, admin tools, and reporting

---

## 4. Automated Fix Scripts & Developer Tooling
- Node.js scripts in project root for linting, migration, import fixes, and MUI refactors
- Run all: `npm run fix:all`
- Integrate with CI/CD and pre-commit hooks for best results

---

## 5. Environment Setup, Build, and Run
- Copy `.env.example` to `.env` and fill in secrets
- Docker: `docker-compose up --build`
- Local: `npm install`, `npx prisma migrate dev`, `npm run dev`

---

## 6. Adding/Editing Agents
- Add new agent in `src/agents/` with a `run` function
- Register in `src/agents/registry.ts`
- Test with mock jobs and E2E flows

---

## 7. Database Migration & Schema Updates
- Update `schema.prisma` as needed
- Run: `docker-compose exec frontend npx prisma migrate dev`

---

## 8. Monitoring, Logging, and Debugging
- View logs: `docker-compose logs -f`
- Service logs: `docker-compose logs -f <service>`
- Connect to Postgres: `docker-compose exec postgres psql -U user everesthood`
- Connect to Redis: `docker-compose exec redis redis-cli`

---

## 9. QA & Validation
- E2E: Playwright tests for all major flows (`npm run test:e2e`)
- Unit/Integration: Add tests in `src/tests/`
- See [QA_VALIDATION_SIGNOFF.md](./QA_VALIDATION_SIGNOFF.md) for checklist

---

## 10. Best Practices
- Modularize agent and API logic
- Use async/await and handle errors gracefully
- Validate all user input
- Keep schema and migrations in sync
- Use fix scripts regularly
- Document new features and patterns

---

## 11. Cross-Links
- [Deployment Guide](./DOCKER_DEPLOYMENT.md)
- [Business Overview](./BUSINESS_OVERVIEW.md)
- [System Overview](./SYSTEM_OVERVIEW.md)
- [Troubleshooting](./TROUBLESHOOTING.md) 

## 🏁 Feature Flags (Runtime Toggles)

- The platform uses a `FeatureFlag` table for runtime toggles (e.g., bypassing Redis).
- The `bypass_redis` flag controls whether Redis/BullMQ is mocked or used for real.
- All Redis logic checks this flag at runtime (with a fallback to the `BYPASS_REDIS` env variable).
- Toggle the flag at any time via SQL or Prisma Studio (see README for examples).
- Flags are cached in-memory for 10 seconds for performance.
- See `lib/featureFlags.ts` for implementation details.

## ⚡️ Tech Stack Quick Start (Appendix)

### Redis
- **Local:**
  - Docker: `docker run --name everesthood-redis -p 6379:6379 -d redis`
  - Homebrew: `brew install redis && brew services start redis`
  - .env: `REDIS_URL=redis://localhost:6379`
- **Cloud:**
  - Upstash/Redis Cloud: `REDIS_URL=rediss://<cloud-url>`

### Postgres
- **Local:**
  - Docker: `docker run --name everesthood-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres`
  - Homebrew: `brew install postgresql && brew services start postgresql`
  - .env: `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/everesthood`
- **Cloud:**
  - Supabase/Neon/AWS: `DATABASE_URL=...`

### Next.js
- Dev: `npm run dev`
- Build: `npm run build && npm start`

### Prisma
- Migrate: `npx prisma migrate dev`
- Generate: `npx prisma generate`

### Docker Compose
- Up: `docker-compose up -d`
- Down: `docker-compose down`

### .env Example
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/everesthood
REDIS_URL=redis://localhost:6379
NEXTAUTH_SECRET=your-secret
...
``` 

## 🚀 Quick Start for Other Tools & Services

### 🟦 Supabase (Cloud Postgres & Auth)
- **Sign up:** https://supabase.com/
- **Create a project** and get your database connection string.
- **.env:**
  ```env
  DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<db>
  SUPABASE_URL=https://<project>.supabase.co
  SUPABASE_ANON_KEY=your-anon-key
  ```
- **Docs:** [Supabase Docs](https://supabase.com/docs)

### 🟠 Stripe (Payments)
- **Sign up:** https://dashboard.stripe.com/register
- **Get your API keys** from the dashboard.
- **.env:**
  ```env
  STRIPE_SECRET_KEY=sk_test_...
  STRIPE_PUBLISHABLE_KEY=pk_test_...
  ```
- **Docs:** [Stripe Docs](https://stripe.com/docs)

### 🟢 OpenAI / Gemini (AI Integrations)
- **OpenAI:** https://platform.openai.com/
  - **.env:**
    ```env
    OPENAI_API_KEY=sk-...
    ```
- **Google Gemini:** https://makersuite.google.com/
  - **.env:**
    ```env
    GEMINI_API_KEY=...
    ```
- **Docs:** [OpenAI Docs](https://platform.openai.com/docs), [Gemini Docs](https://ai.google.dev/)

### 🟣 Playwright (E2E Testing)
- **Install:**
  ```sh
  npm install --save-dev playwright
  npx playwright install
  ```
- **Run tests:**
  ```sh
  npx playwright test
  ```
- **Docs:** [Playwright Docs](https://playwright.dev/)

### 🟡 NextAuth.js (Authentication)
- **.env:**
  ```env
  NEXTAUTH_URL=http://localhost:3000
  NEXTAUTH_SECRET=your-secret
  ```
- **Docs:** [NextAuth.js Docs](https://next-auth.js.org/)

### 🐳 Docker Compose (All-in-One)
- **Start all services:**
  ```sh
  docker-compose up -d
  ```
- **Stop all services:**
  ```sh
  docker-compose down
  ```
- **Docs:** [Docker Compose Docs](https://docs.docker.com/compose/)

---

## Worker Service (LLM/AI Job Processing)
- The worker service is responsible for processing jobs from the Redis queue (e.g., LLM/AI jobs).
- A minimal worker template is provided in `worker/index.js`.
- To run the worker locally:
  ```sh
  cd worker
  npm install ioredis
  node index.js
  ```
- This template simulates job processing. For real LLM jobs, replace the logic with actual OpenAI/Gemini API calls and DB updates.
- If you do not run the worker, LLM jobs (AI code generation, summaries, etc.) will not work.

---

## 🧠 Agent Execution & Observability (Production-Grade)

- **Handler Pattern:** Each agent must have a handler in `src/agents/<moduleName>.ts` exporting `run(input, mode, userId, creds)`. All agent runs are dispatched via the queue and processed by the worker using `getAgentHandler`.
- **Scheduler:** The scheduler uses `node-cron` and Redlock to enqueue jobs every minute, ensuring no duplicate runs in multi-instance deployments.
- **BullMQ Dashboard:** The Bull-Board dashboard is served via Express at `/admin/queues` and is JWT-protected.
- **Logging:** All logs (worker/API) include runId, agentInstanceId, templateName, userId for traceability.
- **Credential Security:** Credentials are encrypted at rest and only decrypted for job execution in the worker.
- **Testing:** Add at least one unit test per agent handler and two integration tests per agent class (happy path, credential fallback).

---

## Bull Board Dashboard (Admin Queues)

### How to Access
- Visit `/admin/queues` (must be logged in as admin)
- Bull Board will show queues: `agent:run`, `agent:webhook`, `agent:cron`
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
- Screenshot `/admin/queues` showing all queues and job stats
- For validation, include job details and admin controls