import { getAdminSubject } from "@/library/isUserAdmin";
import { getPrisma } from "@/library/prisma";
import { agentJson } from "@/server/agent/http";
import { attachRunCosts } from "@/server/agent/conversation";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const ownerSub = await getAdminSubject();
  if (!ownerSub) return agentJson({ error: "unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const prisma = getPrisma();
  const conversation = await prisma.agentConversation.findFirst({
    where: { id, scope: "PRIVATE", ownerSub, deletedAt: null },
  });
  if (!conversation) return agentJson({ error: "not_found" }, { status: 404 });
  const [messages, runs] = await Promise.all([
    prisma.agentMessage.findMany({ where: { conversationId: id }, orderBy: { createdAt: "asc" }, select: { id: true, role: true, content: true, citations: true, createdAt: true } }),
    prisma.agentRun.findMany({ where: { conversationId: id, status: "SUCCEEDED" }, orderBy: { createdAt: "asc" }, select: { status: true, createdAt: true, actualCostMicros: true } }),
  ]);
  return agentJson({ ...conversation, messages: attachRunCosts(messages, runs) });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const ownerSub = await getAdminSubject();
  if (!ownerSub) return agentJson({ error: "unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const prisma = getPrisma();
  const conversation = await prisma.agentConversation.findFirst({ where: { id, scope: "PRIVATE", ownerSub } });
  if (!conversation) return agentJson({ error: "not_found" }, { status: 404 });
  await prisma.$transaction([
    prisma.auditEvent.create({ data: { actorSub: ownerSub, action: "conversation.deleted", entityType: "AgentConversation", entityId: id, scope: "PRIVATE" } }),
    prisma.agentConversation.delete({ where: { id } }),
  ]);
  return agentJson({ deleted: true });
}
