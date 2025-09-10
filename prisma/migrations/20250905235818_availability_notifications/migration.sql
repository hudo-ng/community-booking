/*
  Warnings:

  - A unique constraint covering the columns `[idempotencyKey]` on the table `Booking` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Booking" ADD COLUMN     "idempotencyKey" TEXT;

-- AlterTable
ALTER TABLE "public"."Service" ADD COLUMN     "defaultDurationMins" INTEGER DEFAULT 60;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "timezone" TEXT NOT NULL DEFAULT 'America/Edmonton';

-- CreateTable
CREATE TABLE "public"."AvailabilityRules" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "weekday" INTEGER NOT NULL,
    "startLocal" TEXT NOT NULL,
    "endLocal" TEXT NOT NULL,
    "slotMins" INTEGER NOT NULL DEFAULT 60,

    CONSTRAINT "AvailabilityRules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TimeOff" (
    "id" TEXT NOT NULL,
    "startTimeUtc" TIMESTAMP(3) NOT NULL,
    "endTimeUtc" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "providerId" TEXT NOT NULL,

    CONSTRAINT "TimeOff_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Booking_idempotencyKey_key" ON "public"."Booking"("idempotencyKey");

-- AddForeignKey
ALTER TABLE "public"."AvailabilityRules" ADD CONSTRAINT "AvailabilityRules_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."User"("UserId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TimeOff" ADD CONSTRAINT "TimeOff_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."User"("UserId") ON DELETE RESTRICT ON UPDATE CASCADE;
