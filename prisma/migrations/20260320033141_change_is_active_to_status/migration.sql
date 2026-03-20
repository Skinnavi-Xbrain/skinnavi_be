/*
  Warnings:

  - You are about to drop the column `is_active` on the `user_package_subscriptions` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "subscription_status_enum" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELED');

-- AlterTable
ALTER TABLE "user_package_subscriptions" DROP COLUMN "is_active",
ADD COLUMN     "status" "subscription_status_enum" NOT NULL DEFAULT 'ACTIVE';
