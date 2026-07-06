CREATE TABLE "Scan" (
  "id" TEXT NOT NULL,
  "addressHash" TEXT NOT NULL,
  "qes" INTEGER,
  "qci" INTEGER NOT NULL,
  "grade" TEXT,
  "gradeDisplayed" BOOLEAN NOT NULL,
  "status" TEXT NOT NULL,
  "estimatedMigrationExposureValueUsd" DOUBLE PRECISION NOT NULL,
  "qesVersion" TEXT NOT NULL,
  "qciVersion" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Scan_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WaitlistEntry" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "wallet" TEXT,
  "source" TEXT,
  "consent" BOOLEAN NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "WaitlistEntry_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AggregateMetric" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "value" DOUBLE PRECISION NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "AggregateMetric_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Scan_addressHash_idx" ON "Scan"("addressHash");
CREATE INDEX "Scan_createdAt_idx" ON "Scan"("createdAt");
CREATE UNIQUE INDEX "WaitlistEntry_email_key" ON "WaitlistEntry"("email");
CREATE INDEX "AggregateMetric_key_idx" ON "AggregateMetric"("key");
CREATE INDEX "AggregateMetric_createdAt_idx" ON "AggregateMetric"("createdAt");

