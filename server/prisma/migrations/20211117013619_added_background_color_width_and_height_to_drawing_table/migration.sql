-- AlterTable
ALTER TABLE "Drawing" ADD COLUMN     "background_color" TEXT NOT NULL DEFAULT E'#FFFFFF',
ADD COLUMN     "height" INTEGER NOT NULL DEFAULT 752,
ADD COLUMN     "width" INTEGER NOT NULL DEFAULT 1280;
