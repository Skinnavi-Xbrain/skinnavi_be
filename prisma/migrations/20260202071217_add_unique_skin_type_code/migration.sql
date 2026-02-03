/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `skin_types` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "skin_types_code_key" ON "skin_types"("code");
