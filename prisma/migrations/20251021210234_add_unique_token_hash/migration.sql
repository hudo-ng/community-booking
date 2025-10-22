/*
  Warnings:

  - A unique constraint covering the columns `[tokenHash]` on the table `EmailVerificationToken` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tokenHash]` on the table `PasswordResetToken` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "EmailVerificationToken_tokenHash_key" ON "public"."EmailVerificationToken"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON "public"."PasswordResetToken"("tokenHash");
