/*
  Warnings:

  - You are about to drop the column `allow_searchig` on the `Account` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Account" DROP COLUMN "allow_searchig",
ADD COLUMN     "allow_searching" BOOLEAN NOT NULL DEFAULT true;
