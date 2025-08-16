/*
  Warnings:

  - You are about to drop the column `createdAt` on the `AgentRun` table. All the data in the column will be lost.
  - You are about to drop the column `endedAt` on the `AgentRun` table. All the data in the column will be lost.
  - You are about to drop the column `error` on the `AgentRun` table. All the data in the column will be lost.
  - You are about to drop the column `jobId` on the `AgentRun` table. All the data in the column will be lost.
  - You are about to drop the column `logsPointer` on the `AgentRun` table. All the data in the column will be lost.
  - You are about to drop the column `metrics` on the `AgentRun` table. All the data in the column will be lost.
  - You are about to drop the column `retries` on the `AgentRun` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `AgentRun` table. All the data in the column will be lost.
  - Added the required column `userId` to the `AgentRun` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `status` on the `AgentRun` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `startedAt` on table `AgentRun` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "public"."AgentRun_jobId_key";

-- AlterTable
ALTER TABLE "public"."AgentRun" DROP COLUMN "createdAt",
DROP COLUMN "endedAt",
DROP COLUMN "error",
DROP COLUMN "jobId",
DROP COLUMN "logsPointer",
DROP COLUMN "metrics",
DROP COLUMN "retries",
DROP COLUMN "updatedAt",
ADD COLUMN     "finishedAt" TIMESTAMP(3),
ADD COLUMN     "tokensUsed" INTEGER,
ADD COLUMN     "userId" TEXT NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL,
ALTER COLUMN "startedAt" SET NOT NULL,
ALTER COLUMN "startedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "public"."AgentRunStep" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "input" JSONB NOT NULL,
    "output" JSONB,
    "error" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "AgentRunStep_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."AgentRunStep" ADD CONSTRAINT "AgentRunStep_runId_fkey" FOREIGN KEY ("runId") REFERENCES "public"."AgentRun"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
