/*
  Warnings:

  - You are about to drop the column `active_team_count` on the `Stats` table. All the data in the column will be lost.
  - You are about to drop the column `author_count` on the `Stats` table. All the data in the column will be lost.
  - You are about to drop the column `average_collaboration_time` on the `Stats` table. All the data in the column will be lost.
  - You are about to drop the column `collaboration_count` on the `Stats` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Stats" DROP COLUMN "active_team_count",
DROP COLUMN "author_count",
DROP COLUMN "average_collaboration_time",
DROP COLUMN "collaboration_count";
