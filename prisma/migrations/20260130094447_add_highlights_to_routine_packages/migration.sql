/*
  Warnings:

  - Added the required column `highlights` to the `routine_packages` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "routine_packages" ADD COLUMN     "highlights" JSONB NOT NULL;
