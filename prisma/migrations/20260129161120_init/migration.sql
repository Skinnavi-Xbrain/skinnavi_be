-- CreateEnum
CREATE TYPE "user_role_enum" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "skin_type_enum" AS ENUM ('NORMAL', 'DRY', 'COMBINATION', 'SENSITIVE', 'OILY');

-- CreateEnum
CREATE TYPE "skin_metric_enum" AS ENUM ('PORES', 'ACNE', 'DARK_CIRCLES', 'DARK_SPOTS');

-- CreateEnum
CREATE TYPE "routine_time_enum" AS ENUM ('MORNING', 'EVENING');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "full_name" TEXT,
    "avatar_url" TEXT,
    "role" "user_role_enum" NOT NULL DEFAULT 'USER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skin_types" (
    "id" UUID NOT NULL,
    "code" "skin_type_enum" NOT NULL,

    CONSTRAINT "skin_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skin_analyses" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "skin_type_id" UUID NOT NULL,
    "overall_score" DECIMAL(5,2),
    "face_image_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "skin_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skin_analysis_metrics" (
    "id" UUID NOT NULL,
    "skin_analysis_id" UUID NOT NULL,
    "metric_type" "skin_metric_enum" NOT NULL,
    "score" DECIMAL(5,2),

    CONSTRAINT "skin_analysis_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "affiliate_products" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "usage_role" TEXT,
    "display_price" DECIMAL(10,2),
    "affiliate_url" TEXT NOT NULL,
    "image_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "affiliate_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skincare_combos" (
    "id" UUID NOT NULL,
    "skin_type_id" UUID NOT NULL,
    "combo_name" TEXT NOT NULL,
    "display_price" DECIMAL(10,2),
    "affiliate_url" TEXT NOT NULL,
    "image_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "skincare_combos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "combo_products" (
    "id" UUID NOT NULL,
    "combo_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "step_order" INTEGER NOT NULL,

    CONSTRAINT "combo_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routine_packages" (
    "id" UUID NOT NULL,
    "package_name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "duration_days" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "routine_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "package_allowed_combos" (
    "id" UUID NOT NULL,
    "routine_package_id" UUID NOT NULL,
    "combo_id" UUID NOT NULL,

    CONSTRAINT "package_allowed_combos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_package_subscriptions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "routine_package_id" UUID NOT NULL,
    "selected_combo_id" UUID NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_package_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_routines" (
    "id" UUID NOT NULL,
    "user_package_subscription_id" UUID NOT NULL,
    "routine_time" "routine_time_enum" NOT NULL,

    CONSTRAINT "user_routines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_routine_steps" (
    "id" UUID NOT NULL,
    "user_routine_id" UUID NOT NULL,
    "step_order" INTEGER NOT NULL,
    "instruction" TEXT,
    "product_id" UUID,

    CONSTRAINT "user_routine_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routine_daily_logs" (
    "id" UUID NOT NULL,
    "user_routine_id" UUID NOT NULL,
    "log_date" DATE NOT NULL,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "routine_daily_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "affiliate_click_logs" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "target_type" TEXT,
    "target_id" UUID,
    "clicked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "affiliate_click_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "subscription_id" UUID NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "skin_analyses" ADD CONSTRAINT "skin_analyses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skin_analyses" ADD CONSTRAINT "skin_analyses_skin_type_id_fkey" FOREIGN KEY ("skin_type_id") REFERENCES "skin_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skin_analysis_metrics" ADD CONSTRAINT "skin_analysis_metrics_skin_analysis_id_fkey" FOREIGN KEY ("skin_analysis_id") REFERENCES "skin_analyses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skincare_combos" ADD CONSTRAINT "skincare_combos_skin_type_id_fkey" FOREIGN KEY ("skin_type_id") REFERENCES "skin_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "combo_products" ADD CONSTRAINT "combo_products_combo_id_fkey" FOREIGN KEY ("combo_id") REFERENCES "skincare_combos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "combo_products" ADD CONSTRAINT "combo_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "affiliate_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_allowed_combos" ADD CONSTRAINT "package_allowed_combos_routine_package_id_fkey" FOREIGN KEY ("routine_package_id") REFERENCES "routine_packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_allowed_combos" ADD CONSTRAINT "package_allowed_combos_combo_id_fkey" FOREIGN KEY ("combo_id") REFERENCES "skincare_combos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_package_subscriptions" ADD CONSTRAINT "user_package_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_package_subscriptions" ADD CONSTRAINT "user_package_subscriptions_routine_package_id_fkey" FOREIGN KEY ("routine_package_id") REFERENCES "routine_packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_package_subscriptions" ADD CONSTRAINT "user_package_subscriptions_selected_combo_id_fkey" FOREIGN KEY ("selected_combo_id") REFERENCES "skincare_combos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_routines" ADD CONSTRAINT "user_routines_user_package_subscription_id_fkey" FOREIGN KEY ("user_package_subscription_id") REFERENCES "user_package_subscriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_routine_steps" ADD CONSTRAINT "user_routine_steps_user_routine_id_fkey" FOREIGN KEY ("user_routine_id") REFERENCES "user_routines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_routine_steps" ADD CONSTRAINT "user_routine_steps_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "affiliate_products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routine_daily_logs" ADD CONSTRAINT "routine_daily_logs_user_routine_id_fkey" FOREIGN KEY ("user_routine_id") REFERENCES "user_routines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "affiliate_click_logs" ADD CONSTRAINT "affiliate_click_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "user_package_subscriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
