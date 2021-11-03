/*
  Warnings:

  - You are about to drop the `FreedrawAction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ShapeAction` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "FreedrawAction" DROP CONSTRAINT "FreedrawAction_actionId_fkey";

-- DropForeignKey
ALTER TABLE "ShapeAction" DROP CONSTRAINT "ShapeAction_actionId_fkey";

-- AlterTable
ALTER TABLE "Action" ADD COLUMN     "color" INTEGER,
ADD COLUMN     "isSelected" BOOLEAN,
ADD COLUMN     "state" "ActionState",
ADD COLUMN     "width" DOUBLE PRECISION,
ADD COLUMN     "x" DOUBLE PRECISION,
ADD COLUMN     "y" DOUBLE PRECISION;

-- DropTable
DROP TABLE "FreedrawAction";

-- DropTable
DROP TABLE "ShapeAction";
