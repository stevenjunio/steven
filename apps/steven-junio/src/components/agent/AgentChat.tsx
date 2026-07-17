"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type Citation = { id: string; title: string; url: string | null; excerpt: string };
type Message = { id: string; role: "USER" | "ASSISTANT"; content: string; citations?: Citation[] };
type AgentChatProps = {
  mode?: "public" | "private";
  compact?: boolean;
  variant?: "card" | "page";
};

export function AgentChat({ mode = "public", compact = false, variant = "card" }: AgentChatProps) {
  const storageKey = `steven-agent-${mode}-conversation`;
  const [conversationId, setConversationId] = useState<string>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const endRef = useRef<HTMLDivElement>(null);
  const maxLength = mode === "public" ? 1_500 : 8_000;
  const isPage = variant === "page";

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
      const payload = await response.text();
      let body: { answer?: string; citations?: Citation[]; conversationId?: string; message?: string; messageId?: string };
      try {
        body = JSON.parse(payload) as typeof body;
      } catch {
        throw new Error("AI Steven did not return a valid response. Please try again.");
      }
      if (!response.ok) throw new Error(body.message ?? "AI Steven is temporarily unavailable.");
      if (!body.answer || !body.conversationId) throw new Error("AI Steven returned an incomplete response. Please try again.");
      const answer = body.answer;
      const nextConversationId = body.conversationId;
      setConversationId(nextConversationId);
      window.localStorage.setItem(storageKey, nextConversationId);
      setMessages((current) => [
        ...current,
        {
          id: body.messageId ?? crypto.randomUUID(),
          role: "ASSISTANT",
          content: answer,
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
    <section
      aria-label="Chat with AI Steven"
      className={`flex min-h-0 flex-col overflow-hidden border border-slate-200 bg-white ${
        isPage
          ? "h-full rounded-none border-y-0 shadow-none sm:rounded-2xl sm:border-y sm:shadow-sm"
          : `rounded-3xl shadow-2xl shadow-slate-950/10 ${compact ? "h-[min(70vh,620px)]" : "h-[min(72vh,720px)]"}`
      }`}
    >
      <header className="flex items-center justify-between gap-4 border-b border-slate-200 px-4 py-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-slate-950 text-[11px] font-semibold tracking-wide text-white">SJ</span>
          <div className="min-w-0">
            <h2 className="font-semibold text-slate-950">AI Steven</h2>
            <p className="truncate text-xs text-slate-500">AI representation of Steven</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button type="button" onClick={deleteConversation} className="shrink-0 rounded-lg px-3 py-2 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900">
            New chat
          </button>
        )}
      </header>

      <div
        aria-live="polite"
        className={`flex-1 overflow-y-auto bg-slate-50/70 ${messages.length > 0 ? "space-y-5" : ""} ${isPage ? "p-4 sm:p-6" : "p-5"}`}
      >
        {messages.length === 0 && (
          <div className="mx-auto flex h-full max-w-xl flex-col items-center justify-center text-center">
            <h3 className="text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">Ask me about my work</h3>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {["What are you building now?", "Tell me about Tabiya", "What kind of developer are you?"].map((prompt) => (
                <button type="button" key={prompt} onClick={() => setInput(prompt)} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 transition hover:border-slate-400 hover:text-slate-950">
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
                <details className="mt-3 border-t border-slate-100 pt-2 text-xs text-slate-500">
                  <summary className="w-fit cursor-pointer select-none font-medium hover:text-slate-800">Sources ({message.citations.length})</summary>
                  <ul className="mt-2 space-y-2">
                    {message.citations.map((citation) => (
                      <li key={citation.id}>
                        {citation.url ? (
                          <a href={citation.url} target="_blank" rel="noreferrer" className="font-medium text-slate-700 underline decoration-slate-300 underline-offset-2 hover:text-slate-950">
                            {citation.id} · {citation.title}
                          </a>
                        ) : (
                          <span className="font-medium text-slate-700">{citation.id} · {citation.title}</span>
                        )}
                        {citation.excerpt && <p className="mt-0.5 line-clamp-2 leading-5 text-slate-500">{citation.excerpt}</p>}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          </article>
        ))}
        {loading && <div className="w-fit rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">Thinking from Steven’s sources…</div>}
        {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        <div ref={endRef} />
      </div>

      <form onSubmit={submit} className={`border-t border-slate-200 bg-white ${isPage ? "px-3 pb-3 pt-3 sm:px-5 sm:pb-4" : "p-4"}`}>
        <div className="mx-auto flex max-w-3xl items-end gap-3 rounded-2xl border border-slate-300 bg-white p-2 shadow-sm focus-within:border-slate-600 focus-within:ring-2 focus-within:ring-slate-100">
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
        <p className="mt-2 px-1 text-center text-[11px] text-slate-400">Grounded in Steven’s published sources. AI can make mistakes.</p>
      </form>
    </section>
  );
}
