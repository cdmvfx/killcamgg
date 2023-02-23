-- AlterTable
ALTER TABLE "ActivityLog" ADD COLUMN     "notes" TEXT,
ADD COLUMN     "replyId" TEXT;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_replyId_fkey" FOREIGN KEY ("replyId") REFERENCES "Reply"("id") ON DELETE SET NULL ON UPDATE CASCADE;
