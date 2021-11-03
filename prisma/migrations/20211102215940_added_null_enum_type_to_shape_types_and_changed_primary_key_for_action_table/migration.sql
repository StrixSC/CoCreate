/*
  Warnings:

  - The primary key for the `Action` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[db_action_id]` on the table `Action` will be added. If there are existing duplicate values, this will fail.
  - The required column `db_action_id` was added to the `Action` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterEnum
ALTER TYPE "ShapeType" ADD VALUE 'Null';

-- DropIndex
DROP INDEX "Action_action_id_key";

-- AlterTable
ALTER TABLE "Action" DROP CONSTRAINT "Action_pkey",
ADD COLUMN     "db_action_id" TEXT NOT NULL,
ADD CONSTRAINT "Action_pkey" PRIMARY KEY ("db_action_id");

-- CreateIndex
CREATE UNIQUE INDEX "Action_db_action_id_key" ON "Action"("db_action_id");
