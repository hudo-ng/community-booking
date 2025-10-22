"use server";

import { consumeResetPasswordToken } from "@/lib/tokens";
import { prisma } from "@/lib/db";
import z from "zod";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

const PasswordSchema = z
  .string()
  .min(8, { error: "Password length must be at least 8 characters" })
  .max(72, "Max 72 characters")
  .regex(/[a-z]/, "Include a lowercase letter")
  .regex(/[A-Z]/, "Include an uppercase letter")
  .regex(/\d/, "Include a number")
  .regex(/[^A-Za-z0-9]/, "Include a symbol");

export async function resetPassword(fd: FormData) {
  const token = String(fd.get("token") || "");
  const password = String(fd.get("password") || "");
  const confirm = String(fd.get("confirm") || "");

  if (password !== confirm) {
    redirect(
      `/reset/${token}?t=error&m=${encodeURIComponent("Passwords not match")}`
    );
  }

  const pasred = PasswordSchema.safeParse(password);
  if (!pasred.success) {
    redirect(
      `/reset/${token}?t=error&m=${encodeURIComponent(
        pasred.error.issues[0].message
      )}`
    );
  }

  const userId = await consumeResetPasswordToken(token);
  console.log(userId);
  if (!userId) {
    redirect(
      `/login?t=error&m=${encodeURIComponent("Invalid or expired reset link")}`
    );
  }

  const hash = await bcrypt.hash(password, 10);
  await prisma.user.update({
    where: { UserId: userId },
    data: { passwordHash: hash, emailVerified: new Date() },
  });
  redirect(
    `/login?t=success&m=${encodeURIComponent(
      "Password updated. Please sign in."
    )}`
  );
}
