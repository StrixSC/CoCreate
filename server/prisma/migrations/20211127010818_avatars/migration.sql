-- CreateTable
CREATE TABLE "Avatar" (
    "index" SERIAL NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "user_id" TEXT NOT NULL,
    "avatar_url" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Avatar_index_key" ON "Avatar"("index");

-- AddForeignKey
ALTER TABLE "Avatar" ADD CONSTRAINT "Avatar_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
