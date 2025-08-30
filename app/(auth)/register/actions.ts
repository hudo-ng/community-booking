"use server";

import { prisma } from "../../../lib/db";
import z from "zod";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

const registerSchema = z.object({
  name: z.string().min(3),
  email: z.email(),
  password: z.string().min(6),
});

export default async function registerAction(fd: FormData) {
  const { email, password, name } = registerSchema.parse({
    email: fd.get("email"),
    password: fd.get("password"),
    name: fd.get("name"),
  });

  const existingEmail = await prisma.user.findUnique({
    where: { email: email },
  });
  if (existingEmail) return;

  const hashedPassword = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { email, name, passwordHash: hashedPassword },
  });

  redirect("/login");
}
