import { createError } from "h3";
import prisma from "../db/client";

// Optional alerting: set HEALTH_ALERT_WEBHOOK to a URL to receive JSON POSTs when the DB is missing tables
let lastAlertAt = 0;
const ALERT_TTL_MS = Number(process.env.HEALTH_ALERT_TTL_MS) || 1000 * 60 * 60; // default 1 hour

async function sendAlert(missing: string[]) {
  const webhook = process.env.HEALTH_ALERT_WEBHOOK;
  if (!webhook) return;
  const now = Date.now();
  if (now - lastAlertAt < ALERT_TTL_MS) return;

  try {
    await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        service: process.env.SERVICE_NAME || "app",
        env: process.env.NODE_ENV || "unknown",
        missing,
      }),
      // short timeout via AbortController could be added if needed
    });
    lastAlertAt = now;
    console.log(
      "[health] Sent alert to webhook for missing tables:",
      missing.join(", "),
    );
  } catch (e) {
    console.warn("[health] Failed to send alert to webhook:", e);
  }
}

export default async () => {
  try {
    await prisma.$connect();
    const rows = (await prisma.$queryRaw`
      SELECT name FROM sqlite_master
      WHERE type='table' AND name IN ('settings','sessions')
    `) as any[];
    const found = rows.map((r) => r.name as string);
    const required = ["settings", "sessions"];
    const missing = required.filter((n) => !found.includes(n));

    if (missing.length) {
      // fire an alert (non-blocking for client behavior but awaited to log failures)
      await sendAlert(missing);
      throw createError({
        statusCode: 503,
        statusMessage: "DB_MISSING_TABLES",
        message: `Missing tables: ${missing.join(", ")}`,
      });
    }

    return { ok: true };
  } catch (err: any) {
    if (err?.statusCode) throw err;
    throw createError({ statusCode: 500, message: "DB check failed" });
  }
};
