/*
  Warnings:

  - You are about to drop the column `rank` on the `User` table. All the data in the column will be lost.
  - Made the column `email` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `image` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `role` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "rank",
ADD COLUMN     "displayName" TEXT NOT NULL DEFAULT 'Anonymous',
ADD COLUMN     "score" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "email" SET NOT NULL,
ALTER COLUMN "image" SET NOT NULL,
ALTER COLUMN "role" SET NOT NULL;

-- DropEnum
DROP TYPE "Rank";

-- DropEnum
DROP TYPE "SocialPlatforms";
