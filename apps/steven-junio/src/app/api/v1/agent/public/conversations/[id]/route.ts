import { NextRequest } from "next/server";
import { getPrisma } from "@/library/prisma";
import { agentJson, publicVisitor } from "@/server/agent/http";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const visitor = publicVisitor(request);
  const conversation = await getPrisma().agentConversation.findFirst({
    where: { id, scope: "PUBLIC", visitorId: visitor.visitorId, deletedAt: null },
    include: { messages: { orderBy: { createdAt: "asc" }, select: { id: true, role: true, content: true, citations: true, createdAt: true } } },
  });
  return conversation ? agentJson(conversation) : agentJson({ error: "not_found" }, { status: 404 });
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
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
