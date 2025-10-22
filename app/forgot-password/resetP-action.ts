"use server";

import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { sendEmail } from "@/lib/mailer";
import { createPasswordResetToken } from "@/lib/tokens";

export async function sendReset(fd: FormData) {
  const email = String(fd.get("email") || "")
    .toLowerCase()
    .trim();

  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    const token = await createPasswordResetToken(user.UserId);
    const url = `${process.env.APP_URL}/reset/${token}`;
    await sendEmail({
      to: email,
      subject: "Reset your password",
      html: `
        <p>We received a request to reset your password.</p>
        <p><a href="${url}">Click here to reset</a> (valid for 30 minutes)</p>
        <p>If you didn't request this, you can ignore this email.</p>
      `,
    });
  }
  redirect(
    `forgot-password/?toast=sucess&msg=${encodeURIComponent(
      "If the email exists, a reset link has been sent"
    )}`
  );
}
