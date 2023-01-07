-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "totalLikes" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Reply" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authorId" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "totalLikes" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Reply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_Review Likes" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_Reply Likes" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_Review Likes_AB_unique" ON "_Review Likes"("A", "B");

-- CreateIndex
CREATE INDEX "_Review Likes_B_index" ON "_Review Likes"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Reply Likes_AB_unique" ON "_Reply Likes"("A", "B");

-- CreateIndex
CREATE INDEX "_Reply Likes_B_index" ON "_Reply Likes"("B");

-- AddForeignKey
ALTER TABLE "Reply" ADD CONSTRAINT "Reply_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reply" ADD CONSTRAINT "Reply_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Review Likes" ADD CONSTRAINT "_Review Likes_A_fkey" FOREIGN KEY ("A") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Review Likes" ADD CONSTRAINT "_Review Likes_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Reply Likes" ADD CONSTRAINT "_Reply Likes_A_fkey" FOREIGN KEY ("A") REFERENCES "Reply"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Reply Likes" ADD CONSTRAINT "_Reply Likes_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
