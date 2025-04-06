-- AlterTable
ALTER TABLE "User" ADD COLUMN     "faceAuthEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "faceDescriptor" TEXT;
