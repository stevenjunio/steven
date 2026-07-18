import { NextRequest } from "next/server";
import { getPrisma } from "@/library/prisma";
import { agentJson, publicVisitor } from "@/server/agent/http";
import { attachRunCosts } from "@/server/agent/conversation";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (process.env.STEVEN_AGENT_PUBLIC_MODEL_ENABLED !== "true") {
    return agentJson({ error: "not_found" }, { status: 404 });
  }

  const { id } = await context.params;
  const visitor = publicVisitor(request);
  const prisma = getPrisma();
  const conversation = await prisma.agentConversation.findFirst({
    where: { id, scope: "PUBLIC", visitorId: visitor.visitorId, deletedAt: null },
  });
  if (!conversation) return agentJson({ error: "not_found" }, { status: 404 });
  const [messages, runs] = await Promise.all([
    prisma.agentMessage.findMany({ where: { conversationId: id }, orderBy: { createdAt: "asc" }, select: { id: true, role: true, content: true, citations: true, createdAt: true } }),
    prisma.agentRun.findMany({ where: { conversationId: id, status: "SUCCEEDED" }, orderBy: { createdAt: "asc" }, select: { status: true, createdAt: true, actualCostMicros: true } }),
  ]);
  return agentJson({ ...conversation, messages: attachRunCosts(messages, runs) });
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (process.env.STEVEN_AGENT_PUBLIC_MODEL_ENABLED !== "true") {
    return agentJson({ error: "not_found" }, { status: 404 });
  }

  const { id } = await context.params;
  const visitor = publicVisitor(request);
  const prisma = getPrisma();
  const conversation = await prisma.agentConversation.findFirst({
    where: { id, scope: "PUBLIC", visitorId: visitor.visitorId },
  });
  if (!conversation) return agentJson({ error: "not_found" }, { status: 404 });
  await prisma.$transaction([
    prisma.auditEvent.create({ data: { action: "conversation.deleted", entityType: "AgentConversation", entityId: id, scope: "PUBLIC" } }),
    prisma.agentConversation.delete({ where: { id } }),
  ]);
  return agentJson({ deleted: true });
}
