import { createHmac } from "node:crypto";

function utcDay(now: Date) {
  return now.toISOString().slice(0, 10);
}

function digest(secret: string, value: string) {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

export function deriveVisitorIdentifiers(input: {
  sessionId?: string;
  rawIp?: string;
  secret: string;
  now?: Date;
}) {
  if (Buffer.byteLength(input.secret) < 32) {
    throw new Error("STEVEN_AGENT_VISITOR_SECRET must be at least 32 bytes.");
  }
  if (!input.sessionId && !input.rawIp) throw new Error("A session id or IP is required.");

  const rotationDay = utcDay(input.now ?? new Date());
  return {
    rotationDay,
    sessionKey: input.sessionId
      ? digest(input.secret, `v1|session|${rotationDay}|${input.sessionId.slice(0, 256)}`)
      : undefined,
    networkKey: input.rawIp
      ? digest(input.secret, `v1|network|${rotationDay}|${input.rawIp.slice(0, 128)}`)
      : undefined,
  };
}

export function redactNetworkIdentifiers(value: string) {
  return value
    .replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, "[REDACTED_IP]")
    .replace(/\b(?:[a-f\d]{0,4}:){2,7}[a-f\d]{0,4}\b/gi, "[REDACTED_IP]")
    .replace(/Bearer\s+[A-Za-z0-9._~+\/-]+=*/gi, "Bearer [REDACTED]")
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[REDACTED_EMAIL]");
}
