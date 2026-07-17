import { NextRequest } from "next/server";
import { validatePublicAgentMessage } from "@/server/agent/guardrails";
import { agentJson, publicVisitor } from "@/server/agent/http";
import { AgentServiceError, askSteven } from "@/server/agent/service";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  if (process.env.STEVEN_AGENT_PUBLIC_MODEL_ENABLED !== "true") {
    return agentJson({ error: "not_found" }, { status: 404 });
  }

  let visitorSessionId: string | undefined;
  try {
    const body = (await request.json()) as { message?: unknown; conversationId?: unknown };
    const validation = validatePublicAgentMessage(body.message);
    if (!validation.ok) return agentJson({ error: validation.code, details: validation }, { status: 400 });
    const visitor = publicVisitor(request);
    if (visitor.shouldSetCookie) visitorSessionId = visitor.sessionId;
    const result = await askSteven({
      scope: "PUBLIC",
      message: validation.value,
      conversationId: typeof body.conversationId === "string" ? body.conversationId : undefined,
      visitorId: visitor.visitorId,
      rateLimitIds: visitor.rateLimitIds,
    });
    return agentJson(result, undefined, visitorSessionId);
  } catch (error) {
    const status = error instanceof AgentServiceError ? error.status : 500;
    const code = error instanceof AgentServiceError ? error.code : "agent_unavailable";
    const message = error instanceof AgentServiceError ? error.message : "AI Steven is temporarily unavailable.";
    return agentJson({ error: code, message }, { status }, visitorSessionId);
  }
}
