"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, Sparkles, X } from "lucide-react";
import { useAssistantStore, type ChatMessage } from "@/store/assistant";
import { useHasMounted } from "@/hooks/use-has-mounted";

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Ciao, sono il concierge digitale di Lynux Profumi. Posso consigliarti una fragranza, spiegarti spedizioni e pagamenti, o aiutarti a tracciare un ordine.",
};

const QUICK_REPLIES = [
  "Consigliami un profumo legnoso",
  "Come funziona la spedizione?",
  "Traccia il mio ordine",
];

interface ChatWidgetProps {
  aiEnabled: boolean;
}

export function ChatWidget({ aiEnabled }: ChatWidgetProps) {
  const mounted = useHasMounted();
  const isOpen = useAssistantStore((state) => state.isOpen);
  const messages = useAssistantStore((state) => state.messages);
  const sending = useAssistantStore((state) => state.sending);
  const toggle = useAssistantStore((state) => state.toggle);
  const close = useAssistantStore((state) => state.close);
  const addMessage = useAssistantStore((state) => state.addMessage);
  const setSending = useAssistantStore((state) => state.setSending);

  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const displayMessages = messages.length > 0 ? messages : [WELCOME_MESSAGE];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: "user", content: trimmed };
    const history = [...messages, userMessage];
    addMessage(userMessage);
    setInput("");
    setSending(true);

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.map((message) => ({ role: message.role, content: message.content })),
        }),
      });
      const data = await response.json();

      addMessage({
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.reply?.text ?? "Non sono riuscito a rispondere. Riprova tra poco.",
        link: data.reply?.link,
      });
    } catch {
      addMessage({
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Errore di rete — riprova tra un istante.",
      });
    } finally {
      setSending(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendMessage(input);
  }

  if (!mounted) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="glass-panel flex h-[min(70vh,560px)] w-[min(92vw,380px)] flex-col overflow-hidden rounded-md shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-gold/40 text-gold">
                  <Sparkles className="h-3.5 w-3.5" />
                </span>
                <div>
                  <p className="font-display text-sm text-cream">Concierge Lynux</p>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    {aiEnabled ? "Assistente AI" : "Assistente Lynux"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Chiudi la chat"
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-gold cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {displayMessages.map((message) => (
                <div
                  key={message.id}
                  className={message.role === "user" ? "flex justify-end" : "flex justify-start"}
                >
                  <div
                    className={
                      message.role === "user"
                        ? "max-w-[85%] rounded-sm bg-gold px-3.5 py-2.5 text-xs text-obsidian"
                        : "max-w-[85%] rounded-sm border border-border bg-obsidian-raised px-3.5 py-2.5 text-xs text-cream"
                    }
                  >
                    <p className="leading-relaxed">{message.content}</p>
                    {message.link && (
                      <Link
                        href={message.link.href}
                        onClick={close}
                        className="mt-2 inline-block text-[11px] uppercase tracking-wide text-gold underline underline-offset-4"
                      >
                        {message.link.label}
                      </Link>
                    )}
                  </div>
                </div>
              ))}

              {sending && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1 rounded-sm border border-border bg-obsidian-raised px-3.5 py-2.5">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gold [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gold [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gold" />
                  </div>
                </div>
              )}

              {messages.length === 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {QUICK_REPLIES.map((reply) => (
                    <button
                      key={reply}
                      type="button"
                      onClick={() => sendMessage(reply)}
                      className="rounded-full border border-gold/30 px-3 py-1.5 text-[11px] text-muted-foreground transition-colors hover:border-gold hover:text-gold cursor-pointer"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-border p-3">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Scrivi un messaggio…"
                className="flex-1 rounded-sm border border-border bg-transparent px-3 py-2 text-xs text-cream placeholder:text-muted-foreground/60 outline-none focus:border-gold"
              />
              <button
                type="submit"
                disabled={sending || input.trim().length === 0}
                aria-label="Invia messaggio"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-gold text-obsidian transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={toggle}
        aria-label={isOpen ? "Chiudi l'assistente" : "Apri l'assistente"}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-gold text-obsidian shadow-lg transition-transform hover:scale-105 cursor-pointer"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Bot className="h-6 w-6" />}
      </button>
    </div>
  );
}
