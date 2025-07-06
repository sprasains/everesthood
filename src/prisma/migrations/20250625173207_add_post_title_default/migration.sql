-- CreateEnum
CREATE TYPE "PostType" AS ENUM ('TEXT', 'POLL', 'LINK', 'PREDICTION');

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "title" TEXT NOT NULL DEFAULT 'Untitled Post',
ADD COLUMN     "type" "PostType" NOT NULL DEFAULT 'TEXT';
