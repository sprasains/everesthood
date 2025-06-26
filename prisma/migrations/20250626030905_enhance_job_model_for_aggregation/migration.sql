/*
  Warnings:

  - A unique constraint covering the columns `[externalUrl]` on the table `Job` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `companyName` to the `Job` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "companyName" TEXT NOT NULL,
ADD COLUMN     "externalUrl" TEXT,
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "source" TEXT,
ALTER COLUMN "companyId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Job_externalUrl_key" ON "Job"("externalUrl");
