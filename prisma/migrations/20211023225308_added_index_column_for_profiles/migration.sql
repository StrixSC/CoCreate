/*
  Warnings:

  - A unique constraint covering the columns `[index]` on the table `Profile` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "index" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Profile_index_key" ON "Profile"("index");
