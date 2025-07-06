-- CreateTable
CREATE TABLE "DigitalDetoxPlan" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "coverImage" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DigitalDetoxPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DigitalDetoxTask" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "day" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "DigitalDetoxTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DigitalDetoxProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "DigitalDetoxProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DigitalDetoxProgress_userId_taskId_key" ON "DigitalDetoxProgress"("userId", "taskId");
