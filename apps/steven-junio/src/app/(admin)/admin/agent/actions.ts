"use server";

import { revalidatePath } from "next/cache";
import { getAdminSubject } from "@/library/isUserAdmin";
import { getPrisma } from "@/library/prisma";

export async function reviewMemoryAction(formData: FormData) {
  const actorSub = await getAdminSubject();
  if (!actorSub) throw new Error("Unauthorized");
  const id = String(formData.get("id") ?? "");
  const decision = String(formData.get("decision") ?? "");
  if (!id || !["approve", "reject"].includes(decision)) throw new Error("Invalid review.");
  const prisma = getPrisma();
  const candidate = await prisma.memoryCandidate.findUniqueOrThrow({ where: { id } });
  await prisma.$transaction(async (tx) => {
    await tx.memoryCandidate.update({
      where: { id },
      data: {
        status: decision === "approve" ? "APPROVED" : "REJECTED",
        reviewedAt: new Date(),
        reviewedBySub: actorSub,
      },
    });
    if (decision === "approve") {
      await tx.memoryFact.create({
        data: { scope: candidate.scope, content: candidate.content, sourceCandidateId: candidate.id },
      });
    }
    await tx.auditEvent.create({
      data: { actorSub, action: `memory.${decision}d`, entityType: "MemoryCandidate", entityId: id, scope: candidate.scope },
    });
  });
  revalidatePath("/chat");
}
