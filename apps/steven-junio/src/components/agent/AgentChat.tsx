"use client";

import { ChangeEvent, FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";

type Citation = { id: string; title: string; url: string | null; excerpt: string };
type SpendSummary = { spentMicros: number; reservedMicros: number; limitMicros: number };
type Message = {
  id: string;
  role: "USER" | "ASSISTANT";
  content: string;
  citations?: Citation[];
  costMicros?: number;
  streaming?: boolean;
};
type StreamEvent = {
  type: "delta" | "done" | "error";
  delta?: string;
  answer?: string;
  citations?: Citation[];
  conversationId?: string;
  costMicros?: number;
  message?: string;
  messageId?: string;
  monthlySpend?: SpendSummary;
};
type AgentChatProps = {
  mode?: "public" | "private";
  compact?: boolean;
  variant?: "card" | "page";
  initialMonthlySpend?: SpendSummary;
};

export function AgentChat({
  mode = "public",
  compact = false,
  variant = "card",
  initialMonthlySpend,
}: AgentChatProps) {
  const storageKey = `steven-agent-${mode}-conversation`;
  const [conversationId, setConversationId] = useState<string>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [attachment, setAttachment] = useState<File>();
  const [monthlySpend, setMonthlySpend] = useState(initialMonthlySpend);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const endRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const maxLength = mode === "public" ? 1_500 : 8_000;
  const isPage = variant === "page";
  const isPrivate = mode === "private";

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

  function resizeTextarea() {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "0px";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 144)}px`;
  }

  function chooseFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) setAttachment(file);
    event.target.value = "";
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const value = input.trim();
    if ((!value && !attachment) || loading) return;

    const optimisticId = crypto.randomUUID();
    const assistantId = crypto.randomUUID();
    const displayContent = attachment
      ? `${value || "Save this file to memory."}\n\n📎 ${attachment.name}`
      : value;
    setMessages((current) => [
      ...current,
      { id: optimisticId, role: "USER", content: displayContent },
      { id: assistantId, role: "ASSISTANT", content: "", streaming: true },
    ]);
    const submittedFile = attachment;
    setInput("");
    setAttachment(undefined);
    setLoading(true);
    setError(undefined);
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    try {
      let body: BodyInit;
      let headers: HeadersInit | undefined;
      if (isPrivate && submittedFile) {
        const data = new FormData();
        data.set("message", value);
        data.set("file", submittedFile);
        if (conversationId) data.set("conversationId", conversationId);
        body = data;
      } else {
        headers = { "Content-Type": "application/json" };
        body = JSON.stringify({ message: value, conversationId });
      }

      const response = await fetch(`/api/v1/agent/${mode}/chat`, { method: "POST", headers, body });
      if (!response.ok || !response.body) {
        const failed = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(failed?.message ?? "Chat is temporarily unavailable.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let finalEvent: StreamEvent | undefined;

      const consumeLine = (line: string) => {
        if (!line.trim()) return;
        const streamEvent = JSON.parse(line) as StreamEvent;
        if (streamEvent.type === "error") throw new Error(streamEvent.message ?? "Chat is temporarily unavailable.");
        if (streamEvent.type === "delta" && streamEvent.delta) {
          setMessages((current) => current.map((message) =>
            message.id === assistantId
              ? { ...message, content: message.content + streamEvent.delta }
              : message,
          ));
        }
        if (streamEvent.type === "done") finalEvent = streamEvent;
      };

      while (true) {
        const { done, value: chunk } = await reader.read();
        buffer += decoder.decode(chunk, { stream: !done });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        lines.forEach(consumeLine);
        if (done) break;
      }
      if (buffer) consumeLine(buffer);
      if (!finalEvent?.answer || !finalEvent.conversationId) {
        throw new Error("The response was interrupted. Try again.");
      }

      setConversationId(finalEvent.conversationId);
      if (finalEvent.monthlySpend) setMonthlySpend(finalEvent.monthlySpend);
      window.localStorage.setItem(storageKey, finalEvent.conversationId);
      setMessages((current) => current.map((message) =>
        message.id === assistantId
          ? {
              id: finalEvent?.messageId ?? assistantId,
              role: "ASSISTANT",
              content: finalEvent?.answer ?? message.content,
              citations: finalEvent?.citations,
              costMicros: finalEvent?.costMicros,
              streaming: false,
            }
          : message,
      ));
    } catch (caught) {
      setMessages((current) => current.filter((message) => message.id !== assistantId || message.content));
      setError(caught instanceof Error ? caught.message : "Chat is temporarily unavailable.");
    } finally {
      setLoading(false);
      requestAnimationFrame(() => textareaRef.current?.focus());
    }
  }

  async function deleteConversation() {
    if (loading) return;
    if (conversationId) await fetch(`/api/v1/agent/${mode}/conversations/${conversationId}`, { method: "DELETE" });
    setConversationId(undefined);
    setMessages([]);
    setError(undefined);
    window.localStorage.removeItem(storageKey);
    textareaRef.current?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  const budgetPercent = monthlySpend
    ? Math.min(100, (monthlySpend.spentMicros / monthlySpend.limitMicros) * 100)
    : 0;

  return (
    <section
      aria-label="Chat"
      className={`relative flex min-h-0 flex-col overflow-hidden bg-white ${
        isPage
          ? "h-full rounded-none sm:rounded-[28px] sm:border sm:border-slate-200/80 sm:shadow-xl sm:shadow-slate-950/5"
          : `rounded-3xl border border-slate-200 shadow-2xl shadow-slate-950/10 ${compact ? "h-[min(74vh,660px)]" : "h-[min(78vh,760px)]"}`
      }`}
    >
      {messages.length > 0 && (
        <button type="button" onClick={deleteConversation} disabled={loading} aria-label="New chat" className="absolute left-3 top-3 z-10 grid size-9 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40 sm:left-4 sm:top-4">
          <ComposeIcon className="size-4" />
        </button>
      )}
      {isPrivate && monthlySpend && (
        <div className="absolute right-4 top-4 z-10 w-24" aria-label={`Monthly agent spend: ${formatBudget(monthlySpend.spentMicros)} of ${formatBudget(monthlySpend.limitMicros)}`}>
          <p className="text-right text-[10px] tabular-nums text-slate-400">
            {formatBudget(monthlySpend.spentMicros)} / {formatBudget(monthlySpend.limitMicros)}
          </p>
          <div className="mt-1 h-px overflow-hidden bg-slate-200" role="progressbar" aria-valuemin={0} aria-valuemax={monthlySpend.limitMicros} aria-valuenow={monthlySpend.spentMicros}>
            <div className="h-full bg-slate-500" style={{ width: `${budgetPercent}%` }} />
          </div>
        </div>
      )}

      <div aria-live="polite" className={`flex-1 overflow-y-auto overscroll-contain bg-[#fafafa] ${messages.length > 0 ? "space-y-6" : ""} ${isPage ? "px-4 py-16 sm:px-8" : "p-5 pt-14"}`}>
        {messages.map((message) => (
          <article key={message.id} className={`mx-auto flex w-full max-w-3xl ${message.role === "USER" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[88%] text-[15px] leading-7 sm:max-w-[78%] ${message.role === "USER" ? "rounded-3xl rounded-br-lg bg-slate-950 px-4 py-2.5 text-white" : "text-slate-800"}`}>
              {message.content ? <p className="whitespace-pre-wrap">{message.content}</p> : <ThinkingDots />}
              {message.streaming && message.content && <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse rounded-full bg-slate-400 align-middle" aria-hidden="true" />}
              {!message.streaming && message.role === "ASSISTANT" && Boolean(message.costMicros) && (
                <p className="mt-1 text-[10px] leading-none tabular-nums text-slate-400" aria-label={`This response cost ${formatTurnCost(message.costMicros ?? 0)}`}>
                  {formatTurnCost(message.costMicros ?? 0)}
                </p>
              )}
              {message.citations && message.citations.length > 0 && (
                <details className="mt-3 border-t border-slate-200 pt-2 text-xs text-slate-500">
                  <summary className="w-fit cursor-pointer select-none font-medium hover:text-slate-800">Sources · {message.citations.length}</summary>
                  <ul className="mt-2 space-y-2">
                    {message.citations.map((citation) => (
                      <li key={citation.id}>
                        {citation.url ? (
                          <a href={citation.url} target="_blank" rel="noreferrer" className="font-medium text-slate-700 underline decoration-slate-300 underline-offset-2 hover:text-slate-950">{citation.title}</a>
                        ) : <span className="font-medium text-slate-700">{citation.title}</span>}
                        {citation.excerpt && <p className="mt-0.5 line-clamp-2 leading-5 text-slate-500">{citation.excerpt}</p>}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          </article>
        ))}
        {error && <div role="alert" className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        <div ref={endRef} />
      </div>

      <form onSubmit={submit} className={`shrink-0 border-t border-slate-200/80 bg-white ${isPage ? "px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:px-6 sm:pb-5 sm:pt-4" : "p-4"}`}>
        {attachment && (
          <div className="mx-auto mb-2 flex max-w-3xl items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-xs text-slate-700">
            <PaperclipIcon className="size-3.5 shrink-0" />
            <span className="min-w-0 flex-1 truncate">{attachment.name}</span>
            <button type="button" onClick={() => setAttachment(undefined)} aria-label="Remove attachment" className="grid size-6 place-items-center rounded-full hover:bg-slate-200">×</button>
          </div>
        )}
        <div className="mx-auto flex max-w-3xl items-end gap-1 rounded-[22px] border border-slate-300 bg-white p-1.5 shadow-sm transition focus-within:border-slate-500 focus-within:shadow-md">
          {isPrivate && (
            <>
              <input ref={fileRef} type="file" accept=".txt,.md,.pdf,.docx,text/plain,text/markdown,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={chooseFile} className="sr-only" />
              <button type="button" onClick={() => fileRef.current?.click()} disabled={loading} aria-label="Attach file" className="grid size-11 shrink-0 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 disabled:opacity-40">
                <PaperclipIcon className="size-5" />
              </button>
            </>
          )}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(event) => { setInput(event.target.value); resizeTextarea(); }}
            onKeyDown={handleKeyDown}
            maxLength={maxLength}
            rows={1}
            placeholder="Message"
            aria-label="Message"
            className="max-h-36 min-h-11 flex-1 resize-none bg-transparent px-2 py-2.5 text-[15px] leading-6 text-slate-950 outline-none placeholder:text-slate-400"
          />
          <button disabled={loading || (!input.trim() && !attachment)} className="grid size-11 shrink-0 place-items-center rounded-full bg-slate-950 text-white transition hover:scale-[1.03] hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-30" aria-label="Send">
            <ArrowUpIcon className="size-5" />
          </button>
        </div>
      </form>
    </section>
  );
}

function formatTurnCost(micros: number) {
  if (micros > 0 && micros < 100) return "<$0.0001";
  return `$${(micros / 1_000_000).toFixed(4)}`;
}

function formatBudget(micros: number) {
  return `$${(micros / 1_000_000).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

function ThinkingDots() {
  return (
    <span className="flex h-7 items-center gap-1" aria-label="Thinking">
      {[0, 1, 2].map((index) => <span key={index} className="size-1.5 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: `${index * 120}ms` }} />)}
    </span>
  );
}

function ComposeIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" /></svg>;
}

function PaperclipIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.4 11.6-8.9 8.9a6 6 0 0 1-8.5-8.5l9.6-9.6a4 4 0 0 1 5.7 5.7l-9.6 9.6a2 2 0 0 1-2.8-2.8l8.9-8.9" /></svg>;
}

function ArrowUpIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6" /></svg>;
}
