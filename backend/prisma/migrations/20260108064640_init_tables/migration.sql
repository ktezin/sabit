/*
  Warnings:

  - You are about to drop the column `siteId` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Template` table. All the data in the column will be lost.
  - You are about to drop the column `siteId` on the `Template` table. All the data in the column will be lost.
  - You are about to drop the `Site` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[slug]` on the table `Post` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[type]` on the table `Template` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_siteId_fkey";

-- DropForeignKey
ALTER TABLE "Site" DROP CONSTRAINT "Site_userId_fkey";

-- DropForeignKey
ALTER TABLE "Template" DROP CONSTRAINT "Template_siteId_fkey";

-- DropIndex
DROP INDEX "Post_siteId_slug_key";

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "siteId";

-- AlterTable
ALTER TABLE "Template" DROP COLUMN "createdAt",
DROP COLUMN "siteId";

-- DropTable
DROP TABLE "Site";

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "siteName" TEXT NOT NULL DEFAULT 'My Awesome Blog',
    "description" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Post_slug_key" ON "Post"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Template_type_key" ON "Template"("type");
