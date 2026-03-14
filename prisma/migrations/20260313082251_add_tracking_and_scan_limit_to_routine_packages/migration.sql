/*
  Warnings:

  - Added the required column `allow_tracking` to the `routine_packages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `weekly_scan_limit` to the `routine_packages` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "routine_packages" ADD COLUMN     "allow_tracking" BOOLEAN NOT NULL,
ADD COLUMN     "weekly_scan_limit" INTEGER NOT NULL;
