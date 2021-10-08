-- CreateEnum
CREATE TYPE "LogType" AS ENUM ('Connection', 'Disconnection', 'DrawingUpdate');

-- CreateTable
CREATE TABLE "User" (
    "user_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "profile_id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "avatarUrl" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("profile_id")
);

-- CreateTable
CREATE TABLE "Account" (
    "account_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("account_id")
);

-- CreateTable
CREATE TABLE "Stats" (
    "stats_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "collaboration_count" INTEGER NOT NULL,
    "author_count" INTEGER NOT NULL,
    "active_team_count" INTEGER NOT NULL,
    "average_collaboration_time" DOUBLE PRECISION NOT NULL,
    "total_collaboration_time" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Stats_pkey" PRIMARY KEY ("stats_id")
);

-- CreateTable
CREATE TABLE "Log" (
    "log_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "LogType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "drawing_id" TEXT,

    CONSTRAINT "Log_pkey" PRIMARY KEY ("log_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_user_id_key" ON "User"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_profile_id_key" ON "Profile"("profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_username_key" ON "Profile"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_user_id_key" ON "Profile"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Account_account_id_key" ON "Account"("account_id");

-- CreateIndex
CREATE UNIQUE INDEX "Account_user_id_key" ON "Account"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Stats_stats_id_key" ON "Stats"("stats_id");

-- CreateIndex
CREATE UNIQUE INDEX "Stats_user_id_key" ON "Stats"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Log_log_id_key" ON "Log"("log_id");

-- CreateIndex
CREATE UNIQUE INDEX "Log_user_id_key" ON "Log"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Log_drawing_id_key" ON "Log"("drawing_id");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stats" ADD CONSTRAINT "Stats_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
