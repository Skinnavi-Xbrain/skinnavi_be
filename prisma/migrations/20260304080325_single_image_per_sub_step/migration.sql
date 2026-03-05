/*
  Warnings:

  - You are about to drop the column `image_urls` on the `user_routine_sub_steps` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user_routine_sub_steps" DROP COLUMN "image_urls",
ADD COLUMN     "image_url" TEXT;
