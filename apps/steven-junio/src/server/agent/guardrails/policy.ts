export type KnowledgeAccessDecision =
  | { allowed: true }
  | { allowed: false; reason: "model_access_blocked" | "not_approved" | "owner_required" | "not_public" };

export function decideKnowledgeAccess(
  record: {
    classification: "public" | "private" | "never_publish";
    modelAccess: "allowed" | "blocked";
    status: "draft" | "approved" | "revoked";
  },
  context: { scope: "public" | "private"; isOwner: boolean },
): KnowledgeAccessDecision {
  if (record.modelAccess !== "allowed") return { allowed: false, reason: "model_access_blocked" };
  if (record.status !== "approved") return { allowed: false, reason: "not_approved" };
  if (context.scope === "public") {
    return record.classification === "public"
      ? { allowed: true }
      : { allowed: false, reason: "not_public" };
  }
  if (!context.isOwner) return { allowed: false, reason: "owner_required" };
  return { allowed: true };
}
