/*
  Warnings:

  - You are about to drop the column `color` on the `Action` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Action" DROP COLUMN "color",
ADD COLUMN     "a" INTEGER,
ADD COLUMN     "b" INTEGER,
ADD COLUMN     "g" INTEGER,
ADD COLUMN     "r" INTEGER;
