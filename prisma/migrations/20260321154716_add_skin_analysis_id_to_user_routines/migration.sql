-- AlterTable
ALTER TABLE "user_routines" ADD COLUMN     "skin_analysis_id" UUID;

-- AddForeignKey
ALTER TABLE "user_routines" ADD CONSTRAINT "user_routines_skin_analysis_id_fkey" FOREIGN KEY ("skin_analysis_id") REFERENCES "skin_analyses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
