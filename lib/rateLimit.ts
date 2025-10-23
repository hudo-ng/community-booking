import crypto from "crypto"
import { prisma } from "./db"

const SALT = process.env.RATE_LIMIT_SALT;

export function hashIp(ip?: string | null) {
  if (!ip) return null;
  return crypto.createHash("sha256").update(ip + SALT).digest("hex");
}

export async function tooManyRecent({
  email,
  ipHash,
  perMinute = 1,
  perHour = 5,
  perDay = 10,
}: {
  email: string;
  ipHash: string | null;
  perMinute?: number;
  perHour?: number;
  perDay?: number;
}) {
  const now = new Date();
  const t1m = new Date(now.getTime() - 60_000);
  const t1h = new Date(now.getTime() - 60 * 60_000);
  const t1d = new Date(now.getTime() - 24 * 60 * 60_000);

  const [byMin, byHour, byDay, byIpMin] = await Promise.all([
    prisma.emailResendLog.count({ where: { email, createdAt: { gt: t1m } } }),
    prisma.emailResendLog.count({ where: { email, createdAt: { gt: t1h } } }),
    prisma.emailResendLog.count({ where: { email, createdAt: { gt: t1d } } }),
    ipHash
      ? prisma.emailResendLog.count({ where: { ipHash, createdAt: { gt: t1m } } })
      : Promise.resolve(0),
  ]);

  return (
    byMin >= perMinute ||
    byHour >= perHour ||
    byDay >= perDay ||
    byIpMin >= perMinute
  );
}

export async function logResend(email: string, ipHash: string | null) {
  await prisma.emailResendLog.create({ data: { email, ipHash } });
}