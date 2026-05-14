CREATE TABLE "ChildProfile" (
    "id" TEXT NOT NULL,
    "subscriberId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "reportedAgeYears" INTEGER NOT NULL,
    "ageRecordedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChildProfile_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ChildProfile_subscriberId_sortOrder_key" ON "ChildProfile"("subscriberId", "sortOrder");
CREATE INDEX "ChildProfile_subscriberId_idx" ON "ChildProfile"("subscriberId");

ALTER TABLE "ChildProfile" ADD CONSTRAINT "ChildProfile_subscriberId_fkey" FOREIGN KEY ("subscriberId") REFERENCES "Subscriber"("id") ON DELETE CASCADE ON UPDATE CASCADE;
