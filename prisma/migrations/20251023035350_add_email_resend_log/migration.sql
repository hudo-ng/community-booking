-- CreateTable
CREATE TABLE "public"."EmailResendLog" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "ipHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailResendLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EmailResendLog_email_createdAt_idx" ON "public"."EmailResendLog"("email", "createdAt");

-- CreateIndex
CREATE INDEX "EmailResendLog_ipHash_createdAt_idx" ON "public"."EmailResendLog"("ipHash", "createdAt");
