-- CreateTable
CREATE TABLE "CustomPersona" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "icon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "CustomPersona_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CustomPersona_ownerId_idx" ON "CustomPersona"("ownerId");

-- AddForeignKey
ALTER TABLE "CustomPersona" ADD CONSTRAINT "CustomPersona_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
