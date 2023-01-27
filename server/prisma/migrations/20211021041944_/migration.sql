/*
  Warnings:

  - A unique constraint covering the columns `[index]` on the table `Log` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[index]` on the table `Stats` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[index]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[is_logged_in]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Log" ADD COLUMN     "index" SERIAL NOT NULL,
ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Stats" ADD COLUMN     "index" SERIAL NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "index" SERIAL NOT NULL,
ADD COLUMN     "is_logged_in" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "Log_index_key" ON "Log"("index");

-- CreateIndex
CREATE UNIQUE INDEX "Stats_index_key" ON "Stats"("index");

-- CreateIndex
CREATE UNIQUE INDEX "User_index_key" ON "User"("index");

-- CreateIndex
CREATE UNIQUE INDEX "User_is_logged_in_key" ON "User"("is_logged_in");
