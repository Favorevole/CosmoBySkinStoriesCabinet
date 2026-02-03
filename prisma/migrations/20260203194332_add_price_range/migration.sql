-- CreateEnum
CREATE TYPE "PriceRange" AS ENUM ('UP_TO_5000', 'UP_TO_10000', 'UP_TO_20000');

-- AlterTable
ALTER TABLE "applications" ADD COLUMN "price_range" "PriceRange";
