-- CreateEnum
CREATE TYPE "ShapeStyle" AS ENUM ('center', 'border', 'fill');

-- AlterTable
ALTER TABLE "Action" ADD COLUMN     "aFill" INTEGER,
ADD COLUMN     "bFill" INTEGER,
ADD COLUMN     "gFill" INTEGER,
ADD COLUMN     "rFill" INTEGER,
ADD COLUMN     "shapeStyle" "ShapeStyle" DEFAULT E'border',
ADD COLUMN     "shapeType" "ShapeType" DEFAULT E'Null',
ADD COLUMN     "x2" DOUBLE PRECISION,
ADD COLUMN     "y2" DOUBLE PRECISION;
