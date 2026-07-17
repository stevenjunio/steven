import type { Metadata } from "next";
import { AgentChat } from "@/components/agent/AgentChat";

export const metadata: Metadata = {
  title: "Ask AI Steven",
  description: "Ask an AI representation of Steven Junio about his work, projects, and experience.",
};

export default function AskStevenPage() {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[radial-gradient(circle_at_top_left,_#dbeafe,_transparent_34%),radial-gradient(circle_at_bottom_right,_#d1fae5,_transparent_32%),#f8fafc] px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">A living portfolio</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 sm:text-6xl">Don’t just read my résumé. Ask it questions.</h1>
          <p className="mt-5 text-base leading-7 text-slate-600 sm:text-lg">AI Steven answers in my voice using information I’ve explicitly published. It cites the sources behind each factual answer and says when it doesn’t know.</p>
        </div>
        <AgentChat />
      </div>
    </main>
  );
}
