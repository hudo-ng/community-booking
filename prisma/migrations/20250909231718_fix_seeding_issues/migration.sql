-- DropForeignKey
ALTER TABLE "public"."AvailabilityRules" DROP CONSTRAINT "AvailabilityRules_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."TimeOff" DROP CONSTRAINT "TimeOff_id_fkey";

-- AddForeignKey
ALTER TABLE "public"."AvailabilityRules" ADD CONSTRAINT "AvailabilityRules_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "public"."User"("UserId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TimeOff" ADD CONSTRAINT "TimeOff_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "public"."User"("UserId") ON DELETE RESTRICT ON UPDATE CASCADE;
