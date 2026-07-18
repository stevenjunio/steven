import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AgentChat } from "@/components/agent/AgentChat";
import { getAdminSubject } from "@/library/isUserAdmin";
import { getMetaMonthlySpend } from "@/server/agent/guardrails/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Chat",
  description: "Chat with Steven Junio's AI agent.",
  robots: { index: false, follow: false },
};

export default async function ChatPage() {
  const ownerSub = await getAdminSubject();
  if (!ownerSub) redirect("/login");
  const monthlySpend = await getMetaMonthlySpend();

  return (
    <main className="h-[calc(100dvh-68px)] min-h-0 bg-[#f5f5f4] sm:p-4">
      <div className="mx-auto h-full max-w-5xl">
        <h1 className="sr-only">Chat</h1>
        <AgentChat
          mode="private"
          variant="page"
          initialMonthlySpend={monthlySpend}
        />
      </div>
    </main>
  );
}
