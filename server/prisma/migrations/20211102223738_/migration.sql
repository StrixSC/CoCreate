/*
  Warnings:

  - The primary key for the `Action` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `action_id` on the `Action` table. All the data in the column will be lost.
  - You are about to drop the column `action_type` on the `Action` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `Action` table. All the data in the column will be lost.
  - You are about to drop the column `db_action_id` on the `Action` table. All the data in the column will be lost.
  - You are about to drop the column `drawing_id` on the `Action` table. All the data in the column will be lost.
  - You are about to drop the column `is_selected` on the `Action` table. All the data in the column will be lost.
  - You are about to drop the column `shape_type` on the `Action` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `Action` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `Action` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[dbActionId]` on the table `Action` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `actionId` to the `Action` table without a default value. This is not possible if the table is not empty.
  - Added the required column `actionType` to the `Action` table without a default value. This is not possible if the table is not empty.
  - Added the required column `color` to the `Action` table without a default value. This is not possible if the table is not empty.
  - The required column `dbActionId` was added to the `Action` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `drawingId` to the `Action` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isSelected` to the `Action` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shapeType` to the `Action` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Action` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Action` table without a default value. This is not possible if the table is not empty.
  - Added the required column `width` to the `Action` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Action" DROP CONSTRAINT "Action_drawing_id_fkey";

-- DropForeignKey
ALTER TABLE "Action" DROP CONSTRAINT "Action_user_id_fkey";

-- DropIndex
DROP INDEX "Action_db_action_id_key";

-- AlterTable
ALTER TABLE "Action" DROP CONSTRAINT "Action_pkey",
DROP COLUMN "action_id",
DROP COLUMN "action_type",
DROP COLUMN "created_at",
DROP COLUMN "db_action_id",
DROP COLUMN "drawing_id",
DROP COLUMN "is_selected",
DROP COLUMN "shape_type",
DROP COLUMN "updated_at",
DROP COLUMN "user_id",
ADD COLUMN     "actionId" TEXT NOT NULL,
ADD COLUMN     "actionType" "ActionType" NOT NULL,
ADD COLUMN     "color" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "dbActionId" TEXT NOT NULL,
ADD COLUMN     "drawingId" TEXT NOT NULL,
ADD COLUMN     "isSelected" BOOLEAN NOT NULL,
ADD COLUMN     "shapeType" "ShapeType" NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL,
ADD COLUMN     "width" DOUBLE PRECISION NOT NULL,
ADD CONSTRAINT "Action_pkey" PRIMARY KEY ("dbActionId");

-- CreateIndex
CREATE UNIQUE INDEX "Action_dbActionId_key" ON "Action"("dbActionId");

-- AddForeignKey
ALTER TABLE "Action" ADD CONSTRAINT "Action_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Action" ADD CONSTRAINT "Action_drawingId_fkey" FOREIGN KEY ("drawingId") REFERENCES "Drawing"("drawing_id") ON DELETE CASCADE ON UPDATE CASCADE;
