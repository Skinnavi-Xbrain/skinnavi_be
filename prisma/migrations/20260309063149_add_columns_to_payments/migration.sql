/*
  Warnings:

  - The `status` column on the `payments` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "payment_status_enum" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "vnp_OrderInfo" TEXT,
ADD COLUMN     "vnp_TransactionNo" TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" "payment_status_enum" NOT NULL DEFAULT 'PENDING';
