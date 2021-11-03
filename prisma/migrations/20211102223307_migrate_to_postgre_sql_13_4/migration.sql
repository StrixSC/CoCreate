/*
  Warnings:

  - Added the required column `updated_at` to the `Account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Action` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `ChannelMember` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Log` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Profile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Stats` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Action" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Channel" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ChannelMember" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Drawing" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Log" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Stats" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "CollaborationMember" (
    "collaboration_member_id" TEXT NOT NULL,
    "index" SERIAL NOT NULL,
    "type" "MemberType" NOT NULL,
    "collaboration_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CollaborationMember_pkey" PRIMARY KEY ("collaboration_member_id")
);

-- CreateTable
CREATE TABLE "Collaboration" (
    "index" SERIAL NOT NULL,
    "collaboration_id" TEXT NOT NULL,
    "drawing_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Collaboration_pkey" PRIMARY KEY ("collaboration_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CollaborationMember_collaboration_member_id_key" ON "CollaborationMember"("collaboration_member_id");

-- CreateIndex
CREATE UNIQUE INDEX "CollaborationMember_index_key" ON "CollaborationMember"("index");

-- CreateIndex
CREATE UNIQUE INDEX "Collaboration_index_key" ON "Collaboration"("index");

-- CreateIndex
CREATE UNIQUE INDEX "Collaboration_collaboration_id_key" ON "Collaboration"("collaboration_id");

-- CreateIndex
CREATE UNIQUE INDEX "Collaboration_drawing_id_key" ON "Collaboration"("drawing_id");

-- AddForeignKey
ALTER TABLE "Drawing" ADD CONSTRAINT "Drawing_collaboration_id_fkey" FOREIGN KEY ("collaboration_id") REFERENCES "Collaboration"("collaboration_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollaborationMember" ADD CONSTRAINT "CollaborationMember_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollaborationMember" ADD CONSTRAINT "CollaborationMember_collaboration_id_fkey" FOREIGN KEY ("collaboration_id") REFERENCES "Collaboration"("collaboration_id") ON DELETE CASCADE ON UPDATE CASCADE;
