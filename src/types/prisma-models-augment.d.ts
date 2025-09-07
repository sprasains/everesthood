// Temporary augmentations for Prisma model interfaces to reduce noise while
// performing a staged TypeScript migration. These add a permissive index
// signature to common models so property access (user.xp, user.stripeCustomerId,
// etc.) doesn't produce a cascade of errors. Remove when models/DB schema and
// code are reconciled.

import '@prisma/client';

declare module '@prisma/client' {
  // Add an index signature to model result types so code can access legacy
  // properties during the migration. Keeping these as `any` is intentionally
  // permissive — we'll tighten types as part of the fix sprint.
  interface User {
    [key: string]: any;
  }
  interface Agent {
    [key: string]: any;
  }
  interface AgentRun {
    [key: string]: any;
  }
  interface AgentInstance {
    [key: string]: any;
  }
  interface AgentTemplate {
    [key: string]: any;
  }
  interface AgentTemplateVersion {
    [key: string]: any;
  }
  interface AgentCredential {
    [key: string]: any;
  }
  interface Secret {
    [key: string]: any;
  }
  interface Post {
    [key: string]: any;
  }
  interface Notification {
    [key: string]: any;
  }
  interface Achievement {
    [key: string]: any;
  }
  interface UserAchievement {
    [key: string]: any;
  }
  interface BillingAccount {
    [key: string]: any;
  }
  interface BillingReport {
    [key: string]: any;
  }
  interface UsageRecord {
    [key: string]: any;
  }
  interface UsageMeter {
    [key: string]: any;
  }
  interface FeatureFlag {
    [key: string]: any;
  }
  interface AgentRunStep {
    [key: string]: any;
  }
  interface AgentEvent {
    [key: string]: any;
  }
}
