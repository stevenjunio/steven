import { getAdminSubject } from "@/library/isUserAdmin";
import { validatePrivateAgentMessage } from "@/server/agent/guardrails";
import { agentJson } from "@/server/agent/http";
import { AgentServiceError, askSteven } from "@/server/agent/service";
import { extractKnowledgeUpload } from "@/server/agent/extract";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  const ownerSub = await getAdminSubject();
  if (!ownerSub) return agentJson({ error: "unauthorized" }, { status: 401 });
  try {
    const multipart = request.headers.get("content-type")?.includes("multipart/form-data");
    const body = multipart
      ? await request.formData()
      : ((await request.json()) as { message?: unknown; conversationId?: unknown });
    const rawMessage = body instanceof FormData ? body.get("message") : body.message;
    const upload = body instanceof FormData ? body.get("file") : null;
    const file = upload instanceof File && upload.size > 0 ? upload : undefined;
    const validation = validatePrivateAgentMessage(
      typeof rawMessage === "string" && rawMessage.trim()
        ? rawMessage
        : file
          ? "Save this file to memory."
          : rawMessage,
    );
    if (!validation.ok) return agentJson({ error: validation.code, details: validation }, { status: 400 });
    const conversationId = body instanceof FormData ? body.get("conversationId") : body.conversationId;
    const attachment = file ? { name: file.name, content: await extractKnowledgeUpload(file) } : undefined;
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const send = (event: unknown) => controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
        try {
          const result = await askSteven({
            scope: "PRIVATE",
            message: validation.value,
            conversationId: typeof conversationId === "string" && conversationId ? conversationId : undefined,
            ownerSub,
            attachment,
            onTextDelta: (delta) => send({ type: "delta", delta }),
          });
          send({ type: "done", ...result });
        } catch (error) {
          send({
            type: "error",
            message: error instanceof AgentServiceError ? error.message : "Private AI Steven is temporarily unavailable.",
          });
        } finally {
          controller.close();
        }
      },
    });
    return new Response(stream, {
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "application/x-ndjson; charset=utf-8",
        "X-Accel-Buffering": "no",
      },
    });
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
