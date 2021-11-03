/*
  Warnings:

  - The `color` column on the `Action` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Action" ALTER COLUMN "x" SET DEFAULT 0,
ALTER COLUMN "y" SET DEFAULT 0,
ALTER COLUMN "state" SET DEFAULT E'down',
ALTER COLUMN "actionType" SET DEFAULT E'Freedraw',
DROP COLUMN "color",
ADD COLUMN     "color" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "isSelected" SET DEFAULT false,
ALTER COLUMN "shapeType" SET DEFAULT E'Null',
ALTER COLUMN "width" SET DEFAULT 1.0;
