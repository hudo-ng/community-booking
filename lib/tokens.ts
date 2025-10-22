import crypto from "crypto";
import { prisma } from "./db";

function sha256(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

function addMinutes(d: Date, mins: number) {
  return new Date(d.getTime() + mins * 60000);
}

export async function createEmailVerificationToken(userId: string) {
  const raw = crypto.randomBytes(32).toString("hex");
  const tokenHash = sha256(raw);
  await prisma.emailVerificationToken.deleteMany({
    where: { userId, usedAt: null, expiresAt: { gt: new Date() } },
  });
  await prisma.emailVerificationToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt: addMinutes(new Date(), 24 * 60),
    },
  });
  return raw;
}

export async function consumeEmailVerificationToken(raw: string) {
  const token = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash: sha256(raw) },
  });
  if (!token) return null;
  if (token.usedAt) return null;
  if (token.expiresAt < new Date()) return null;
  await prisma.passwordResetToken.update({
    where: {
      tokenHash: token.tokenHash,
    },
    data: {
      usedAt: new Date(),
    },
  });
  return token.userId;
}

export async function createPasswordResetToken(userId: string) {
  const raw = crypto.randomBytes(32).toString("hex");
  const tokenHash = sha256(raw);

  await prisma.passwordResetToken.deleteMany({
    where: { userId, usedAt: null, exipresAt: { gt: new Date() } },
  });

  await prisma.passwordResetToken.create({
    data: {
      userId,
      tokenHash,
      exipresAt: addMinutes(new Date(), 30),
    },
  });
  return raw;
}

export async function consumeResetPasswordToken(raw: string) {
  const token = await prisma.passwordResetToken.findUnique({
    where: {
      tokenHash: sha256(raw),
    },
  });
  console.log(token);
  if (!token) return null;
  if (token.usedAt) return null;
  if (token.exipresAt < new Date()) return null;

  await prisma.passwordResetToken.update({
    where: { tokenHash: token.tokenHash },
    data: {
      usedAt: new Date(),
    },
  });
  return token.userId;
}
