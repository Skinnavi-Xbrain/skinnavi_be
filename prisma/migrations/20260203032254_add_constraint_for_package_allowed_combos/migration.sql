/*
  Warnings:

  - A unique constraint covering the columns `[routine_package_id,combo_id]` on the table `package_allowed_combos` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "package_allowed_combos_routine_package_id_combo_id_key" ON "package_allowed_combos"("routine_package_id", "combo_id");
