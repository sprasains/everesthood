# End-to-End (E2E) Testing for Everhood Platform

This project uses [Playwright](https://playwright.dev/) for comprehensive end-to-end testing of all major user flows and UI components. These tests ensure that the application works as expected with real data from the database and backend APIs.

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

## Test Coverage

The following E2E tests are included:

- `auth.e2e.test.ts` — Sign-in quick login flow
- `dashboard.e2e.test.ts` — Dashboard loads user and post data
- `friends.e2e.test.ts` — Friends page (tabs, search, requests)
- `friends-add.e2e.test.ts` — Add/search/send friend request
- `create-post.e2e.test.ts` — Create a post and see it in the feed
- `profile.e2e.test.ts` — View and update user profile
- `profile-view.e2e.test.ts` — View another user's profile
- `news.e2e.test.ts` — News articles from the database
- `billing.e2e.test.ts` — Billing/Stripe portal
- `achievements.e2e.test.ts` — Achievements from the database

## Adding More E2E Tests
- Place new E2E test files in the `tests/` directory.
- Use Playwright's [test API](https://playwright.dev/docs/test-api-testing) to interact with the UI and verify data.

## UI Component E2E Coverage
All major UI components are covered through page-level E2E tests. If you add new UI components that require direct E2E interaction, create a new test file or extend an existing one.

## Troubleshooting
- Ensure the database is seeded and the app is running before running tests.
- Use `npx playwright codegen http://localhost:3000` to record new tests interactively.

---

For more info, see the [Playwright docs](https://playwright.dev/docs/intro).
