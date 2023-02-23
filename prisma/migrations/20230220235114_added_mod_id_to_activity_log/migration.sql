-- AlterTable
ALTER TABLE "ActivityLog" ADD COLUMN     "modId" TEXT;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_modId_fkey" FOREIGN KEY ("modId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
