-- CreateEnum
CREATE TYPE "MemberType" AS ENUM ('Owner', 'Regular');

-- CreateTable
CREATE TABLE "Channel" (
    "index" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "channel_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "collaboration_id" TEXT,

    CONSTRAINT "Channel_pkey" PRIMARY KEY ("channel_id")
);

-- CreateTable
CREATE TABLE "ChannelMember" (
    "index" SERIAL NOT NULL,
    "channel_id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "MemberType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChannelMember_pkey" PRIMARY KEY ("member_id")
);

-- CreateTable
CREATE TABLE "Message" (
    "index" SERIAL NOT NULL,
    "message_id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "message_data" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("message_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Channel_index_key" ON "Channel"("index");

-- CreateIndex
CREATE UNIQUE INDEX "Channel_name_key" ON "Channel"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Channel_channel_id_key" ON "Channel"("channel_id");

-- CreateIndex
CREATE UNIQUE INDEX "ChannelMember_index_key" ON "ChannelMember"("index");

-- CreateIndex
CREATE UNIQUE INDEX "ChannelMember_member_id_key" ON "ChannelMember"("member_id");

-- CreateIndex
CREATE UNIQUE INDEX "Message_index_key" ON "Message"("index");

-- CreateIndex
CREATE UNIQUE INDEX "Message_message_id_key" ON "Message"("message_id");

-- AddForeignKey
ALTER TABLE "ChannelMember" ADD CONSTRAINT "ChannelMember_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelMember" ADD CONSTRAINT "ChannelMember_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "Channel"("channel_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "ChannelMember"("member_id") ON DELETE RESTRICT ON UPDATE CASCADE;
