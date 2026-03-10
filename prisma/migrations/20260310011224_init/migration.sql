-- CreateEnum
CREATE TYPE "SubscriberStatus" AS ENUM ('PENDING', 'ACTIVE', 'UNSUBSCRIBED', 'BOUNCED');

-- CreateEnum
CREATE TYPE "SendStatus" AS ENUM ('QUEUED', 'SENT', 'FAILED', 'BOUNCED', 'OPENED', 'CLICKED');

-- CreateEnum
CREATE TYPE "Tone" AS ENUM ('MILD', 'DRY', 'DAD_JOKE', 'STRAIGHT');

-- CreateEnum
CREATE TYPE "LifestyleMode" AS ENUM ('DRIVE', 'WALK');

-- CreateEnum
CREATE TYPE "Units" AS ENUM ('F', 'C');

-- CreateTable
CREATE TABLE "subscribers" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "zip" VARCHAR(10) NOT NULL,
    "name" TEXT,
    "delivery_hour" SMALLINT NOT NULL DEFAULT 7,
    "timezone" TEXT NOT NULL,
    "status" "SubscriberStatus" NOT NULL DEFAULT 'PENDING',
    "confirm_token" TEXT,
    "unsubscribe_token" TEXT NOT NULL,
    "magic_token" TEXT,
    "magic_token_exp" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmed_at" TIMESTAMPTZ,
    "unsubscribed_at" TIMESTAMPTZ,

    CONSTRAINT "subscribers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "preferences" (
    "id" UUID NOT NULL,
    "subscriber_id" UUID NOT NULL,
    "tone" "Tone" NOT NULL DEFAULT 'MILD',
    "lifestyle_mode" "LifestyleMode" NOT NULL DEFAULT 'WALK',
    "units" "Units" NOT NULL DEFAULT 'F',
    "activities" TEXT[],
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zip_codes" (
    "zip" VARCHAR(10) NOT NULL,
    "city" TEXT NOT NULL,
    "state" CHAR(2) NOT NULL,
    "lat" DECIMAL(65,30) NOT NULL,
    "lng" DECIMAL(65,30) NOT NULL,
    "timezone" TEXT NOT NULL,

    CONSTRAINT "zip_codes_pkey" PRIMARY KEY ("zip")
);

-- CreateTable
CREATE TABLE "weather_cache" (
    "id" UUID NOT NULL,
    "zip" VARCHAR(10) NOT NULL,
    "fetched_for_date" DATE NOT NULL,
    "raw_json" JSONB NOT NULL,
    "nws_alerts_json" JSONB,
    "fetched_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "weather_cache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "send_logs" (
    "id" UUID NOT NULL,
    "subscriber_id" UUID NOT NULL,
    "sent_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_for" DATE NOT NULL,
    "zip" VARCHAR(10) NOT NULL,
    "sendgrid_msg_id" TEXT,
    "status" "SendStatus" NOT NULL DEFAULT 'QUEUED',
    "opens" SMALLINT NOT NULL DEFAULT 0,
    "clicks" SMALLINT NOT NULL DEFAULT 0,
    "error_message" TEXT,

    CONSTRAINT "send_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_events" (
    "id" UUID NOT NULL,
    "sendgrid_msg_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "occurred_at" TIMESTAMPTZ NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "email_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subscribers_email_key" ON "subscribers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "subscribers_confirm_token_key" ON "subscribers"("confirm_token");

-- CreateIndex
CREATE UNIQUE INDEX "subscribers_unsubscribe_token_key" ON "subscribers"("unsubscribe_token");

-- CreateIndex
CREATE UNIQUE INDEX "subscribers_magic_token_key" ON "subscribers"("magic_token");

-- CreateIndex
CREATE INDEX "subscribers_status_timezone_delivery_hour_idx" ON "subscribers"("status", "timezone", "delivery_hour");

-- CreateIndex
CREATE UNIQUE INDEX "preferences_subscriber_id_key" ON "preferences"("subscriber_id");

-- CreateIndex
CREATE UNIQUE INDEX "weather_cache_zip_fetched_for_date_key" ON "weather_cache"("zip", "fetched_for_date");

-- CreateIndex
CREATE INDEX "send_logs_subscriber_id_date_for_idx" ON "send_logs"("subscriber_id", "date_for");

-- AddForeignKey
ALTER TABLE "preferences" ADD CONSTRAINT "preferences_subscriber_id_fkey" FOREIGN KEY ("subscriber_id") REFERENCES "subscribers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "send_logs" ADD CONSTRAINT "send_logs_subscriber_id_fkey" FOREIGN KEY ("subscriber_id") REFERENCES "subscribers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
