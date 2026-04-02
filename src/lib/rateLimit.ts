import { NextRequest } from "next/server";

const store = new Map<string, { count: number; resetAt: number }>();
const HOURLY_LIMIT = 5;

export function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

export function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = store.get(ip);

  if (!record || now > record.resetAt) {
    store.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return false;
  }

  if (record.count >= HOURLY_LIMIT) return true;
  record.count++;
  return false;
}
