# 📈 Business Overview: EverestHood/AgentForge

> **See also:** [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md) | [TECHNICAL_GUIDE.md](./TECHNICAL_GUIDE.md) | [SYSTEM_OVERVIEW.md](./SYSTEM_OVERVIEW.md) | [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

---

## What is EverestHood/AgentForge?
- **Layman:** A smart platform that lets you automate tasks and get things done by creating and running digital agents.
- **Business:** A unified, scalable system for automating workflows, integrating data, and enabling both user-triggered and scheduled actions.
- **Technical:** A full-stack, containerized platform with modular agent logic, job queueing, and robust scheduling.

---

## Key User Flows

```mermaid
graph TD;
  User["User (UI)"] --> API["API (frontend)"]
  API --> Queue["Job Queue"]
  Scheduler["Scheduler"] --> Queue
  Queue --> Worker["Worker"]
  Worker --> Agent["Agent Logic"]
```

- **Layman:** You click a button or set a schedule, and the system does the rest.
- **Business:** All actions—manual or scheduled—are processed the same way, ensuring reliability and auditability.

---

## What's New in This Release?
- **Layman:** Everything runs in containers (Docker), so it's easy to set up and works the same everywhere.
- **Business:**
  - Dockerization for consistent deployment
  - Unified agent execution (no code duplication)
  - Built-in scheduling for recurring tasks
  - Centralized logging and monitoring
- **Technical:**
  - Redis-powered job queue
  - BullMQ for job management
  - Scheduler service for cron-based automation

---

## Automated Fix Scripts: Business Value

To ensure rapid onboarding, minimize manual errors, and maintain a healthy codebase, the platform includes a suite of automated fix scripts in the project root. These scripts:
- Automatically fix common build, lint, and migration issues
- Help developers resolve problems quickly, reducing downtime and support needs
- Standardize code quality and reduce technical debt

### How They Work
- Developers can run all fixes at once with:
  ```bash
  npm run fix:all
  ```
- Or run individual scripts for targeted fixes (see package.json for all options)
- Scripts are referenced in the project root and documented in the README

### Business Impact
- **Faster Onboarding:** New team members can resolve common issues in minutes
- **Fewer Manual Errors:** Automated fixes reduce the risk of human mistakes
- **Consistent Quality:** Codebase remains modern, maintainable, and ready for scale
- **Lower Support Burden:** Fewer build/lint issues mean less time spent on troubleshooting

For a full list of scripts and usage details, see the README.

---

## Requesting Features & Reporting Issues
- **Layman:** Want something new or found a bug? Let us know!
- **Business:**
  - Open an issue on GitHub
  - Contact the product owner or support team
- **Technical:**
  - [GitHub Issues](https://github.com/your-org/your-repo/issues)

---

## Contact & Support
- Product Owner: [name/email]
- Support: [support@email.com]
- Slack: #agentforge-support

---

## Cross-Links
- [Deployment Guide](./DOCKER_DEPLOYMENT.md)
- [Technical Guide](./TECHNICAL_GUIDE.md)
- [System Overview](./SYSTEM_OVERVIEW.md)
- [Troubleshooting](./TROUBLESHOOTING.md) 