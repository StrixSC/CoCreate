-- DropForeignKey
ALTER TABLE "Avatar" DROP CONSTRAINT "Avatar_user_id_fkey";

-- AlterTable
ALTER TABLE "Avatar" ALTER COLUMN "user_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Avatar" ADD CONSTRAINT "Avatar_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
