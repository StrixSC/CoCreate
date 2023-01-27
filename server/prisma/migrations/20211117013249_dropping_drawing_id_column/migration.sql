/*
  Warnings:

  - You are about to drop the column `drawing_id` on the `Collaboration` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Collaboration_drawing_id_key";

-- AlterTable
ALTER TABLE "Collaboration" DROP COLUMN "drawing_id";
