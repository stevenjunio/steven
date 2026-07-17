import { randomUUID } from "node:crypto";
import { getPrisma } from "@/library/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { META_PROVIDER_GUARDRAIL_LIMITS, PRIVATE_GUARDRAIL_LIMITS, PUBLIC_GUARDRAIL_LIMITS } from "./limits.ts";

class AdmissionError extends Error {
  constructor(public readonly code: "minute_limit" | "day_limit" | "concurrency_limit" | "daily_budget" | "monthly_budget") {
    super(code);
  }
}

function periods(now: Date) {
  const minuteStart = new Date(now);
  minuteStart.setUTCSeconds(0, 0);
  const dayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  return {
    minute: { start: minuteStart, end: new Date(minuteStart.getTime() + 60_000) },
    day: { start: dayStart, end: new Date(dayStart.getTime() + 86_400_000) },
    month: { start: monthStart, end: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)) },
  };
}

async function serializable<T>(operation: () => Promise<T>, attempts = 3): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
    if (attempts > 1 && code === "P2034") return serializable(operation, attempts - 1);
    throw error;
  }
}

export async function reservePublicRequest(input: {
  requestId: string;
  runId: string;
  visitorKeys: string[];
  estimateMicros: number;
  now?: Date;
}) {
  const prisma = getPrisma();
  const now = input.now ?? new Date();
  const window = periods(now);

  try {
    return await serializable(() =>
      prisma.$transaction(
        async (tx) => {
          const existing = await tx.usageLedger.findFirst({
            where: { requestId: input.requestId, kind: "RESERVE" },
            select: { bucketId: true },
          });
          if (existing) return { status: "reserved" as const, requestId: input.requestId };

          const uniqueVisitorKeys = [...new Set(input.visitorKeys)];
          if (uniqueVisitorKeys.length === 0) throw new Error("At least one visitor key is required.");
          const visitorBuckets = [];
          for (const visitorKey of uniqueVisitorKeys) {
            const minute = await tx.usageBucket.upsert({
                where: { scope_key_window_periodStart: { scope: "PUBLIC", key: `visitor:${visitorKey}`, window: "MINUTE", periodStart: window.minute.start } },
                create: { key: `visitor:${visitorKey}`, scope: "PUBLIC", window: "MINUTE", periodStart: window.minute.start, periodEnd: window.minute.end },
                update: {},
              });
            const day = await tx.usageBucket.upsert({
                where: { scope_key_window_periodStart: { scope: "PUBLIC", key: `visitor:${visitorKey}`, window: "DAY", periodStart: window.day.start } },
                create: { key: `visitor:${visitorKey}`, scope: "PUBLIC", window: "DAY", periodStart: window.day.start, periodEnd: window.day.end },
                update: {},
              });
            visitorBuckets.push({ minute, day });
          }
          const globalDay = await tx.usageBucket.upsert({
            where: {
              scope_key_window_periodStart: {
                scope: "PUBLIC",
                key: "global",
                window: "DAY",
                periodStart: window.day.start,
              },
            },
            create: {
              key: "global",
              scope: "PUBLIC",
              window: "DAY",
              periodStart: window.day.start,
              periodEnd: window.day.end,
            },
            update: {},
          });
          const providerMonthBucket = await tx.usageBucket.upsert({
            where: { scope_key_window_periodStart: { scope: "PUBLIC", key: "provider:meta", window: "MONTH", periodStart: window.month.start } },
            create: { scope: "PUBLIC", key: "provider:meta", window: "MONTH", periodStart: window.month.start, periodEnd: window.month.end },
            update: {},
          });
          const legacyMonth = await tx.usageBucket.aggregate({
            where: { key: "global", window: "MONTH", periodStart: window.month.start },
            _sum: { spentMicros: true, reservedMicros: true },
          });

          if (visitorBuckets.some(({ minute }) => minute.requestCount >= PUBLIC_GUARDRAIL_LIMITS.requestsPerMinute)) throw new AdmissionError("minute_limit");
          if (visitorBuckets.some(({ day }) => day.requestCount >= PUBLIC_GUARDRAIL_LIMITS.requestsPerDay)) throw new AdmissionError("day_limit");
          if (globalDay.activeCount >= PUBLIC_GUARDRAIL_LIMITS.maxConcurrent) throw new AdmissionError("concurrency_limit");
          if (globalDay.spentMicros + globalDay.reservedMicros + BigInt(input.estimateMicros) > BigInt(PUBLIC_GUARDRAIL_LIMITS.dailyBudgetMicros)) {
            throw new AdmissionError("daily_budget");
          }
          if (
            providerMonthBucket.spentMicros +
              providerMonthBucket.reservedMicros +
              (legacyMonth._sum.spentMicros ?? 0n) +
              (legacyMonth._sum.reservedMicros ?? 0n) +
              BigInt(input.estimateMicros) >
            BigInt(META_PROVIDER_GUARDRAIL_LIMITS.monthlyBudgetMicros)
          ) {
            throw new AdmissionError("monthly_budget");
          }

          for (const { minute, day } of visitorBuckets) {
            await tx.usageBucket.update({ where: { id: minute.id }, data: { requestCount: { increment: 1 } } });
            await tx.usageBucket.update({ where: { id: day.id }, data: { requestCount: { increment: 1 } } });
          }
          await tx.usageBucket.update({
            where: { id: globalDay.id },
            data: { requestCount: { increment: 1 }, activeCount: { increment: 1 }, reservedMicros: { increment: input.estimateMicros } },
          });
          await tx.usageBucket.update({
            where: { id: providerMonthBucket.id },
            data: { requestCount: { increment: 1 }, reservedMicros: { increment: input.estimateMicros } },
          });
          await tx.usageLedger.createMany({
            data: [globalDay, providerMonthBucket].map((bucket) => ({
              id: randomUUID(),
              bucketId: bucket.id,
              runId: input.runId,
              requestId: input.requestId,
              kind: "RESERVE" as const,
              costMicros: input.estimateMicros,
            })),
          });
          return { status: "reserved" as const, requestId: input.requestId };
        },
        { isolationLevel: "Serializable" },
      ),
    );
  } catch (error) {
    if (error instanceof AdmissionError) return { status: "rejected" as const, reason: error.code };
    throw error;
  }
}

