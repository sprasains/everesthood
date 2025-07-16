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
| frontend   | Next.js app (UI & API) |
| worker     | Processes jobs from Redis queue |
| scheduler  | Triggers scheduled agent runs |
| postgres   | Database |
| redis      | Caching & job queue |
| kong       | API gateway |
| auth       | GoTrue authentication |
| realtime   | Realtime events |
| storage    | MinIO file storage |

---

## Automated Fix Scripts & Developer Tooling

To streamline development, reduce manual errors, and ensure a healthy codebase, a suite of automated fix scripts is provided in the project root. These Node.js scripts address common build, lint, and migration issues, and can be run individually or collectively.

### Types of Scripts
- **Error Handling Fixes:** Automatically patch unsafe error.message access, implicit any, and missing exports.
- **Linting & Formatting:** Run ESLint with --fix to auto-correct style and code issues.
- **Import Path Checks:** Log and help fix broken or incorrect import paths.
- **MUI/Component Refactors:** Identify and help refactor deprecated or problematic MUI usage (e.g., Grid to Box).
- **Client/Server Boundaries:** Add missing 'use client' directives to React components as needed.

### Usage
- **Run all fixes at once:**
  ```bash
  npm run fix:all
  ```
- **Run a specific fix:**
  ```bash
  npm run fix:lint
  npm run fix:use-client-directive
  # ...and others as listed in package.json
  ```

### Location
- All fix scripts are in the project root (e.g., `fix-lint-errors.js`, `fix-use-client-directive.js`, etc.).
- Scripts are referenced in `package.json` for easy npm usage.

### Workflow Integration
- **Onboarding:** New developers can run `npm run fix:all` to resolve common issues before starting work.
- **CI/CD:** Scripts can be integrated into CI pipelines to enforce code quality and prevent regressions.
- **Pre-commit:** Optionally, run scripts as pre-commit hooks to catch issues early.
- **Troubleshooting:** Use scripts to quickly resolve build or lint errors after merges or dependency updates.

### Best Practices
- Always review script output and manually check files for context-specific fixes.
- Use scripts iteratively during refactors or after large dependency upgrades.
- Reference the README for a full list of scripts and their descriptions.

These tools help maintain a robust, modern codebase and accelerate development velocity for all contributors.

---

## 3. Environment Setup, Build, and Run

- **Layman:** Copy the example settings, fill in your secrets, and run one command to start everything.
- **Business:** Fast onboarding for new devs; all dependencies are containerized.
- **Technical:**
  ```bash
  cp .env.example .env
  # Edit .env as needed
  docker-compose up --build
  ```

---

## 4. Adding/Editing Agents

- **Layman:** To add a new agent, just write a new file in `src/agents/`.
- **Business:** Agents are modular and easy to extend; no changes to the worker or API needed.
- **Technical:**
  1. Create a new file in `src/agents/` (e.g., `myAgent.ts`).
  2. Export a `run` function:
     ```ts
     // Layman: This agent repeats what you send it.
     // Business: Demo agent for testing.
     // Technical: Implements the required run interface.
     export async function run(input: any, mode: string, userId: string) {
       return { result: 'Agent completed', input, mode, userId };
     }
     ```
  3. Register the agent in `src/agents/registry.ts`:
     ```ts
     // Layman: Add your agent to the phonebook.
     // Business: Ensures discoverability.
     // Technical: Maps agent ID to import function.
     'myAgent': () => import('./myAgent'),
     ```

---

## 5. Database Migration & Schema Updates

- **Layman:** If you change the database, run a command to update it.
- **Business:** Schema changes are versioned and easy to apply.
- **Technical:**
  ```bash
  docker-compose exec frontend npx prisma migrate dev
  ```

---

## 6. Monitoring, Logging, and Debugging

- **Layman:** Use logs to see what's happening.
- **Business:** Centralized logs for all services.
- **Technical:**
  - View all logs: `docker-compose logs -f`
  - View a specific service: `docker-compose logs -f worker`
  - Connect to Postgres: `docker-compose exec postgres psql -U user everesthood`
  - Connect to Redis: `docker-compose exec redis redis-cli`

---

## 7. QA Validation Checklist

- See [QA_VALIDATION_SIGNOFF.md](./QA_VALIDATION_SIGNOFF.md) for the full checklist and sign-off template.

---

## 8. Cross-Links
- [Deployment Guide](./DOCKER_DEPLOYMENT.md)
- [Business Overview](./BUSINESS_OVERVIEW.md)
- [System Overview](./SYSTEM_OVERVIEW.md)
- [Troubleshooting](./TROUBLESHOOTING.md) 