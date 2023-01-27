/*
  Warnings:

  - Added the required column `type` to the `Collaboration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Drawing` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CollaborationType" AS ENUM ('Private', 'Public', 'Protected');

-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "allow_searchig" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Collaboration" ADD COLUMN     "type" "CollaborationType" NOT NULL;

-- AlterTable
ALTER TABLE "Drawing" ADD COLUMN     "title" TEXT NOT NULL;
