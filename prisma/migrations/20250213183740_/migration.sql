/*
  Warnings:

  - A unique constraint covering the columns `[publicKey,label,userId]` on the table `Wallet` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Wallet_publicKey_type_userId_label_key";

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_publicKey_label_userId_key" ON "Wallet"("publicKey", "label", "userId");
