import { getPrisma } from "@/library/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { addKnowledgeAction, publishReleaseAction, savePersonaAction, seedSiteKnowledgeAction } from "./actions";

const DEFAULT_PERSONA = "Speak as AI Steven in first person while always disclosing that you are an AI representation. Use only supplied Steven knowledge, cite factual claims, be direct and friendly, never speculate, and say when the sources do not contain an answer.";

export const dynamic = "force-dynamic";

export default async function KnowledgeAdminPage() {
  const prisma = getPrisma();
  const [sourceRows, releaseRows, personas] = await Promise.all([
    prisma.knowledgeSource.findMany({ include: { revisions: { orderBy: { version: "desc" }, take: 1, include: { _count: { select: { chunks: true } } } } }, orderBy: { updatedAt: "desc" } }),
    prisma.knowledgeRelease.findMany({ include: { _count: { select: { items: true } } }, orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.personaVersion.findMany({ where: { active: true } }),
  ]);
  const sources = sourceRows as Prisma.KnowledgeSourceGetPayload<{ include: { revisions: { include: { _count: { select: { chunks: true } } } } } }>[];
  const releases = releaseRows as Prisma.KnowledgeReleaseGetPayload<{ include: { _count: { select: { items: true } } } }>[];

  return (
    <main className="mx-auto grid max-w-7xl gap-8 px-5 py-8 lg:grid-cols-[1fr_380px]">
      <div className="space-y-8">
        <section>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div><p className="text-sm font-semibold text-emerald-700">Steven Agent</p><h1 className="text-3xl font-bold">Knowledge library</h1><p className="mt-2 text-sm text-slate-600">Sources stay private until an immutable public release is published.</p></div>
            <form action={seedSiteKnowledgeAction}><button className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white">Sync portfolio + blog</button></form>
          </div>
          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {sources.length === 0 ? <p className="p-6 text-sm text-slate-500">No sources yet. Sync the site or add one manually.</p> : sources.map((source) => (
              <div key={source.id} className="flex items-center justify-between gap-4 border-b border-slate-100 p-4 last:border-0">
                <div><h2 className="font-medium">{source.name}</h2><p className="mt-1 text-xs text-slate-500">{source.kind} · revision {source.revisions[0]?.version ?? 0} · {source.revisions[0]?._count.chunks ?? 0} chunks</p></div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${source.scope === "PUBLIC" ? "bg-emerald-50 text-emerald-700" : source.scope === "PRIVATE" ? "bg-blue-50 text-blue-700" : "bg-red-50 text-red-700"}`}>{source.scope.replace("_", " ")}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Public releases</h2>
          <p className="mt-1 text-sm text-slate-600">Publishing replaces the active release with a snapshot of all ready public sources.</p>
          <form action={publishReleaseAction} className="mt-4 flex gap-3"><input name="name" required placeholder={`Portfolio release ${new Date().toLocaleDateString()}`} className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2" /><button className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white">Publish</button></form>
          <div className="mt-4 space-y-2">{releases.map((release) => <div key={release.id} className="flex justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm"><span>{release.name} · {release._count.items} chunks</span><span className="font-medium">{release.status}</span></div>)}</div>
        </section>
      </div>

      <aside className="space-y-6">
        <form action={addKnowledgeAction} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div><h2 className="font-semibold">Add knowledge</h2><p className="mt-1 text-xs leading-5 text-slate-500">New information is versioned. Public classification still requires a release before visitors can retrieve it.</p></div>
          <input name="name" required placeholder="Source name" className="w-full rounded-xl border border-slate-300 px-3 py-2" />
          <input name="sourceUrl" type="url" placeholder="Source URL (optional)" className="w-full rounded-xl border border-slate-300 px-3 py-2" />
          <select name="scope" className="w-full rounded-xl border border-slate-300 px-3 py-2"><option value="PRIVATE">Private</option><option value="PUBLIC">Public candidate</option><option value="NEVER_PUBLISH">Never publish</option></select>
          <textarea name="content" rows={8} placeholder="Paste Markdown or plain text…" className="w-full rounded-xl border border-slate-300 px-3 py-2" />
          <input name="file" type="file" accept=".txt,.md,.pdf,.docx,text/plain,text/markdown,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="w-full text-sm" />
          <label className="flex items-center gap-2 text-sm"><input name="modelAccess" type="checkbox" defaultChecked /> Allow approved model access</label>
          <button className="w-full rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white">Add revision</button>
        </form>

        <form action={savePersonaAction} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div><h2 className="font-semibold">Persona</h2><p className="mt-1 text-xs text-slate-500">Activating creates a new version.</p></div>
          <select name="scope" className="w-full rounded-xl border border-slate-300 px-3 py-2"><option value="PUBLIC">Public</option><option value="PRIVATE">Private</option></select>
          <textarea name="instructions" rows={8} defaultValue={personas.find((item) => item.scope === "PUBLIC")?.instructions ?? DEFAULT_PERSONA} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" />
          <button className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium">Save and activate</button>
        </form>
      </aside>
    </main>
  );
}
