import type { Metadata } from "next";
import { AgentChat } from "@/components/agent/AgentChat";

export const metadata: Metadata = {
  title: "Talk with Steven's agent",
  description: "A conversational AI reflection of Steven Junio—his ideas, work, interests, and evolving point of view.",
};

export default function AskStevenPage() {
  return (
    <main className="h-[calc(100dvh-68px)] min-h-0 bg-[#f5f5f4] sm:p-4">
      <div className="mx-auto h-full max-w-5xl">
        <h1 className="sr-only">Talk with Steven&apos;s agent</h1>
        <AgentChat variant="page" />
      </div>
    </main>
  );
}
