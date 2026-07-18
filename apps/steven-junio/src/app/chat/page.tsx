import type { Metadata } from "next";
import { AgentChat } from "@/components/agent/AgentChat";
import { getAdminSubject } from "@/library/isUserAdmin";
import { getMetaMonthlySpend } from "@/server/agent/guardrails/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Chat",
  description: "Chat with Steven Junio's AI agent.",
};

export default async function ChatPage() {
  const ownerSub = await getAdminSubject();
  const monthlySpend = ownerSub ? await getMetaMonthlySpend() : undefined;

  return (
    <main className="h-dvh min-h-0 bg-[#f5f5f4] sm:p-4">
      <div className="mx-auto h-full max-w-5xl">
        <h1 className="sr-only">Chat</h1>
        <AgentChat
          mode={ownerSub ? "private" : "public"}
          variant="page"
          initialMonthlySpend={monthlySpend}
        />
      </div>
    </main>
  );
}
