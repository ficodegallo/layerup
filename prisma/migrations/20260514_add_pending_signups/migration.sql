CREATE TABLE "PendingSignup" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT,
    "zipCode" TEXT NOT NULL,
    "timeZone" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "deliveryHour" "DeliveryHour" NOT NULL DEFAULT 'SEVEN_AM',
    "children" JSONB NOT NULL,
    "verificationTokenHash" TEXT NOT NULL,
    "verificationTokenExpiresAt" TIMESTAMP(3) NOT NULL,
    "lastVerificationSentAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PendingSignup_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PendingSignup_email_key" ON "PendingSignup"("email");

CREATE UNIQUE INDEX "PendingSignup_verificationTokenHash_key" ON "PendingSignup"("verificationTokenHash");

CREATE INDEX "PendingSignup_verificationTokenExpiresAt_idx" ON "PendingSignup"("verificationTokenExpiresAt");
