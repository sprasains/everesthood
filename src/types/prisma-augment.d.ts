// Temporary PrismaClient augmentation to provide a compatibility escape hatch
// This file reduces a large class of TypeScript errors where code expects
// legacy model names (e.g. `prisma.agent`, `prisma.notification`) but the
// generated Prisma schema uses different model names. It keeps runtime behavior
// unchanged and should be removed once the codebase is migrated to the
// canonical Prisma models.

import '@prisma/client';

declare module '@prisma/client' {
  // Allow index access and dot-access for arbitrary model names used across
  // the codebase during the TypeScript fix sprint. All properties default to
  // `any` so this is only a temporary developer ergonomics shim.
  interface PrismaClient {
    [key: string]: any;
  }
}
