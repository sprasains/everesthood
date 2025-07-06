# EverestHood/AgentForge: Docker Deployment Guide

> **This is the single source of truth for deploying and running the platform. All previous deployment docs are obsolete.**

---

## 🚀 Overview

This guide explains how to deploy, run, and monitor the EverestHood/AgentForge platform using Docker Compose. It covers all services, environment setup, and the unified agent execution architecture.

---

## 🏗️ Architecture & Execution Flows

### **Core Services**
- **frontend**: Next.js app (UI & API)
- **worker**: Processes agent jobs from the queue
- **scheduler**: Triggers scheduled agent runs (cron)
- **postgres**: Database
- **redis**: Caching & job queue
- **kong**: API gateway
- **auth**: GoTrue authentication
- **realtime**: Realtime events
- **storage**: MinIO file storage

### **Unified Agent Execution**

#### 1. **User-Triggered (API) Flow**
```
User Click (UI)
   ↓
API Endpoint (frontend)
   ↓
Redis Queue (agent-jobs)
   ↓
Worker Service
   ↓
Agent Logic (src/agents/)
```

#### 2. **Scheduled (Automated) Flow**
```
Scheduler Cron (scheduler)
   ↓
Redis Queue (agent-jobs)
   ↓
Worker Service
   ↓
Agent Logic (src/agents/)
```

**Both flows use the same Redis queue and worker, ensuring a single, unified execution path.**

---

## ⚙️ Prerequisites
- [Docker](https://www.docker.com/get-started) & [Docker Compose](https://docs.docker.com/compose/)
- Copy `.env.example` to `.env` and fill in all required secrets (see below)

---

## 📝 Environment Setup

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd everesthood
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your editor and fill in all required values
   ```
   **Required variables:**
   - `DATABASE_URL` (e.g., `postgresql://user:password@postgres:5432/everesthood`)
   - `REDIS_URL` (e.g., `redis://redis:6379`)
   - `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, etc.
   - See `.env.example` for the full list.

---

## 🏗️ Build & Run

1. **Build and start all services:**
   ```bash
   docker-compose up --build
   ```
   This will start all core services, including the scheduler and worker.

2. **Access the app:**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Kong API Gateway: [http://localhost:8000](http://localhost:8000)
   - Auth: [http://localhost:9999](http://localhost:9999)
   - MinIO: [http://localhost:9000](http://localhost:9000)

---

## 🔍 Monitoring & Logs

- **View logs for all services:**
  ```bash
  docker-compose logs -f
  ```
- **View logs for a specific service:**
  ```bash
  docker-compose logs -f worker
  docker-compose logs -f scheduler
  docker-compose logs -f frontend
  ```
- **Restart a service:**
  ```bash
  docker-compose restart worker
  ```

---

## 🛠️ Common Tasks

- **Apply database migrations:**
  ```bash
  docker-compose exec frontend npx prisma migrate deploy
  ```
- **Rebuild after code changes:**
  ```bash
  docker-compose up --build
  ```
- **Stop all services:**
  ```bash
  docker-compose down
  ```

---

## 🧩 Adding/Editing Agents
- Place new agent logic in `src/agents/` following the registry pattern.
- All agent runs (manual or scheduled) are processed by the worker via the Redis queue.

---

## ❓ Troubleshooting
- Ensure all environment variables are set in `.env`.
- Use `docker-compose logs` to diagnose issues.
- For database issues, connect to Postgres using `docker-compose exec postgres psql -U user everesthood`.
- For Redis, use `docker-compose exec redis redis-cli`.

---

## 📚 Further Reading
- [Docker Compose Docs](https://docs.docker.com/compose/)
- [Prisma Docs](https://www.prisma.io/docs/)
- [BullMQ Docs](https://docs.bullmq.io/)
- [node-cron](https://www.npmjs.com/package/node-cron) or [cron-parser](https://www.npmjs.com/package/cron-parser)

---

**This guide supersedes all previous deployment instructions. For questions, open an issue or contact the maintainers.** 