export async function reservePrivateRequest(input: {
  requestId: string;
  runId: string;
  ownerSub: string;
  estimateMicros: number;
  now?: Date;
}) {
  const prisma = getPrisma();
  const now = input.now ?? new Date();
  const window = periods(now);
  try {
    return await serializable(() =>
      prisma.$transaction(
        async (tx) => {
          const ownerDay = await tx.usageBucket.upsert({
            where: { scope_key_window_periodStart: { scope: "PRIVATE", key: `owner:${input.ownerSub}`, window: "DAY", periodStart: window.day.start } },
            create: { scope: "PRIVATE", key: `owner:${input.ownerSub}`, window: "DAY", periodStart: window.day.start, periodEnd: window.day.end },
            update: {},
          });
          const providerMonthBucket = await tx.usageBucket.upsert({
            where: { scope_key_window_periodStart: { scope: "PUBLIC", key: "provider:meta", window: "MONTH", periodStart: window.month.start } },
            create: { scope: "PUBLIC", key: "provider:meta", window: "MONTH", periodStart: window.month.start, periodEnd: window.month.end },
            update: {},
          });
          const legacyMonth = await tx.usageBucket.aggregate({
            where: { key: "global", window: "MONTH", periodStart: window.month.start },
            _sum: { spentMicros: true, reservedMicros: true },
          });
          const existing = await tx.usageLedger.findFirst({ where: { requestId: input.requestId, kind: "RESERVE" } });
          if (existing) return { status: "reserved" as const };
          if (ownerDay.requestCount >= PRIVATE_GUARDRAIL_LIMITS.requestsPerDay) throw new AdmissionError("day_limit");
          if (
            providerMonthBucket.spentMicros +
              providerMonthBucket.reservedMicros +
              (legacyMonth._sum.spentMicros ?? 0n) +
              (legacyMonth._sum.reservedMicros ?? 0n) +
              BigInt(input.estimateMicros) >
            BigInt(META_PROVIDER_GUARDRAIL_LIMITS.monthlyBudgetMicros)
          ) {
            throw new AdmissionError("monthly_budget");
          }
          await tx.usageBucket.update({ where: { id: ownerDay.id }, data: { requestCount: { increment: 1 } } });
          await tx.usageBucket.update({ where: { id: providerMonthBucket.id }, data: { requestCount: { increment: 1 }, reservedMicros: { increment: input.estimateMicros } } });
          await tx.usageLedger.create({
            data: { bucketId: providerMonthBucket.id, runId: input.runId, requestId: input.requestId, kind: "RESERVE", costMicros: input.estimateMicros },
          });
          return { status: "reserved" as const };
        },
        { isolationLevel: "Serializable" },
      ),
    );
  } catch (error) {
    if (error instanceof AdmissionError) return { status: "rejected" as const, reason: error.code };
    throw error;
  }
}

async function finishReservation(input: {
  requestId: string;
  runId: string;
  actualMicros: number;
  kind: "COMMIT" | "RELEASE";
  inputTokens?: number;
  outputTokens?: number;
}) {
  const prisma = getPrisma();
  return serializable(() =>
    prisma.$transaction(
      async (tx) => {
        const reservations = (await tx.usageLedger.findMany({
          where: { requestId: input.requestId, kind: "RESERVE" },
          include: { bucket: true },
        })) as Prisma.UsageLedgerGetPayload<{ include: { bucket: true } }>[];
        for (const reservation of reservations) {
          const alreadyFinished = await tx.usageLedger.findFirst({
            where: {
              bucketId: reservation.bucketId,
              requestId: input.requestId,
              kind: { in: ["COMMIT", "RELEASE"] },
            },
          });
          if (alreadyFinished) continue;
          const reserved = Number(reservation.costMicros);
          await tx.usageBucket.update({
            where: { id: reservation.bucketId },
            data: {
              reservedMicros: { decrement: reserved },
              spentMicros: input.kind === "COMMIT" ? { increment: input.actualMicros } : undefined,
              activeCount:
                reservation.bucket.window === "DAY" ? { decrement: 1 } : undefined,
            },
          });
          await tx.usageLedger.create({
            data: {
              bucketId: reservation.bucketId,
              runId: input.runId,
              requestId: input.requestId,
              kind: input.kind,
              costMicros: input.kind === "COMMIT" ? input.actualMicros : 0,
              inputTokens: input.inputTokens ?? 0,
              outputTokens: input.outputTokens ?? 0,
            },
          });
        }
      },
      { isolationLevel: "Serializable" },
    ),
  );
}

export function settlePublicRequest(input: {
  requestId: string;
  runId: string;
  actualMicros: number;
  inputTokens: number;
  outputTokens: number;
}) {
  return finishReservation({ ...input, kind: "COMMIT" });
}

export function releasePublicRequest(input: { requestId: string; runId: string }) {
  return finishReservation({ ...input, actualMicros: 0, kind: "RELEASE" });
}

export const settlePrivateRequest = settlePublicRequest;
export const releasePrivateRequest = releasePublicRequest;
