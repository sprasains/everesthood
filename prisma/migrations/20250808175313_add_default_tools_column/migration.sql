-- AlterTable
ALTER TABLE "AgentTemplate" ADD COLUMN     "capabilities" JSONB,
ADD COLUMN     "category" TEXT DEFAULT 'General',
ADD COLUMN     "connectors" JSONB,
ADD COLUMN     "credentials" JSONB,
ADD COLUMN     "customFields" JSONB,
ADD COLUMN     "defaultTools" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "integrations" JSONB,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "performanceMetrics" JSONB,
ADD COLUMN     "securityConfig" JSONB,
ADD COLUMN     "workflowRelationships" JSONB,
ADD COLUMN     "workflows" JSONB;
