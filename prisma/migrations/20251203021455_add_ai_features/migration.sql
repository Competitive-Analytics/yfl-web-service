-- CreateEnum
CREATE TYPE "AIConversationStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'ABANDONED');

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "aiTokenLimit" INTEGER NOT NULL DEFAULT 100000,
ADD COLUMN     "aiTokensResetAt" TIMESTAMP(3),
ADD COLUMN     "aiTokensUsedThisMonth" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "openaiApiKey" TEXT;

-- CreateTable
CREATE TABLE "AIConversation" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "messages" JSONB NOT NULL,
    "status" "AIConversationStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "forecastId" TEXT,
    "tokenCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIConversation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AIConversation_organizationId_userId_createdAt_idx" ON "AIConversation"("organizationId", "userId", "createdAt");

-- CreateIndex
CREATE INDEX "AIConversation_userId_status_idx" ON "AIConversation"("userId", "status");

-- AddForeignKey
ALTER TABLE "AIConversation" ADD CONSTRAINT "AIConversation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIConversation" ADD CONSTRAINT "AIConversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIConversation" ADD CONSTRAINT "AIConversation_forecastId_fkey" FOREIGN KEY ("forecastId") REFERENCES "Forecast"("id") ON DELETE SET NULL ON UPDATE CASCADE;
