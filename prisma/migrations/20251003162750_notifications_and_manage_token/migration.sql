/*
  Warnings:

  - A unique constraint covering the columns `[manageToken]` on the table `Booking` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."NotificationChannel" AS ENUM ('EMAIL', 'SMS');

-- CreateEnum
CREATE TYPE "public"."NotificationKind" AS ENUM ('BOOKING_CONFIRMATION', 'REMINDER_24H', 'REMINDER_2H');

-- CreateEnum
CREATE TYPE "public"."NotificationStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- AlterTable
ALTER TABLE "public"."Booking" ADD COLUMN     "manageToken" TEXT;

-- CreateTable
CREATE TABLE "public"."Notification" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "channel" "public"."NotificationChannel" NOT NULL,
    "kind" "public"."NotificationKind" NOT NULL,
    "to" TEXT NOT NULL,
    "runAt" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3),
    "status" "public"."NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_status_runAt_idx" ON "public"."Notification"("status", "runAt");

-- CreateIndex
CREATE UNIQUE INDEX "Notification_bookingId_channel_kind_key" ON "public"."Notification"("bookingId", "channel", "kind");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_manageToken_key" ON "public"."Booking"("manageToken");

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
