#cvghuioo.3590-= End-to-End (E2E) Testing for Everhood Platform

This project uses [Playwright](https://playwright.dev/) for comprehensive end-to-end testing of all major user flows and UI components. These tests ensure that the application works as expected with real data from the database and backend APIs.

## Why E2E Testing Matters
- Ensures real user flows work across frontend, backend, and database
- Catches integration bugs that unit tests miss
- Protects against regressions as features evolve
- Builds confidence for rapid releases and refactoring

## Setup Instructions

1. **Install dependencies:**
   ```sh
   npm install
   ```
2. **Install Playwright browsers:**
   ```sh
   npx playwright install
   ```
3. **Start your application and database:**
   - Make sure your Next.js app and database are running locally (default: `http://localhost:3000`).
   - Seed the database with test users if needed:
     ```sh
     npm run db:seed
     ```
4. **Run E2E tests:**
   - Headless (default):
     ```sh
     npm run test:e2e
     ```
   - Headed (see browser):
     ```sh
     npm run test:e2e:headed
     ```
   - Interactive UI mode:
     ```sh
     npm run test:e2e:ui
     ```
   - View HTML report:
     ```sh
     npm run test:e2e:report
     ```

## Test Coverage Catalog

The following E2E tests are included:
- **Authentication:** Sign-in, sign-up, quick login
- **Dashboard:** Loads user and post data
- **Friends:** Friends page, tabs, search, requests, add friend
- **Posts:** Create post, threaded comments, likes, mentions
- **Profile:** View/update own and others' profiles
- **News:** News articles from the database
- **Billing:** Stripe portal, subscription flows
- **Achievements:** Unlocking and viewing achievements
- **Resume Vibe Check:** Upload and analyze resume
- **Jobs:** View jobs, apply, company profiles
- **Settings:** Update user settings, API keys

## Adding More E2E Tests
- Place new E2E test files in the `tests/` directory.
- Use Playwright's [test API](https://playwright.dev/docs/test-api-testing) to interact with the UI and verify data.
- Mock or seed data as needed for new flows.

## Debugging & Troubleshooting
- Ensure the database is seeded and the app is running before running tests.
- Use `npx playwright codegen http://localhost:3000` to record new tests interactively.
- Check Playwright HTML reports for failed steps and screenshots.
- If tests fail intermittently, check for async timing issues or missing awaits.
- For CI failures, ensure all environment variables and services are configured.

---

For more info, see the [Playwright docs](https://playwright.dev/docs/intro).
