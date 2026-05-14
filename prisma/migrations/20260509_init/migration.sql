-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "SubscriberStatus" AS ENUM ('PENDING', 'ACTIVE', 'PAUSED', 'UNSUBSCRIBED');

-- CreateEnum
CREATE TYPE "HumorMode" AS ENUM ('MILD_HUMOR', 'VERY_DRY', 'DAD_JOKE', 'STRAIGHT');

-- CreateEnum
CREATE TYPE "LifestyleMode" AS ENUM ('DRIVES', 'WALKS_TRANSIT');

-- CreateEnum
CREATE TYPE "DeliveryHour" AS ENUM ('SIX_AM', 'SEVEN_AM', 'EIGHT_AM');

-- CreateEnum
CREATE TYPE "MeasurementSystem" AS ENUM ('IMPERIAL', 'METRIC');

-- CreateEnum
CREATE TYPE "BriefingStatus" AS ENUM ('DRAFT', 'READY', 'SENT', 'FAILED', 'SKIPPED_SAFETY_MODE');

-- CreateEnum
CREATE TYPE "JobKind" AS ENUM ('FORECAST_REFRESH', 'DAILY_BRIEF_GENERATION', 'DAILY_SEND');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('PENDING', 'RUNNING', 'SUCCEEDED', 'FAILED');

-- CreateTable
CREATE TABLE "Subscriber" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT,
    "zipCode" TEXT NOT NULL,
    "timeZone" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "status" "SubscriberStatus" NOT NULL DEFAULT 'ACTIVE',
    "humorMode" "HumorMode" NOT NULL DEFAULT 'MILD_HUMOR',
    "lifestyleMode" "LifestyleMode" NOT NULL DEFAULT 'DRIVES',
    "deliveryHour" "DeliveryHour" NOT NULL DEFAULT 'SEVEN_AM',
    "measurementSystem" "MeasurementSystem" NOT NULL DEFAULT 'IMPERIAL',
    "referralCode" TEXT NOT NULL,
    "referredById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscriber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ForecastSnapshot" (
    "id" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "timeZone" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "forecastDateLocal" TIMESTAMP(3) NOT NULL,
    "source" TEXT NOT NULL,
    "sourceRunAt" TIMESTAMP(3) NOT NULL,
    "normalizedForecast" JSONB NOT NULL,
    "normalizedAlerts" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ForecastSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyBriefing" (
    "id" TEXT NOT NULL,
    "subscriberId" TEXT NOT NULL,
    "forecastSnapshotId" TEXT,
    "localSendDate" TIMESTAMP(3) NOT NULL,
    "status" "BriefingStatus" NOT NULL DEFAULT 'DRAFT',
    "subjectLine" TEXT NOT NULL,
    "previewText" TEXT,
    "weatherSummary" JSONB NOT NULL,
    "renderedSections" JSONB NOT NULL,
    "renderedHtml" TEXT,
    "renderedText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyBriefing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobRun" (
    "id" TEXT NOT NULL,
    "kind" "JobKind" NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'PENDING',
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "scope" JSONB,
    "detail" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Subscriber_email_key" ON "Subscriber"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Subscriber_referralCode_key" ON "Subscriber"("referralCode");

-- CreateIndex
CREATE INDEX "Subscriber_zipCode_timeZone_idx" ON "Subscriber"("zipCode", "timeZone");

-- CreateIndex
CREATE INDEX "Subscriber_status_idx" ON "Subscriber"("status");

-- CreateIndex
CREATE INDEX "ForecastSnapshot_forecastDateLocal_idx" ON "ForecastSnapshot"("forecastDateLocal");

-- CreateIndex
CREATE UNIQUE INDEX "ForecastSnapshot_zipCode_forecastDateLocal_key" ON "ForecastSnapshot"("zipCode", "forecastDateLocal");

-- CreateIndex
CREATE INDEX "DailyBriefing_status_localSendDate_idx" ON "DailyBriefing"("status", "localSendDate");

-- CreateIndex
CREATE UNIQUE INDEX "DailyBriefing_subscriberId_localSendDate_key" ON "DailyBriefing"("subscriberId", "localSendDate");

-- CreateIndex
CREATE INDEX "JobRun_kind_status_idx" ON "JobRun"("kind", "status");

-- AddForeignKey
ALTER TABLE "Subscriber" ADD CONSTRAINT "Subscriber_referredById_fkey" FOREIGN KEY ("referredById") REFERENCES "Subscriber"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyBriefing" ADD CONSTRAINT "DailyBriefing_subscriberId_fkey" FOREIGN KEY ("subscriberId") REFERENCES "Subscriber"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyBriefing" ADD CONSTRAINT "DailyBriefing_forecastSnapshotId_fkey" FOREIGN KEY ("forecastSnapshotId") REFERENCES "ForecastSnapshot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

