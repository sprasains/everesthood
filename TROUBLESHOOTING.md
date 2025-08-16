# 🛠️ Troubleshooting Guide: EverestHood/AgentForge

> **See also:** [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md) | [TECHNICAL_GUIDE.md](./TECHNICAL_GUIDE.md) | [BUSINESS_OVERVIEW.md](./BUSINESS_OVERVIEW.md) | [SYSTEM_OVERVIEW.md](./SYSTEM_OVERVIEW.md)

---

## Common Problems & Solutions

### 1. Service Won't Start
- **Layman:** Something won't turn on? Check your settings and try again.
- **Business:** Service startup failures are usually due to missing environment variables or port conflicts.
- **Technical:**
  - Check logs: `docker-compose logs -f <service>`
  - Ensure `.env` is complete and correct
  - Check for port conflicts with `lsof -i :<port>`

### 2. Jobs Stuck in Queue
- **Layman:** Your request isn't being processed? The kitchen (worker) might be down.
- **Business:** If jobs aren't processed, the worker may be stopped or Redis may be unavailable.
- **Technical:**
  - Check worker logs: `docker-compose logs -f worker`
  - Check Redis: `docker-compose exec redis redis-cli`
  - Restart worker: `docker-compose restart worker`
  - Check BullMQ dashboard: Visit `/admin/queues` (admin only)
  - List queue stats: `curl http://localhost:3000/api/queue/debug`
  - Retry stuck jobs (admin): Use Bull Board dashboard or run:
    - `redis-cli` > `DEL bull:<queue>:wait` (dangerous, only if jobs are truly stuck)
    - BullMQ CLI: `npx bullmq list --queue agent:run`
    - BullMQ retry: `npx bullmq retry --queue agent:run`

#### FAQ: Why are jobs stuck?
- Worker is not running or crashed
- Redis is down or unreachable
- Job payload is invalid (see `/api/queue/debug` for failed reasons)
- Concurrency or rate limits exceeded
- DLQ (dead letter queue) is full
- RBAC or org boundaries blocking job execution

### 3. Database Issues
- **Layman:** Data missing or not saving? The database might be having trouble.
- **Business:** Data persistence issues are often due to database connectivity or migration problems.
- **Technical:**
  - Check Postgres logs: `docker-compose logs -f postgres`
  - Connect: `docker-compose exec postgres psql -U user everesthood`
  - Run migrations: `docker-compose exec frontend npx prisma migrate deploy`

### 4. Payments & Stripe Issues
- **Layman:** Can't upgrade or tip? Check your payment info and try again.
- **Business:** Payment failures are often due to missing Stripe keys or webhook misconfiguration.
- **Technical:**
  - Ensure Stripe keys are set in `.env`
  - Check Stripe webhook logs and endpoint URLs
  - Review payment logs: `docker-compose logs -f frontend`

### 5. AI/Persona/Job Errors
- **Layman:** AI summaries or jobs not working? Try again or contact support.
- **Business:** AI or job errors may be due to missing API keys, quota limits, or agent bugs.
- **Technical:**
  - Check AI service keys in `.env`
  - Review agent and worker logs
  - Check for quota exceeded messages in the UI

### 6. Environment Variables Not Loaded
- **Layman:** Settings not working? Double-check your .env file.
- **Business:** Missing or incorrect env vars can break service startup.
- **Technical:**
  - Check logs for missing env warnings
  - Print envs: `docker-compose exec <service> printenv | grep <VAR>`

---

## How to Check Logs
- All logs: `docker-compose logs -f`
- Specific service: `docker-compose logs -f <service>`

## How to Connect to Services
- **Postgres:** `docker-compose exec postgres psql -U user everesthood`
- **Redis:** `docker-compose exec redis redis-cli`

---

## Where to Find Help
- [GitHub Issues](https://github.com/your-org/your-repo/issues)
- Product Owner: [name/email]
- Support: [support@email.com]
- Discord: [discord.gg/everhood](https://discord.gg/everhood)

---

## Cross-Links
- [Deployment Guide](./DOCKER_DEPLOYMENT.md)
- [Technical Guide](./TECHNICAL_GUIDE.md)
- [Business Overview](./BUSINESS_OVERVIEW.md)
- [System Overview](./SYSTEM_OVERVIEW.md)