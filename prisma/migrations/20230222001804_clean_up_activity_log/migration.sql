/*
  Warnings:

  - You are about to drop the column `buildId` on the `ActivityLog` table. All the data in the column will be lost.
  - You are about to drop the column `replyId` on the `ActivityLog` table. All the data in the column will be lost.
  - You are about to drop the column `reviewId` on the `ActivityLog` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `Reply` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `Review` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ActivityLog" DROP CONSTRAINT "ActivityLog_buildId_fkey";

-- DropForeignKey
ALTER TABLE "ActivityLog" DROP CONSTRAINT "ActivityLog_modId_fkey";

-- DropForeignKey
ALTER TABLE "ActivityLog" DROP CONSTRAINT "ActivityLog_replyId_fkey";

-- DropForeignKey
ALTER TABLE "ActivityLog" DROP CONSTRAINT "ActivityLog_reviewId_fkey";

-- AlterTable
ALTER TABLE "ActivityLog" DROP COLUMN "buildId",
DROP COLUMN "replyId",
DROP COLUMN "reviewId";

-- AlterTable
ALTER TABLE "Reply" DROP COLUMN "deletedAt";

-- AlterTable
ALTER TABLE "Review" DROP COLUMN "deletedAt";

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_modId_fkey" FOREIGN KEY ("modId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
