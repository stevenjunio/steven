import { randomUUID } from "node:crypto";
import { getPrisma } from "@/library/prisma";
import { retrieveKnowledge, type RetrievedKnowledge } from "./knowledge";
import {
  releasePublicRequest,
  releasePrivateRequest,
  reservePrivateRequest,
  reservePublicRequest,
  settlePrivateRequest,
  settlePublicRequest,
} from "./guardrails/store";
import {
  createMetaMuseProvider,
  estimateMuseUsageCost,
  reserveMuseRequestCost,
} from "./providers";

const DEFAULT_PERSONA = `You are AI Steven, an AI representation of Steven Junio. Speak in the first person, but never imply you are the human Steven. Answer only from the supplied Steven Knowledge. Keep answers friendly, direct, and concise. Cite every factual claim with the exact evidence identifier in square brackets, such as [K1]. Never use outside knowledge, speculate about Steven, or give general advice. If the evidence does not answer the question, say: "I don't have enough information from Steven to answer that yet."`;

export class AgentServiceError extends Error {
  constructor(
    public readonly code: string,
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

function approximateTokens(value: string) {
  // UTF-8 bytes are a deliberately conservative ceiling: a tokenizer cannot
  // produce more tokens than the bytes it receives.
  return Buffer.byteLength(value, "utf8");
}

function evidencePrompt(knowledge: RetrievedKnowledge[]) {
  return knowledge
    .map(
      (item, index) =>
        `[K${index + 1}] Source: ${item.sourceName}${item.sourceUrl ? ` (${item.sourceUrl})` : ""}\n${item.content}`,
    )
    .join("\n\n");
}

function validatedCitations(answer: string, knowledge: RetrievedKnowledge[]) {
  const requested = [...answer.matchAll(/\[K(\d+)\]/g)].map((match) => Number(match[1]) - 1);
  const indexes = [...new Set(requested)].filter((index) => index >= 0 && index < knowledge.length);
  return indexes.map((index) => ({
    id: `K${index + 1}`,
    chunkId: knowledge[index].id,
    title: knowledge[index].sourceName,
    url: knowledge[index].sourceUrl,
    excerpt: knowledge[index].content.slice(0, 240),
  }));
}

async function persona(scope: "PUBLIC" | "PRIVATE") {
  const active = await getPrisma().personaVersion.findFirst({
    where: { scope, active: true },
    orderBy: { version: "desc" },
  });
  return active?.instructions ?? DEFAULT_PERSONA;
}

async function conversationFor(input: {
  scope: "PUBLIC" | "PRIVATE";
  conversationId?: string;
  visitorId?: string;
  ownerSub?: string;
}) {
  const prisma = getPrisma();
  if (input.conversationId) {
    const existing = await prisma.agentConversation.findFirst({
      where: {
        id: input.conversationId,
        scope: input.scope,
        deletedAt: null,
        ...(input.scope === "PUBLIC" ? { visitorId: input.visitorId } : { ownerSub: input.ownerSub }),
      },
    });
    if (!existing) throw new AgentServiceError("conversation_not_found", 404, "Conversation not found.");
    return existing;
  }
  return prisma.agentConversation.create({
    data: {
      scope: input.scope,
      visitorId: input.scope === "PUBLIC" ? input.visitorId : undefined,
      ownerSub: input.scope === "PRIVATE" ? input.ownerSub : undefined,
    },
  });
}

export async function askSteven(input: {
  scope: "PUBLIC" | "PRIVATE";
  message: string;
  conversationId?: string;
  visitorId?: string;
  rateLimitIds?: string[];
  ownerSub?: string;
}) {
  if (!process.env.META_MODEL_API_KEY) {
    throw new AgentServiceError("not_configured", 503, "AI Steven is not configured yet.");
  }
  if (input.scope === "PRIVATE" && process.env.STEVEN_AGENT_PRIVATE_MODEL_ENABLED !== "true") {
    throw new AgentServiceError(
      "private_model_disabled",
      503,
      "Private AI access is disabled until provider data terms are approved.",
    );
  }

  const prisma = getPrisma();
  const conversation = await conversationFor(input);
  const userMessage = await prisma.agentMessage.create({
    data: { conversationId: conversation.id, role: "USER", content: input.message },
  });
  const history = await prisma.agentMessage.findMany({
    where: { conversationId: conversation.id, id: { not: userMessage.id } },
    orderBy: { createdAt: "desc" },
    take: input.scope === "PUBLIC" ? 6 : 16,
  });
  const knowledge = await retrieveKnowledge(input.message, input.scope);
  if (knowledge.length === 0) {
    const answer = "I don't have enough information from Steven to answer that yet.";
    await prisma.agentMessage.create({
      data: { conversationId: conversation.id, role: "ASSISTANT", content: answer, citations: [] },
    });
    return { conversationId: conversation.id, answer, citations: [], abstained: true };
  }

  const instructions = `${await persona(input.scope)}\n\nSteven Knowledge:\n${evidencePrompt(knowledge)}`;
  const messages = [
    ...history.reverse().map((item) => ({
      role: item.role === "ASSISTANT" ? ("assistant" as const) : ("user" as const),
      content: item.content,
    })),
    { role: "user" as const, content: input.message },
  ];
  const estimatedInputTokens = approximateTokens(instructions + JSON.stringify(messages));
  const reservation = reserveMuseRequestCost({ inputTokens: estimatedInputTokens });
  const estimateMicros = Math.ceil(reservation.totalUsd * 1_000_000);
  const run = await prisma.agentRun.create({
    data: {
      conversationId: conversation.id,
      scope: input.scope,
      provider: "meta",
      model: "muse-spark-1.1",
      estimatedCostMicros: estimateMicros,
    },
  });
  const requestId = randomUUID();

  if (input.scope === "PUBLIC") {
    if (!input.visitorId) throw new AgentServiceError("visitor_required", 400, "Visitor identity missing.");
    const admission = await reservePublicRequest({
      requestId,
      runId: run.id,
      visitorKeys: input.rateLimitIds ?? [input.visitorId],
      estimateMicros,
    });
    if (admission.status === "rejected") {
      await prisma.agentRun.update({
        where: { id: run.id },
        data: { status: "REJECTED", errorCode: admission.reason, completedAt: new Date() },
      });
      throw new AgentServiceError(admission.reason, 429, "AI Steven has reached a usage limit. Please try again later.");
    }
  } else {
    if (!input.ownerSub) throw new AgentServiceError("owner_required", 401, "Owner identity missing.");
    const admission = await reservePrivateRequest({
      requestId,
      runId: run.id,
      ownerSub: input.ownerSub,
      estimateMicros,
    });
    if (admission.status === "rejected") {
      await prisma.agentRun.update({
        where: { id: run.id },
        data: { status: "REJECTED", errorCode: admission.reason, completedAt: new Date() },
      });
      throw new AgentServiceError(admission.reason, 429, "Private AI Steven has reached its usage limit.");
    }
  }

  const startedAt = Date.now();
  try {
    const provider = createMetaMuseProvider({ apiKey: process.env.META_MODEL_API_KEY });
    const response = await provider.generate({ instructions, messages });
    const citations = validatedCitations(response.answer, knowledge);
    const abstained = citations.length === 0;
    const answer = abstained
      ? "I don't have enough information from Steven to answer that yet."
      : response.answer.replace(/\[K(\d+)\]/g, (value, rawIndex) => {
          const index = Number(rawIndex) - 1;
          return index >= 0 && index < knowledge.length ? value : "";
        });
    const assistantMessage = await prisma.agentMessage.create({
      data: { conversationId: conversation.id, role: "ASSISTANT", content: answer, citations },
    });
    const actualUsd = response.usage ? estimateMuseUsageCost(response.usage).totalUsd : reservation.totalUsd;
    const actualMicros = Math.ceil(actualUsd * 1_000_000);
    await prisma.agentRun.update({
      where: { id: run.id },
      data: {
        status: "SUCCEEDED",
        actualCostMicros: actualMicros,
        inputTokens: response.usage?.inputTokens,
        cachedInputTokens: response.usage?.cachedInputTokens,
        outputTokens: response.usage?.outputTokens,
        reasoningTokens: response.usage?.reasoningTokens,
        durationMs: Date.now() - startedAt,
        completedAt: new Date(),
      },
    });
    if (input.scope === "PUBLIC") {
      await settlePublicRequest({
        requestId,
        runId: run.id,
        actualMicros,
        inputTokens: response.usage?.inputTokens ?? estimatedInputTokens,
        outputTokens: response.usage?.outputTokens ?? 1_200,
      });
    } else {
      await settlePrivateRequest({
        requestId,
        runId: run.id,
        actualMicros,
        inputTokens: response.usage?.inputTokens ?? estimatedInputTokens,
        outputTokens: response.usage?.outputTokens ?? 1_200,
      });
    }
    if (input.scope === "PRIVATE" && /\bremember\b/i.test(input.message)) {
      await prisma.memoryCandidate.create({
        data: {
          scope: "PRIVATE",
          content: input.message,
          evidence: { conversationId: conversation.id, messageId: userMessage.id },
        },
      });
    }
    return { conversationId: conversation.id, messageId: assistantMessage.id, answer, citations, abstained };
  } catch (error) {
    if (input.scope === "PUBLIC") await releasePublicRequest({ requestId, runId: run.id });
    else await releasePrivateRequest({ requestId, runId: run.id });
    await prisma.agentRun.update({
      where: { id: run.id },
      data: {
        status: "FAILED",
        errorCode: error instanceof Error ? error.name : "unknown",
        durationMs: Date.now() - startedAt,
        completedAt: new Date(),
      },
    });
    throw error;
  }
}
