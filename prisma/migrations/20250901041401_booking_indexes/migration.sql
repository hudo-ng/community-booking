-- CreateIndex
CREATE INDEX "Booking_serviceId_startAt_idx" ON "public"."Booking"("serviceId", "startAt");

-- CreateIndex
CREATE INDEX "Booking_serviceId_endAt_idx" ON "public"."Booking"("serviceId", "endAt");
