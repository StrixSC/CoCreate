-- CreateEnum
CREATE TYPE "ChannelType" AS ENUM ('Private', 'Public');

-- AlterTable
ALTER TABLE "Channel" ADD COLUMN     "type" "ChannelType" NOT NULL DEFAULT E'Public';
