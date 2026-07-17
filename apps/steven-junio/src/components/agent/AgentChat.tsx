"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type Citation = { id: string; title: string; url: string | null; excerpt: string };
type Message = { id: string; role: "USER" | "ASSISTANT"; content: string; citations?: Citation[] };

export function AgentChat({ mode = "public", compact = false }: { mode?: "public" | "private"; compact?: boolean }) {
  const storageKey = `steven-agent-${mode}-conversation`;
  const [conversationId, setConversationId] = useState<string>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const endRef = useRef<HTMLDivElement>(null);
  const maxLength = mode === "public" ? 1_500 : 8_000;

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (!saved) return;
    fetch(`/api/v1/agent/${mode}/conversations/${saved}`, { cache: "no-store" })
      .then(async (response) => (response.ok ? response.json() : null))
      .then((conversation) => {
        if (!conversation) {
          window.localStorage.removeItem(storageKey);
          return;
        }
        setConversationId(conversation.id);
        setMessages(
          conversation.messages.map((message: Message & { citations?: unknown }) => ({
            ...message,
            citations: Array.isArray(message.citations) ? message.citations : [],
          })),
        );
      })
      .catch(() => window.localStorage.removeItem(storageKey));
  }, [mode, storageKey]);

  useEffect(() => {
    if (messages.length > 0 || loading) {
      endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [messages, loading]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const value = input.trim();
    if (!value || loading) return;
    const optimisticId = crypto.randomUUID();
    setMessages((current) => [...current, { id: optimisticId, role: "USER", content: value }]);
    setInput("");
    setLoading(true);
    setError(undefined);
    try {
      const response = await fetch(`/api/v1/agent/${mode}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: value, conversationId }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message ?? "AI Steven is temporarily unavailable.");
      setConversationId(body.conversationId);
      window.localStorage.setItem(storageKey, body.conversationId);
      setMessages((current) => [
        ...current,
        {
          id: body.messageId ?? crypto.randomUUID(),
          role: "ASSISTANT",
          content: body.answer,
          citations: body.citations,
        },
      ]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "AI Steven is temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteConversation() {
    if (conversationId) await fetch(`/api/v1/agent/${mode}/conversations/${conversationId}`, { method: "DELETE" });
    setConversationId(undefined);
    setMessages([]);
    setError(undefined);
    window.localStorage.removeItem(storageKey);
  }

  return (
    <section className={`flex min-h-0 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/10 ${compact ? "h-[min(70vh,620px)]" : "h-[min(72vh,720px)]"}`}>
      <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgb(16_185_129_/_0.13)]" />
            <h2 className="font-semibold text-slate-950">AI Steven</h2>
          </div>
          <p className="mt-1 text-xs text-slate-500">An AI, answering only from information Steven shared.</p>
        </div>
        {messages.length > 0 && (
          <button onClick={deleteConversation} className="rounded-lg px-3 py-2 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900">
            Delete chat
          </button>
        )}
      </header>

      <div aria-live="polite" className="flex-1 space-y-5 overflow-y-auto bg-slate-50/70 p-5">
        {messages.length === 0 && (
          <div className="mx-auto flex h-full max-w-md flex-col items-center justify-center text-center">
            <div className="mb-4 grid size-14 place-items-center rounded-2xl bg-slate-950 text-xl text-white">SJ</div>
            <h3 className="text-xl font-semibold text-slate-950">Ask me about my work</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">Try my projects, the products I’ve built, my experience, or how I approach taking software from idea to launch.</p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {["What are you building now?", "Tell me about Tabiya", "What kind of developer are you?"].map((prompt) => (
                <button key={prompt} onClick={() => setInput(prompt)} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 hover:border-slate-400">
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((message) => (
          <article key={message.id} className={`flex ${message.role === "USER" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === "USER" ? "rounded-br-md bg-slate-950 text-white" : "rounded-bl-md border border-slate-200 bg-white text-slate-800 shadow-sm"}`}>
              <p className="whitespace-pre-wrap">{message.content}</p>
              {message.citations && message.citations.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                  {message.citations.map((citation) =>
                    citation.url ? (
                      <a key={citation.id} href={citation.url} target="_blank" rel="noreferrer" title={citation.excerpt} className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-200">
                        {citation.id} · {citation.title}
                      </a>
                    ) : (
                      <span key={citation.id} title={citation.excerpt} className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                        {citation.id} · {citation.title}
                      </span>
                    ),
                  )}
                </div>
              )}
            </div>
          </article>
        ))}
        {loading && <div className="w-fit rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">Thinking from Steven’s sources…</div>}
        {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        <div ref={endRef} />
      </div>

      <form onSubmit={submit} className="border-t border-slate-200 bg-white p-4">
        <div className="flex items-end gap-3 rounded-2xl border border-slate-300 bg-white p-2 focus-within:border-slate-600 focus-within:ring-2 focus-within:ring-slate-100">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                event.currentTarget.form?.requestSubmit();
              }
            }}
            maxLength={maxLength}
            rows={1}
            placeholder="Ask AI Steven…"
            className="max-h-32 min-h-11 flex-1 resize-none bg-transparent px-2 py-2.5 text-sm text-slate-950 outline-none placeholder:text-slate-400"
          />
          <button disabled={loading || !input.trim()} className="grid size-11 shrink-0 place-items-center rounded-xl bg-slate-950 text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Send question">
            <span aria-hidden="true">↑</span>
          </button>
        </div>
        <p className="mt-2 px-1 text-center text-[11px] text-slate-400">AI can make mistakes. Answers are limited to Steven’s published sources.</p>
      </form>
    </section>
  );
}
