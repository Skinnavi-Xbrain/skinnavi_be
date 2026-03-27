/*
  Warnings:

  - You are about to drop the column `weekly_scan_limit` on the `routine_packages` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "routine_packages" DROP COLUMN "weekly_scan_limit",
ADD COLUMN     "total_scan_limit" INTEGER NOT NULL DEFAULT 1;
