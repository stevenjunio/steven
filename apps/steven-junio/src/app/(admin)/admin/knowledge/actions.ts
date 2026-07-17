"use server";

import { createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import { getAdminSubject } from "@/library/isUserAdmin";
import { getPrisma } from "@/library/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { projects } from "../../../../../data/projects";
import { createKnowledgeRevision, publishPublicRelease } from "@/server/agent/knowledge";
import { extractKnowledgeUpload } from "@/server/agent/extract";

async function requireAdmin() {
  const subject = await getAdminSubject();
  if (!subject) throw new Error("Unauthorized");
  return subject;
}

function required(formData: FormData, key: string) {
  const value = formData.get(key);
  if (typeof value !== "string" || !value.trim()) throw new Error(`${key} is required.`);
  return value.trim();
}

function stripHtml(value: string) {
  return value.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

async function addIfChanged(input: Parameters<typeof createKnowledgeRevision>[0]) {
  const prisma = getPrisma();
  const source = (await prisma.knowledgeSource.findFirst({
    where: { name: input.name, kind: input.kind },
    include: { revisions: { orderBy: { version: "desc" }, take: 1 } },
  })) as Prisma.KnowledgeSourceGetPayload<{ include: { revisions: true } }> | null;
  const nextHash = createHash("sha256").update(input.content).digest("hex");
  if (source?.revisions[0]?.checksum === nextHash) return;
  await createKnowledgeRevision({ ...input, sourceId: source?.id });
}

export async function addKnowledgeAction(formData: FormData) {
  const actorSub = await requireAdmin();
  const scope = required(formData, "scope");
  if (!(["PUBLIC", "PRIVATE", "NEVER_PUBLISH"] as const).includes(scope as "PUBLIC")) throw new Error("Invalid scope.");
  const name = required(formData, "name");
  const pasted = typeof formData.get("content") === "string" ? String(formData.get("content")).trim() : "";
  const file = formData.get("file");
  const fileContent = file instanceof File && file.size > 0 ? await extractKnowledgeUpload(file) : "";
  const content = pasted || fileContent;
  if (!content) throw new Error("Paste content or attach a Markdown, text, PDF, or DOCX file.");
  const revision = await createKnowledgeRevision({
    name,
    kind: fileContent ? "UPLOAD" : "MANUAL",
    scope: scope as "PUBLIC" | "PRIVATE" | "NEVER_PUBLISH",
    content,
    sourceUrl: typeof formData.get("sourceUrl") === "string" ? String(formData.get("sourceUrl")).trim() || undefined : undefined,
    modelAccess: formData.get("modelAccess") === "on",
  });
  await getPrisma().auditEvent.create({
    data: { actorSub, action: "knowledge.revision.created", entityType: "KnowledgeRevision", entityId: revision.id, scope: revision.source.scope },
  });
  revalidatePath("/admin/knowledge");
}

export async function seedSiteKnowledgeAction() {
  const actorSub = await requireAdmin();
  for (const project of projects) {
    await addIfChanged({
      name: `Project: ${project.title}`,
      kind: "PORTFOLIO",
      scope: "PUBLIC",
      sourceUrl: `https://www.stevenjunio.com/projects/${project.slug}`,
      content: [
        `Project: ${project.title}`,
        project.description,
        "longDescription" in project ? project.longDescription : undefined,
        `Steven's role: ${project.myRole}`,
        "roleDescription" in project ? project.roleDescription : undefined,
        `Technologies: ${project.technologies.join(", ")}`,
      ].filter(Boolean).join("\n\n"),
    });
  }
  const posts = await getPrisma().post.findMany({ where: { published: true, content: { not: null } } });
  for (const post of posts) {
    await addIfChanged({
      name: `Blog: ${post.title}`,
      kind: "BLOG",
      scope: "PUBLIC",
      sourceUrl: post.slug ? `https://www.stevenjunio.com/blog/${post.slug}` : undefined,
      content: `${post.title}\n\n${stripHtml(post.content ?? "")}`,
    });
  }
  await getPrisma().auditEvent.create({ data: { actorSub, action: "knowledge.site_seeded", entityType: "KnowledgeSource", scope: "PUBLIC" } });
  revalidatePath("/admin/knowledge");
}

export async function publishReleaseAction(formData: FormData) {
  const actorSub = await requireAdmin();
  const release = await publishPublicRelease(required(formData, "name"));
  await getPrisma().auditEvent.create({ data: { actorSub, action: "knowledge.release.published", entityType: "KnowledgeRelease", entityId: release.id, scope: "PUBLIC" } });
  revalidatePath("/admin/knowledge");
}

export async function savePersonaAction(formData: FormData) {
  const actorSub = await requireAdmin();
  const scope = required(formData, "scope") as "PUBLIC" | "PRIVATE";
  if (!(["PUBLIC", "PRIVATE"] as const).includes(scope)) throw new Error("Invalid scope.");
  const instructions = required(formData, "instructions");
  const prisma = getPrisma();
  const latest = await prisma.personaVersion.findFirst({ where: { scope }, orderBy: { version: "desc" } });
  const persona = await prisma.$transaction(async (tx) => {
    await tx.personaVersion.updateMany({ where: { scope, active: true }, data: { active: false } });
    return tx.personaVersion.create({ data: { scope, version: (latest?.version ?? 0) + 1, instructions, active: true, activatedAt: new Date() } });
  });
  await prisma.auditEvent.create({ data: { actorSub, action: "persona.activated", entityType: "PersonaVersion", entityId: persona.id, scope } });
  revalidatePath("/admin/knowledge");
}
