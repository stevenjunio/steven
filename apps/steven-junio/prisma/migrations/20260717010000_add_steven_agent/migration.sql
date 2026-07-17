CREATE TYPE "AgentScope" AS ENUM ('PUBLIC', 'PRIVATE', 'NEVER_PUBLISH');
CREATE TYPE "KnowledgeRevisionStatus" AS ENUM ('DRAFT', 'READY', 'ARCHIVED');
CREATE TYPE "KnowledgeReleaseStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'RETIRED');
CREATE TYPE "MemoryCandidateStatus" AS ENUM ('PROPOSED', 'APPROVED', 'REJECTED');
CREATE TYPE "AgentMessageRole" AS ENUM ('USER', 'ASSISTANT', 'SYSTEM');
CREATE TYPE "AgentRunStatus" AS ENUM ('RESERVED', 'SUCCEEDED', 'FAILED', 'REJECTED');
CREATE TYPE "UsageWindow" AS ENUM ('MINUTE', 'DAY', 'MONTH');
CREATE TYPE "UsageLedgerKind" AS ENUM ('RESERVE', 'COMMIT', 'RELEASE', 'ADJUSTMENT');

CREATE TABLE "KnowledgeSource" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "kind" TEXT NOT NULL,
  "scope" "AgentScope" NOT NULL,
  "modelAccess" BOOLEAN NOT NULL DEFAULT true,
  "sourceUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "KnowledgeSource_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "KnowledgeRevision" (
  "id" TEXT NOT NULL,
  "sourceId" TEXT NOT NULL,
  "scope" "AgentScope" NOT NULL,
  "version" INTEGER NOT NULL,
  "content" TEXT NOT NULL,
  "checksum" TEXT NOT NULL,
  "status" "KnowledgeRevisionStatus" NOT NULL DEFAULT 'DRAFT',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "publishedAt" TIMESTAMP(3),
  CONSTRAINT "KnowledgeRevision_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "KnowledgeChunk" (
  "id" TEXT NOT NULL,
  "revisionId" TEXT NOT NULL,
  "scope" "AgentScope" NOT NULL,
  "ordinal" INTEGER NOT NULL,
  "content" TEXT NOT NULL,
  "tokenCount" INTEGER NOT NULL,
  "embedding" JSONB,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "KnowledgeChunk_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "KnowledgeRelease" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "status" "KnowledgeReleaseStatus" NOT NULL DEFAULT 'DRAFT',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "publishedAt" TIMESTAMP(3),
  "retiredAt" TIMESTAMP(3),
  CONSTRAINT "KnowledgeRelease_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "KnowledgeReleaseItem" (
  "releaseId" TEXT NOT NULL,
  "chunkId" TEXT NOT NULL,
  CONSTRAINT "KnowledgeReleaseItem_pkey" PRIMARY KEY ("releaseId", "chunkId")
);

