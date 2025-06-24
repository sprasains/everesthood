-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "parentId" TEXT;

-- CreateTable
CREATE TABLE "CommentDislike" (
    "userId" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,

    CONSTRAINT "CommentDislike_pkey" PRIMARY KEY ("userId","commentId")
);

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentDislike" ADD CONSTRAINT "CommentDislike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentDislike" ADD CONSTRAINT "CommentDislike_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
