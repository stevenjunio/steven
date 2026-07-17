import { createHmac, randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { deriveVisitorIdentifiers } from "./guardrails";

export const VISITOR_COOKIE = "steven_agent_visitor";

export function publicVisitor(request: NextRequest) {
  const existingSession = request.cookies.get(VISITOR_COOKIE)?.value;
  const sessionId = existingSession ?? randomUUID();
  const rawIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const secret = process.env.STEVEN_AGENT_VISITOR_SECRET ?? process.env.AUTH0_SECRET;
  if (!secret) throw new Error("STEVEN_AGENT_VISITOR_SECRET is not configured.");
  const identifiers = deriveVisitorIdentifiers({ sessionId, rawIp, secret });
  const visitorId = createHmac("sha256", secret)
    .update(`v1|conversation|${sessionId}`)
    .digest("base64url");
  const rateLimitIds = [identifiers.sessionKey, identifiers.networkKey].filter(
    (value): value is string => Boolean(value),
  );
  if (rateLimitIds.length === 0) throw new Error("Unable to derive visitor identity.");
  return { visitorId, rateLimitIds, sessionId, shouldSetCookie: !existingSession };
}

export function agentJson(body: unknown, init?: { status?: number }, visitorSessionId?: string) {
  const response = NextResponse.json(body, {
    status: init?.status,
    headers: { "Cache-Control": "no-store" },
  });
  if (visitorSessionId) {
    response.cookies.set(VISITOR_COOKIE, visitorSessionId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
  }
  return response;
}
