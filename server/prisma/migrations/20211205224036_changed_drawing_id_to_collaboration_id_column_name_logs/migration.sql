/*
  Warnings:

  - You are about to drop the column `drawing_id` on the `Log` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Log" DROP COLUMN "drawing_id",
ADD COLUMN     "collaboration_id" TEXT;
