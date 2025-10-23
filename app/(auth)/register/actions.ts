"use server";

import { prisma } from "../../../lib/db";
import z from "zod";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { createEmailVerificationToken } from "@/lib/tokens";
import { sendEmail } from "@/lib/mailer";
import { generateUniqueProviderSlug } from "@/lib/providerSlug";

export type RegisterState = {
  ok: boolean;
  fieldErrors?: {
    name?: string[];
    email?: string[];
    password?: string[];
    confirm?: string[];
  };
};

const registerSchema = z
  .object({
    name: z.string().min(3, { error: "Name is too short" }),
    email: z.email({ error: "Enter a valid email" }),
    password: z
      .string()
      .min(8, { error: "Password length must be at least 8 characters" })
      .max(72, "Max 72 characters")
      .regex(/[a-z]/, "Include a lowercase letter")
      .regex(/[A-Z]/, "Include an uppercase letter")
      .regex(/\d/, "Include a number")
      .regex(/[^A-Za-z0-9]/, "Include a symbol"),
    confirm: z.string(),
  })
  .superRefine((val, ctx) => {
    if (val.password !== val.confirm) {
      ctx.addIssue({
        code: "custom",
        path: ["confirm"],
        message: "Passwords do not match",
      });
    }
    const local = val.email.split("@");
    if (local && local.includes(val.password.toLowerCase())) {
      ctx.addIssue({
        code: "custom",
        path: ["password"],
        message: "Password must not contain your email name",
      });
    }
  });

export default async function registerAction(
  _prevState: RegisterState,
  fd: FormData
): Promise<RegisterState> {
  const parsed = registerSchema.safeParse({
    email: fd.get("email"),
    password: fd.get("password"),
    name: fd.get("name"),
    confirm: fd.get("confirm"),
  });

  if (!parsed.success) {
    const fmt = z.flattenError(parsed.error);
    return { ok: false, fieldErrors: fmt.fieldErrors };
  }

  const { email, password, name } = parsed.data;

  const existingEmail = await prisma.user.findUnique({
    where: { email: email },
  });
  if (existingEmail)
    return { ok: false, fieldErrors: { email: ["Email already in use"] } };

  const hashedPassword = await bcrypt.hash(password, 12);

  const slug = await generateUniqueProviderSlug(name);

  const newUser = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash: hashedPassword,
      role: "CUSTOMER",
      slug: slug ?? "provider",
    },
  });
  const rawToken = await createEmailVerificationToken(newUser.UserId);
  const verifyURL = `${process.env.APP_URL}/verify/${rawToken}`;
  await sendEmail({
    to: newUser.email,
    subject: "Verify your email",
    html: `
    <p>Hi ${newUser.name ?? ""},</p>
    <p>Please verify your email to activate your account:</p>
    <p><a href="${verifyURL}">${verifyURL}</a></p>
    <p>This link expires in 24 hours.</p>`,
  });

  redirect("/login");
}
