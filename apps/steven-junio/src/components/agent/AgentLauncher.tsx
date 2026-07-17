"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { AgentChat } from "./AgentChat";

export function AgentLauncher() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  if (pathname.startsWith("/admin") || pathname.startsWith("/ask") || pathname.startsWith("/auth")) return null;

  return (
    <>
      {open && (
        <div className="fixed inset-x-3 bottom-24 z-50 mx-auto max-w-md sm:inset-x-auto sm:right-6 sm:w-[400px]">
          <AgentChat compact />
        </div>
      )}
      <button
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? "Close AI Steven" : "Ask AI Steven"}
        className="fixed bottom-5 right-5 z-50 flex min-h-14 items-center gap-2 rounded-full border border-white/20 bg-slate-950 px-5 font-medium text-white shadow-2xl shadow-slate-950/30 transition hover:-translate-y-0.5 hover:bg-slate-800"
      >
        <span className="grid size-7 place-items-center rounded-full bg-white/15 text-xs">SJ</span>
        <span>{open ? "Close" : "Ask AI Steven"}</span>
      </button>
    </>
  );
}
