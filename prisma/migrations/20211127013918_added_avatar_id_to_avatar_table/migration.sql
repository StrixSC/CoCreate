/*
  Warnings:

  - A unique constraint covering the columns `[avatar_id]` on the table `Avatar` will be added. If there are existing duplicate values, this will fail.
  - The required column `avatar_id` was added to the `Avatar` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "Avatar" ADD COLUMN     "avatar_id" TEXT NOT NULL,
ADD CONSTRAINT "Avatar_pkey" PRIMARY KEY ("avatar_id");

-- CreateIndex
CREATE UNIQUE INDEX "Avatar_avatar_id_key" ON "Avatar"("avatar_id");
