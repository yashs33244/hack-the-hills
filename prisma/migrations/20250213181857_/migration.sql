/*
  Warnings:

  - A unique constraint covering the columns `[publicKey,type,userId,label]` on the table `Wallet` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Wallet_publicKey_type_userId_key";

-- AlterTable
ALTER TABLE "Wallet" ADD COLUMN     "label" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_publicKey_type_userId_label_key" ON "Wallet"("publicKey", "type", "userId", "label");
