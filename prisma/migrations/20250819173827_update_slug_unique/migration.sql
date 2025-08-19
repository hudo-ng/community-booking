/*
  Warnings:

  - A unique constraint covering the columns `[providerId,slug]` on the table `Service` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."Service_slug_key";

-- CreateIndex
CREATE UNIQUE INDEX "Service_providerId_slug_key" ON "public"."Service"("providerId", "slug");
