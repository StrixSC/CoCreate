-- CreateEnum
CREATE TYPE "ActionState" AS ENUM ('move', 'up', 'down');

-- CreateEnum
CREATE TYPE "ShapeType" AS ENUM ('Rectangle', 'Ellipse');

-- CreateEnum
CREATE TYPE "ActionType" AS ENUM ('Freedraw', 'Shape', 'Select', 'Translate', 'Rotate', 'Delete', 'Resize', 'Text', 'Layer', 'UndoRedo');

-- CreateTable
CREATE TABLE "Drawing" (
    "index" SERIAL NOT NULL,
    "drawing_id" TEXT NOT NULL,
    "thumbnail_url" TEXT NOT NULL DEFAULT E'',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "collaboration_id" TEXT NOT NULL,

    CONSTRAINT "Drawing_pkey" PRIMARY KEY ("drawing_id")
);

-- CreateTable
CREATE TABLE "Action" (
    "index" SERIAL NOT NULL,
    "action_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "drawing_id" TEXT NOT NULL,
    "x" DOUBLE PRECISION NOT NULL,
    "y" DOUBLE PRECISION NOT NULL,
    "is_selected" BOOLEAN NOT NULL,
    "state" "ActionState" NOT NULL,
    "shape_type" "ShapeType" NOT NULL,
    "action_type" "ActionType" NOT NULL,

    CONSTRAINT "Action_pkey" PRIMARY KEY ("action_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Drawing_index_key" ON "Drawing"("index");

-- CreateIndex
CREATE UNIQUE INDEX "Drawing_drawing_id_key" ON "Drawing"("drawing_id");

-- CreateIndex
CREATE UNIQUE INDEX "Drawing_collaboration_id_key" ON "Drawing"("collaboration_id");

-- CreateIndex
CREATE UNIQUE INDEX "Action_index_key" ON "Action"("index");

-- CreateIndex
CREATE UNIQUE INDEX "Action_action_id_key" ON "Action"("action_id");

-- AddForeignKey
ALTER TABLE "Action" ADD CONSTRAINT "Action_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Action" ADD CONSTRAINT "Action_drawing_id_fkey" FOREIGN KEY ("drawing_id") REFERENCES "Drawing"("drawing_id") ON DELETE CASCADE ON UPDATE CASCADE;
