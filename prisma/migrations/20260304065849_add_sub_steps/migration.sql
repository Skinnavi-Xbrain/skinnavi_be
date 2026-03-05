-- CreateTable
CREATE TABLE "user_routine_sub_steps" (
    "id" UUID NOT NULL,
    "user_routine_step_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "how_to" TEXT,
    "image_urls" TEXT[],

    CONSTRAINT "user_routine_sub_steps_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "user_routine_sub_steps" ADD CONSTRAINT "user_routine_sub_steps_user_routine_step_id_fkey" FOREIGN KEY ("user_routine_step_id") REFERENCES "user_routine_steps"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
