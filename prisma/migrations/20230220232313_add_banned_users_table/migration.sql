-- CreateEnum
CREATE TYPE "ScoreName" AS ENUM ('POSTED_BUILD', 'POSTED_REVIEW', 'POSTED_REPLY', 'RECEIVED_BUILD_LIKE', 'RECEIVED_BUILD_FAVORITE');

-- CreateEnum
CREATE TYPE "BuildTag" AS ENUM ('LONG_RANGE', 'MID_RANGE', 'SHORT_RANGE');

-- AlterEnum
ALTER TYPE "ActivityType" ADD VALUE 'DELETED_REPLY';

-- AlterTable
ALTER TABLE "Build" ALTER COLUMN "status" SET DEFAULT 'APPROVED';

-- CreateTable
CREATE TABLE "BannedUser" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,

    CONSTRAINT "BannedUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScoreLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "name" "ScoreName" NOT NULL,

    CONSTRAINT "ScoreLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BannedUser_userId_key" ON "BannedUser"("userId");

-- AddForeignKey
ALTER TABLE "BannedUser" ADD CONSTRAINT "BannedUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoreLog" ADD CONSTRAINT "ScoreLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
