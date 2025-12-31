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

    // Provider-agnostic schema readiness checks (fail if tables/models are missing).
    await prisma.setting.findFirst({ select: { key: true } });
    // `session` uses `token_hash` as its primary key in this schema.
    await prisma.session.findFirst({ select: { token_hash: true } });

    return { ok: true };
  } catch (err: any) {
    if (err?.statusCode) throw err;

    const code = err?.code as string | undefined;

    // Prisma typically uses P2021 when a table does not exist.
    if (code === "P2021" || code === "P2022") {
      await sendAlert(["schema_not_ready"]);
      throw createError({
        statusCode: 503,
        statusMessage: "DB_SCHEMA_NOT_READY",
        message: "Database schema not ready",
      });
    }

    throw createError({ statusCode: 500, message: "DB check failed" });
  }
};
