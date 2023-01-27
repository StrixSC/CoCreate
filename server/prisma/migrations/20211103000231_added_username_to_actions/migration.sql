/*
  Warnings:

  - Added the required column `username` to the `Action` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Action" ADD COLUMN     "username" TEXT NOT NULL;
