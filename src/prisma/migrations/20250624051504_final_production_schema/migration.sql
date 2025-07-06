/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `achievements` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `achievements` table. All the data in the column will be lost.
  - You are about to drop the column `rarity` on the `achievements` table. All the data in the column will be lost.
  - You are about to drop the column `requirements` on the `achievements` table. All the data in the column will be lost.
  - You are about to drop the column `views` on the `articles` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `genz_content` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_activities` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Post" DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "achievements" DROP COLUMN "category",
DROP COLUMN "createdAt",
DROP COLUMN "rarity",
DROP COLUMN "requirements";

-- AlterTable
ALTER TABLE "articles" DROP COLUMN "views";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "createdAt";

-- DropTable
DROP TABLE "genz_content";

-- DropTable
DROP TABLE "user_activities";
