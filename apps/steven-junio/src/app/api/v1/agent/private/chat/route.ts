import { getAdminSubject } from "@/library/isUserAdmin";
import { validatePrivateAgentMessage } from "@/server/agent/guardrails";
import { agentJson } from "@/server/agent/http";
import { AgentServiceError, askSteven } from "@/server/agent/service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const ownerSub = await getAdminSubject();
  if (!ownerSub) return agentJson({ error: "unauthorized" }, { status: 401 });
  try {
    const body = (await request.json()) as { message?: unknown; conversationId?: unknown };
    const validation = validatePrivateAgentMessage(body.message);
    if (!validation.ok) return agentJson({ error: validation.code, details: validation }, { status: 400 });
    const result = await askSteven({
      scope: "PRIVATE",
      message: validation.value,
      conversationId: typeof body.conversationId === "string" ? body.conversationId : undefined,
      ownerSub,
    });
    return agentJson(result);
  } catch (error) {
    const status = error instanceof AgentServiceError ? error.status : 500;
    return agentJson(
      {
        error: error instanceof AgentServiceError ? error.code : "agent_unavailable",
        message: error instanceof AgentServiceError ? error.message : "Private AI Steven is temporarily unavailable.",
      },
      { status },
    );
  }
}
