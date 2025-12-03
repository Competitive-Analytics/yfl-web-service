-- CreateEnum
CREATE TYPE "PredictionType" AS ENUM ('INDIVIDUAL', 'GROUP');

-- AlterTable
ALTER TABLE "Forecast" ADD COLUMN     "predictionType" "PredictionType" NOT NULL DEFAULT 'INDIVIDUAL';
