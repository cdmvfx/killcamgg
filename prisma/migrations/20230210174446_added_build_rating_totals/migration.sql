-- AlterTable
ALTER TABLE "Build" ADD COLUMN     "totalDislikes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalLikes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalRatings" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "_User Views" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_User Views_AB_unique" ON "_User Views"("A", "B");

-- CreateIndex
CREATE INDEX "_User Views_B_index" ON "_User Views"("B");

-- AddForeignKey
ALTER TABLE "_User Views" ADD CONSTRAINT "_User Views_A_fkey" FOREIGN KEY ("A") REFERENCES "Build"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_User Views" ADD CONSTRAINT "_User Views_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
