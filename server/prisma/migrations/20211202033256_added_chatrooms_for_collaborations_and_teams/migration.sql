/*
  Warnings:

  - The values [Private] on the enum `ChannelType` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[channel_id]` on the table `Collaboration` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[channel_id]` on the table `Team` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `channel_id` to the `Collaboration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `channel_id` to the `Team` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ChannelType_new" AS ENUM ('Collaboration', 'Team', 'Public');
ALTER TABLE "Channel" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "Channel" ALTER COLUMN "type" TYPE "ChannelType_new" USING ("type"::text::"ChannelType_new");
ALTER TYPE "ChannelType" RENAME TO "ChannelType_old";
ALTER TYPE "ChannelType_new" RENAME TO "ChannelType";
DROP TYPE "ChannelType_old";
ALTER TABLE "Channel" ALTER COLUMN "type" SET DEFAULT 'Public';
COMMIT;

-- AlterTable
ALTER TABLE "Channel" ADD COLUMN     "team_id" TEXT DEFAULT E'',
ALTER COLUMN "collaboration_id" SET DEFAULT E'';

-- AlterTable
ALTER TABLE "Collaboration" ADD COLUMN     "channel_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "channel_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Collaboration_channel_id_key" ON "Collaboration"("channel_id");

-- CreateIndex
CREATE UNIQUE INDEX "Team_channel_id_key" ON "Team"("channel_id");

-- AddForeignKey
ALTER TABLE "Collaboration" ADD CONSTRAINT "Collaboration_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "Channel"("channel_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "Channel"("channel_id") ON DELETE RESTRICT ON UPDATE CASCADE;