CREATE TABLE "PersonaVersion" (
  "id" TEXT NOT NULL,
  "scope" "AgentScope" NOT NULL,
  "version" INTEGER NOT NULL,
  "instructions" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "activatedAt" TIMESTAMP(3),
  CONSTRAINT "PersonaVersion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MemoryCandidate" (
  "id" TEXT NOT NULL,
  "scope" "AgentScope" NOT NULL,
  "content" TEXT NOT NULL,
  "evidence" JSONB,
  "status" "MemoryCandidateStatus" NOT NULL DEFAULT 'PROPOSED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "reviewedAt" TIMESTAMP(3),
  "reviewedBySub" TEXT,
  CONSTRAINT "MemoryCandidate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MemoryFact" (
  "id" TEXT NOT NULL,
  "scope" "AgentScope" NOT NULL,
  "content" TEXT NOT NULL,
  "sourceCandidateId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "archivedAt" TIMESTAMP(3),
  CONSTRAINT "MemoryFact_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AgentConversation" (
  "id" TEXT NOT NULL,
  "scope" "AgentScope" NOT NULL,
  "visitorId" TEXT,
  "ownerSub" TEXT,
  "title" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "AgentConversation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AgentMessage" (
  "id" TEXT NOT NULL,
  "conversationId" TEXT NOT NULL,
  "role" "AgentMessageRole" NOT NULL,
  "content" TEXT NOT NULL,
  "citations" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AgentMessage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AgentRun" (
  "id" TEXT NOT NULL,
  "conversationId" TEXT NOT NULL,
  "scope" "AgentScope" NOT NULL,
  "provider" TEXT NOT NULL,
  "model" TEXT NOT NULL,
  "status" "AgentRunStatus" NOT NULL DEFAULT 'RESERVED',
  "estimatedCostMicros" BIGINT NOT NULL,
  "actualCostMicros" BIGINT,
  "inputTokens" INTEGER,
  "cachedInputTokens" INTEGER,
  "outputTokens" INTEGER,
  "reasoningTokens" INTEGER,
  "errorCode" TEXT,
  "durationMs" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  CONSTRAINT "AgentRun_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UsageBucket" (
  "id" TEXT NOT NULL,
  "scope" "AgentScope" NOT NULL,
  "key" TEXT NOT NULL,
  "window" "UsageWindow" NOT NULL,
  "periodStart" TIMESTAMP(3) NOT NULL,
  "periodEnd" TIMESTAMP(3) NOT NULL,
  "requestCount" INTEGER NOT NULL DEFAULT 0,
  "reservedMicros" BIGINT NOT NULL DEFAULT 0,
  "spentMicros" BIGINT NOT NULL DEFAULT 0,
  "activeCount" INTEGER NOT NULL DEFAULT 0,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "UsageBucket_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AuditEvent" (
  "id" TEXT NOT NULL,
  "actorSub" TEXT,
  "action" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT,
  "scope" "AgentScope",
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UsageLedger" (
  "id" TEXT NOT NULL,
  "bucketId" TEXT NOT NULL,
  "runId" TEXT,
  "requestId" TEXT NOT NULL,
  "kind" "UsageLedgerKind" NOT NULL,
  "costMicros" BIGINT NOT NULL,
  "inputTokens" INTEGER NOT NULL DEFAULT 0,
  "outputTokens" INTEGER NOT NULL DEFAULT 0,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UsageLedger_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "KnowledgeRevision_sourceId_version_key" ON "KnowledgeRevision"("sourceId", "version");
CREATE UNIQUE INDEX "KnowledgeSource_id_scope_key" ON "KnowledgeSource"("id", "scope");
CREATE UNIQUE INDEX "KnowledgeRevision_id_scope_key" ON "KnowledgeRevision"("id", "scope");
CREATE UNIQUE INDEX "KnowledgeChunk_revisionId_ordinal_key" ON "KnowledgeChunk"("revisionId", "ordinal");
CREATE UNIQUE INDEX "PersonaVersion_scope_version_key" ON "PersonaVersion"("scope", "version");
CREATE UNIQUE INDEX "MemoryFact_sourceCandidateId_key" ON "MemoryFact"("sourceCandidateId");
CREATE UNIQUE INDEX "UsageBucket_scope_key_window_periodStart_key" ON "UsageBucket"("scope", "key", "window", "periodStart");
CREATE UNIQUE INDEX "UsageLedger_bucketId_requestId_kind_key" ON "UsageLedger"("bucketId", "requestId", "kind");
CREATE INDEX "KnowledgeSource_scope_updatedAt_idx" ON "KnowledgeSource"("scope", "updatedAt");
CREATE INDEX "KnowledgeRevision_status_publishedAt_idx" ON "KnowledgeRevision"("status", "publishedAt");
CREATE INDEX "KnowledgeChunk_scope_createdAt_idx" ON "KnowledgeChunk"("scope", "createdAt");
CREATE INDEX "KnowledgeRelease_status_publishedAt_idx" ON "KnowledgeRelease"("status", "publishedAt");
CREATE INDEX "KnowledgeReleaseItem_chunkId_idx" ON "KnowledgeReleaseItem"("chunkId");
CREATE INDEX "PersonaVersion_scope_active_idx" ON "PersonaVersion"("scope", "active");
CREATE INDEX "MemoryCandidate_status_createdAt_idx" ON "MemoryCandidate"("status", "createdAt");
CREATE INDEX "MemoryFact_scope_archivedAt_idx" ON "MemoryFact"("scope", "archivedAt");
CREATE INDEX "AgentConversation_scope_visitorId_updatedAt_idx" ON "AgentConversation"("scope", "visitorId", "updatedAt");
CREATE INDEX "AgentConversation_ownerSub_updatedAt_idx" ON "AgentConversation"("ownerSub", "updatedAt");
CREATE INDEX "AgentMessage_conversationId_createdAt_idx" ON "AgentMessage"("conversationId", "createdAt");
CREATE INDEX "AgentRun_scope_createdAt_idx" ON "AgentRun"("scope", "createdAt");
CREATE INDEX "AgentRun_conversationId_createdAt_idx" ON "AgentRun"("conversationId", "createdAt");
CREATE INDEX "UsageBucket_scope_window_periodEnd_idx" ON "UsageBucket"("scope", "window", "periodEnd");
CREATE INDEX "AuditEvent_action_createdAt_idx" ON "AuditEvent"("action", "createdAt");
CREATE INDEX "AuditEvent_scope_createdAt_idx" ON "AuditEvent"("scope", "createdAt");
CREATE INDEX "UsageLedger_runId_idx" ON "UsageLedger"("runId");
CREATE INDEX "UsageLedger_createdAt_idx" ON "UsageLedger"("createdAt");

ALTER TABLE "KnowledgeRevision" ADD CONSTRAINT "KnowledgeRevision_sourceId_scope_fkey" FOREIGN KEY ("sourceId", "scope") REFERENCES "KnowledgeSource"("id", "scope") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "KnowledgeChunk" ADD CONSTRAINT "KnowledgeChunk_revisionId_scope_fkey" FOREIGN KEY ("revisionId", "scope") REFERENCES "KnowledgeRevision"("id", "scope") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "KnowledgeReleaseItem" ADD CONSTRAINT "KnowledgeReleaseItem_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "KnowledgeRelease"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "KnowledgeReleaseItem" ADD CONSTRAINT "KnowledgeReleaseItem_chunkId_fkey" FOREIGN KEY ("chunkId") REFERENCES "KnowledgeChunk"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MemoryFact" ADD CONSTRAINT "MemoryFact_sourceCandidateId_fkey" FOREIGN KEY ("sourceCandidateId") REFERENCES "MemoryCandidate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AgentMessage" ADD CONSTRAINT "AgentMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "AgentConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AgentRun" ADD CONSTRAINT "AgentRun_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "AgentConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UsageLedger" ADD CONSTRAINT "UsageLedger_bucketId_fkey" FOREIGN KEY ("bucketId") REFERENCES "UsageBucket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "UsageLedger" ADD CONSTRAINT "UsageLedger_runId_fkey" FOREIGN KEY ("runId") REFERENCES "AgentRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "KnowledgeChunk" ADD CONSTRAINT "KnowledgeChunk_tokenCount_check" CHECK ("tokenCount" >= 0);
ALTER TABLE "AgentRun" ADD CONSTRAINT "AgentRun_costs_check" CHECK ("estimatedCostMicros" >= 0 AND ("actualCostMicros" IS NULL OR "actualCostMicros" >= 0));
ALTER TABLE "UsageBucket" ADD CONSTRAINT "UsageBucket_nonnegative_check" CHECK ("requestCount" >= 0 AND "reservedMicros" >= 0 AND "spentMicros" >= 0 AND "activeCount" >= 0);
ALTER TABLE "UsageLedger" ADD CONSTRAINT "UsageLedger_nonnegative_check" CHECK ("costMicros" >= 0 AND "inputTokens" >= 0 AND "outputTokens" >= 0);
