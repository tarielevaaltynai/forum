/*
  Warnings:

  - You are about to drop the column `isUserMessage` on the `ChatMessage` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `ChatSession` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `ChatSession` table. All the data in the column will be lost.
  - You are about to drop the `ChatSource` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `role` to the `ChatMessage` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ChatMessage" DROP CONSTRAINT "ChatMessage_sessionId_fkey";

-- DropForeignKey
ALTER TABLE "ChatMessage" DROP CONSTRAINT "ChatMessage_userId_fkey";

-- DropForeignKey
ALTER TABLE "ChatSession" DROP CONSTRAINT "ChatSession_userId_fkey";

-- DropForeignKey
ALTER TABLE "ChatSource" DROP CONSTRAINT "ChatSource_messageId_fkey";

-- DropIndex
DROP INDEX "ChatMessage_sessionId_idx";

-- DropIndex
DROP INDEX "ChatMessage_userId_idx";

-- DropIndex
DROP INDEX "ChatSession_userId_idx";

-- AlterTable
ALTER TABLE "ChatMessage" DROP COLUMN "isUserMessage",
ADD COLUMN     "role" TEXT NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ChatSession" DROP COLUMN "title",
DROP COLUMN "updatedAt",
ALTER COLUMN "userId" DROP NOT NULL;

-- DropTable
DROP TABLE "ChatSource";

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ChatSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatSession" ADD CONSTRAINT "ChatSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
