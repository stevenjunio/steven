import type { Metadata } from "next";
import { AgentChat } from "@/components/agent/AgentChat";

export const metadata: Metadata = {
  title: "Ask AI Steven",
  description: "Ask an AI representation of Steven Junio about his work, projects, and experience.",
};

export default function AskStevenPage() {
  return (
    <main className="h-[calc(100dvh-68px)] min-h-0 bg-slate-50 sm:p-4">
      <div className="mx-auto h-full max-w-5xl">
        <h1 className="sr-only">Ask AI Steven</h1>
        <AgentChat variant="page" />
      </div>
    </main>
  );
}
