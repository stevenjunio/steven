import { getAdminSubject } from "@/library/isUserAdmin";
import { getPrisma } from "@/library/prisma";
import { agentJson } from "@/server/agent/http";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const ownerSub = await getAdminSubject();
  if (!ownerSub) return agentJson({ error: "unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const conversation = await getPrisma().agentConversation.findFirst({
    where: { id, scope: "PRIVATE", ownerSub, deletedAt: null },
    include: { messages: { orderBy: { createdAt: "asc" }, select: { id: true, role: true, content: true, citations: true, createdAt: true } } },
  });
  return conversation ? agentJson(conversation) : agentJson({ error: "not_found" }, { status: 404 });
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
