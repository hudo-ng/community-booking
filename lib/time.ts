import { TZDate } from "@date-fns/tz";

export function parseHM(hm: string) {
  const [h = "0", m = "0"] = hm.split(":");
  const hh = Math.max(0, Math.min(23, Number(h)));
  const mm = Math.max(0, Math.min(59, Number(m)));
  return { hh, mm };
}

export function providerLocalToUTC(ymd: string, hm: string, tz: string): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  const { hh, mm } = parseHM(hm);
  const local = new TZDate(y, m - 1, d, hh, mm, 0, 0, tz);
  return new Date(local.getTime());
}

export function isValidHm(hm: string) {
  return /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(hm) || /^\d{1,2}:\d{1,2}$/.test(hm);
}
