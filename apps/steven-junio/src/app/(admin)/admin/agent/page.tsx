import { AgentChat } from "@/components/agent/AgentChat";
import { getPrisma } from "@/library/prisma";
import { reviewMemoryAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function PrivateAgentPage() {
  const prisma = getPrisma();
  const [candidates, recentRuns] = await Promise.all([
    prisma.memoryCandidate.findMany({ where: { status: "PROPOSED" }, orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.agentRun.findMany({ orderBy: { createdAt: "desc" }, take: 12 }),
  ]);
  const enabled = process.env.STEVEN_AGENT_PRIVATE_MODEL_ENABLED === "true";

  return (
    <main className="mx-auto max-w-7xl px-5 py-8">
      <div className="mb-7"><p className="text-sm font-semibold text-blue-700">Owner only</p><h1 className="text-3xl font-bold">Private AI Steven</h1><p className="mt-2 text-sm text-slate-600">Private conversations and proposed memories are visible only to your configured Auth0 subject.</p></div>
      {!enabled && <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900"><strong>Private model calls are intentionally locked.</strong> Set <code>STEVEN_AGENT_PRIVATE_MODEL_ENABLED=true</code> only after approving the paid provider’s retention and training terms. Private knowledge can be curated safely while this remains off.</div>}
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <AgentChat mode="private" />
        <aside className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold">Memory review</h2><p className="mt-1 text-xs leading-5 text-slate-500">The agent can propose memories, but only your approval makes them durable.</p>
            <div className="mt-4 space-y-3">{candidates.length === 0 ? <p className="text-sm text-slate-500">No memory candidates.</p> : candidates.map((candidate) => (
              <div key={candidate.id} className="rounded-xl bg-slate-50 p-3"><p className="text-sm leading-5">{candidate.content}</p><form action={reviewMemoryAction} className="mt-3 flex gap-2"><input type="hidden" name="id" value={candidate.id} /><button name="decision" value="approve" className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white">Approve</button><button name="decision" value="reject" className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium">Reject</button></form></div>
            ))}</div>
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-semibold">Recent model runs</h2><div className="mt-3 space-y-2">{recentRuns.map((run) => <div key={run.id} className="flex justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs"><span>{run.scope} · {run.status}</span><span>{run.actualCostMicros ? `$${(Number(run.actualCostMicros) / 1_000_000).toFixed(4)}` : "—"}</span></div>)}</div></section>
        </aside>
      </div>
    </main>
  );
}
