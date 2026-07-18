import type { Metadata } from "next";
import { AgentChat } from "@/components/agent/AgentChat";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My agent",
  robots: { index: false, follow: false },
};

export default function PrivateAgentPage() {
  return (
    <main className="h-[calc(100dvh-57px)] min-h-0 bg-[#f5f5f4] sm:p-4">
      <div className="mx-auto h-full max-w-5xl">
        <h1 className="sr-only">Steven&apos;s private agent</h1>
        <AgentChat mode="private" variant="page" />
      </div>
    </main>
  );
}
