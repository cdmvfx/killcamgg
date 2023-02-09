/*
  Warnings:

  - You are about to drop the column `totalLikes` on the `Reply` table. All the data in the column will be lost.
  - You are about to drop the column `totalLikes` on the `Review` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Reply" DROP COLUMN "totalLikes",
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "replyId" TEXT;

-- AlterTable
ALTER TABLE "Review" DROP COLUMN "totalLikes",
ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "Reply" ADD CONSTRAINT "Reply_replyId_fkey" FOREIGN KEY ("replyId") REFERENCES "Reply"("id") ON DELETE SET NULL ON UPDATE CASCADE;
