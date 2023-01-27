/*
  Warnings:

  - Made the column `user_id` on table `Avatar` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `author_id` to the `Collaboration` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TeamType" AS ENUM ('Protected', 'Public');

-- DropForeignKey
ALTER TABLE "Avatar" DROP CONSTRAINT "Avatar_user_id_fkey";

-- AlterTable
ALTER TABLE "Avatar" ALTER COLUMN "user_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "Collaboration" ADD COLUMN     "author_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Team" (
    "index" SERIAL NOT NULL,
    "team_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "team_name" TEXT NOT NULL,
    "bio" TEXT NOT NULL DEFAULT E'',
    "max_member_count" INTEGER NOT NULL DEFAULT 4,
    "type" "TeamType" NOT NULL,
    "password" TEXT DEFAULT E'',

    CONSTRAINT "Team_pkey" PRIMARY KEY ("team_id")
);

-- CreateTable
CREATE TABLE "TeamMember" (
    "index" SERIAL NOT NULL,
    "team_member_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "type" "MemberType" NOT NULL DEFAULT E'Regular',

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("team_member_id")
);

-- CreateTable
CREATE TABLE "Author" (
    "index" SERIAL NOT NULL,
    "author_id" TEXT NOT NULL,
    "is_team" BOOLEAN NOT NULL,
    "team_id" TEXT,
    "user_id" TEXT,

    CONSTRAINT "Author_pkey" PRIMARY KEY ("author_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Team_index_key" ON "Team"("index");

-- CreateIndex
CREATE UNIQUE INDEX "Team_team_id_key" ON "Team"("team_id");

-- CreateIndex
CREATE UNIQUE INDEX "Team_team_name_key" ON "Team"("team_name");

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_index_key" ON "TeamMember"("index");

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_team_member_id_key" ON "TeamMember"("team_member_id");

-- CreateIndex
CREATE UNIQUE INDEX "Author_index_key" ON "Author"("index");

-- CreateIndex
CREATE UNIQUE INDEX "Author_author_id_key" ON "Author"("author_id");

-- AddForeignKey
ALTER TABLE "Avatar" ADD CONSTRAINT "Avatar_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collaboration" ADD CONSTRAINT "Collaboration_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "Author"("author_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "Team"("team_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Author" ADD CONSTRAINT "Author_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Author" ADD CONSTRAINT "Author_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "Team"("team_id") ON DELETE CASCADE ON UPDATE CASCADE;
