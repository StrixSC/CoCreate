/*
  Warnings:

  - You are about to drop the column `color` on the `Action` table. All the data in the column will be lost.
  - You are about to drop the column `drawingId` on the `Action` table. All the data in the column will be lost.
  - You are about to drop the column `isSelected` on the `Action` table. All the data in the column will be lost.
  - You are about to drop the column `shapeType` on the `Action` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `Action` table. All the data in the column will be lost.
  - You are about to drop the column `width` on the `Action` table. All the data in the column will be lost.
  - You are about to drop the column `x` on the `Action` table. All the data in the column will be lost.
  - You are about to drop the column `y` on the `Action` table. All the data in the column will be lost.
  - Added the required column `collaborationId` to the `Action` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Action" DROP CONSTRAINT "Action_drawingId_fkey";

-- AlterTable
ALTER TABLE "Action" DROP COLUMN "color",
DROP COLUMN "drawingId",
DROP COLUMN "isSelected",
DROP COLUMN "shapeType",
DROP COLUMN "state",
DROP COLUMN "width",
DROP COLUMN "x",
DROP COLUMN "y",
ADD COLUMN     "collaborationId" TEXT NOT NULL,
ALTER COLUMN "actionType" DROP DEFAULT;

-- CreateTable
CREATE TABLE "FreedrawAction" (
    "actionId" TEXT NOT NULL,
    "x" DOUBLE PRECISION NOT NULL,
    "y" DOUBLE PRECISION NOT NULL,
    "color" INTEGER NOT NULL,
    "isSelected" BOOLEAN NOT NULL,
    "width" DOUBLE PRECISION NOT NULL,
    "state" "ActionState" NOT NULL
);

-- CreateTable
CREATE TABLE "ShapeAction" (
    "actionId" TEXT NOT NULL,
    "shapeActionId" TEXT NOT NULL,

    CONSTRAINT "ShapeAction_pkey" PRIMARY KEY ("shapeActionId")
);

-- CreateIndex
CREATE UNIQUE INDEX "FreedrawAction_actionId_key" ON "FreedrawAction"("actionId");

-- CreateIndex
CREATE UNIQUE INDEX "ShapeAction_actionId_key" ON "ShapeAction"("actionId");

-- CreateIndex
CREATE UNIQUE INDEX "ShapeAction_shapeActionId_key" ON "ShapeAction"("shapeActionId");

-- AddForeignKey
ALTER TABLE "Action" ADD CONSTRAINT "Action_collaborationId_fkey" FOREIGN KEY ("collaborationId") REFERENCES "Collaboration"("collaboration_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FreedrawAction" ADD CONSTRAINT "FreedrawAction_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "Action"("dbActionId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShapeAction" ADD CONSTRAINT "ShapeAction_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "Action"("dbActionId") ON DELETE CASCADE ON UPDATE CASCADE;
