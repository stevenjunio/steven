import { createHash } from "node:crypto";
import { getPrisma } from "@/library/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { chunkKnowledge } from "./chunking.ts";
import { rankRetrievedKnowledge } from "./ranking.ts";

export interface RetrievedKnowledge {
  id: string;
  sourceName: string;
  sourceUrl: string | null;
  content: string;
  score: number;
}

function checksum(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

async function createEmbeddings(texts: string[]) {
  const apiKey = process.env.VOYAGE_API_KEY;
  if (!apiKey || texts.length === 0) return texts.map(() => null);

  const response = await fetch("https://api.voyageai.com/v1/embeddings", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ input: texts, model: "voyage-4-lite", output_dimension: 1024 }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) return texts.map(() => null);
  const body = (await response.json()) as { data?: Array<{ embedding?: number[] }> };
  return texts.map((_, index) => body.data?.[index]?.embedding ?? null);
}

export async function createKnowledgeRevision(input: {
  name: string;
  kind: string;
  scope: "PUBLIC" | "PRIVATE" | "NEVER_PUBLISH";
  content: string;
  sourceUrl?: string;
  modelAccess?: boolean;
  sourceId?: string;
}) {
  const prisma = getPrisma();
  const chunks = chunkKnowledge(input.content);
  const embeddings = await createEmbeddings(chunks);
  const chunkCreates = chunks.map((content, ordinal) => ({
    ordinal,
    content,
    tokenCount: Math.ceil(content.length / 4),
    embedding: embeddings[ordinal] ?? undefined,
  } satisfies Prisma.KnowledgeChunkUncheckedCreateWithoutRevisionInput));

  if (!input.sourceId) {
    const source = await prisma.knowledgeSource.create({
      data: {
        name: input.name,
        kind: input.kind,
        scope: input.scope,
        sourceUrl: input.sourceUrl,
        modelAccess: input.modelAccess ?? true,
        revisions: {
          create: {
            version: 1,
            content: input.content,
            checksum: checksum(input.content),
            status: "READY",
            chunks: { create: chunkCreates },
          },
        },
      },
      include: {
        revisions: {
          include: { source: true, chunks: true },
        },
      },
    });
    return source.revisions[0];
  }

  const source = await prisma.knowledgeSource.findUniqueOrThrow({
    where: { id: input.sourceId },
  });
  if (source.scope !== input.scope) {
    throw new Error("A revision cannot change knowledge scope.");
  }
  const latest = await prisma.knowledgeRevision.findFirst({
    where: { sourceId: source.id },
    orderBy: { version: "desc" },
    select: { version: true },
  });

  return prisma.knowledgeRevision.create({
    data: {
      version: (latest?.version ?? 0) + 1,
      content: input.content,
      checksum: checksum(input.content),
      status: "READY",
      source: {
        connect: {
          id_scope: { id: source.id, scope: source.scope },
        },
      },
      chunks: { create: chunkCreates },
    },
    include: { source: true, chunks: true },
  });
}

function queryTerms(query: string) {
  const stop = new Set(["about", "could", "does", "from", "have", "into", "steven", "that", "the", "this", "what", "when", "where", "which", "with", "would", "your"]);
  return [...new Set(query.toLowerCase().match(/[a-z0-9][a-z0-9+#.-]{1,}/g) ?? [])]
    .filter((term) => !stop.has(term))
    .slice(0, 12);
}

function lexicalScore(content: string, terms: string[]) {
  const normalized = content.toLowerCase();
  return terms.reduce((score, term) => {
    const occurrences = normalized.split(term).length - 1;
    return score + Math.min(occurrences, 4) * (term.length > 5 ? 2 : 1);
  }, 0);
}

function cosine(left: number[], right: number[]) {
  if (left.length !== right.length || left.length === 0) return 0;
  let dot = 0;
  let leftMagnitude = 0;
  let rightMagnitude = 0;
  for (let index = 0; index < left.length; index += 1) {
    dot += left[index] * right[index];
    leftMagnitude += left[index] ** 2;
    rightMagnitude += right[index] ** 2;
  }
  return dot / (Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude) || 1);
}

export async function retrieveKnowledge(query: string, scope: "PUBLIC" | "PRIVATE", limit = 6) {
  const prisma = getPrisma();
  const [rows, memoryFacts] = await Promise.all([
    prisma.knowledgeChunk.findMany({
      where:
        scope === "PUBLIC"
          ? {
              scope: "PUBLIC",
              revision: { status: "READY", source: { modelAccess: true, scope: "PUBLIC" } },
              releaseItems: { some: { release: { status: "PUBLISHED" } } },
            }
          : {
              scope: { in: ["PUBLIC", "PRIVATE", "NEVER_PUBLISH"] },
              revision: { status: "READY", source: { modelAccess: true, scope: { in: ["PUBLIC", "PRIVATE", "NEVER_PUBLISH"] } } },
            },
      include: { revision: { include: { source: true } } },
      orderBy: { createdAt: "desc" },
      take: 300,
    }),
    scope === "PRIVATE"
      ? prisma.memoryFact.findMany({
          where: { scope: { in: ["PRIVATE", "NEVER_PUBLISH"] }, archivedAt: null },
          orderBy: { createdAt: "desc" },
          take: 100,
        })
      : Promise.resolve([]),
  ]);
  const knowledgeRows = rows as Prisma.KnowledgeChunkGetPayload<{ include: { revision: { include: { source: true } } } }>[];
  const [queryEmbedding] = await createEmbeddings([query]);
  const terms = queryTerms(query);

  const chunks = knowledgeRows
    .map((row) => {
      const vector = Array.isArray(row.embedding) ? (row.embedding as number[]) : null;
      const semantic = queryEmbedding && vector ? Math.max(0, cosine(queryEmbedding, vector)) * 10 : 0;
      return {
        id: row.id,
        sourceName: row.revision.source.name,
        sourceUrl: row.revision.source.sourceUrl,
        content: row.content,
        score: lexicalScore(`${row.revision.source.name}\n${row.content}`, terms) + semantic,
      } satisfies RetrievedKnowledge;
    });
  const memories = memoryFacts.map((fact) => ({
    id: `memory:${fact.id}`,
    sourceName: "Approved memory",
    sourceUrl: null,
    content: fact.content,
    score: lexicalScore(fact.content, terms),
  } satisfies RetrievedKnowledge));
  const candidates = terms.length === 0
    ? [...chunks, ...memories].map((item) => ({ ...item, score: item.score || 1 }))
    : [...chunks, ...memories];

  return rankRetrievedKnowledge(candidates, limit);
}

export async function publishPublicRelease(name: string) {
  const prisma = getPrisma();
  const chunks = await prisma.knowledgeChunk.findMany({
    where: {
      scope: "PUBLIC",
      revision: { status: "READY", source: { scope: "PUBLIC", modelAccess: true } },
    },
    select: { id: true },
  });
  if (chunks.length === 0) throw new Error("There is no ready public knowledge to publish.");

  const [, release] = await prisma.$transaction([
    prisma.knowledgeRelease.updateMany({
      where: { status: "PUBLISHED" },
      data: { status: "RETIRED", retiredAt: new Date() },
    }),
    prisma.knowledgeRelease.create({
      data: {
        name,
        status: "PUBLISHED",
        publishedAt: new Date(),
        items: { create: chunks.map(({ id }) => ({ chunkId: id })) },
      },
    }),
  ]);
  return release;
}
