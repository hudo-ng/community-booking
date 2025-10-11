-- AlterTable
ALTER TABLE "public"."Booking" ADD COLUMN     "cancellationReason" TEXT,
ADD COLUMN     "cancelledAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."Service" ADD COLUMN     "cancellationPolicyHours" INTEGER NOT NULL DEFAULT 24;
