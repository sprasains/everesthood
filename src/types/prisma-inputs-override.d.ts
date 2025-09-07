// Temporary overrides for commonly-used Prisma input/where/include types.
// This file intentionally widens several generated Prisma types to `any` to
// reduce noise while migrating the codebase and reconciling the schema.
//
// IMPORTANT: This is a temporary developer ergonomics shim. Replace with
// correct, narrow types as part of the TypeScript fix sprint.

declare module '@prisma/client' {
  // User-related inputs
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type UserUpdateInput = any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type UserCreateInput = any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type UserWhereUniqueInput = any;
  // Generic count/select types
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type UserSelect<T = any> = any;
  // AgentRun and related
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type AgentRunCreateInput = any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type AgentRunWhereInput = any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type AgentRunOrderByWithRelationInput = any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type AgentRunInclude = any;
  // AgentTemplate
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type AgentTemplateWhereInput = any;
  // AgentCredential
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type AgentCredentialCreateInput = any;
  // FeatureFlag
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type FeatureFlagWhereUniqueInput = any;
  // Billing/usage
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type BillingReportCreateInput = any;
  // Generic include/select/where fallback
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type PrismaSelect = any;
}
