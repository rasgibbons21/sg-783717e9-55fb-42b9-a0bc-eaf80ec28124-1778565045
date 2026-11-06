import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { Loader2, Send } from "lucide-react";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { BloomMark } from "@/components/brand/BloomMark";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { trackPansyChat } from "@/lib/analytics";
import { practiceFetch } from "@/lib/practice/api";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED = [
  "What exactly is a fair value gap?",
  "How is an order block different from a breaker block?",
  "How do I use the 1H and 5m charts together?",
  "Which lesson should I do next?",
];

const TROUBLE = "I'm having a little trouble answering just now. Please try again in a moment.";

export default function AskPansyPage() {
  const router = useRouter();
  const { isLoggedIn, isLoading: authLoading } = useSubscription();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const autoSent = useRef(false);

  useEffect(() => {
    if (messages.length > 0) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const send = useCallback(
    async (text: string) => {
      const message = text.trim();
      if (!message || sending) return;
      trackPansyChat();
      const history = messages.map(({ role, content }) => ({ role, content }));
      setMessages((current) => [...current, { role: "user", content: message }]);
      setInput("");
      setSending(true);
      const { ok, data } = await practiceFetch<{ reply: string }>("/api/ask-pansy", {
        method: "POST",
        body: JSON.stringify({ message, history }),
      });
      setMessages((current) => [...current, { role: "assistant", content: ok && data.reply ? data.reply : TROUBLE }]);
      setSending(false);
    },
    [messages, sending],
  );

  useEffect(() => {
    const question = typeof router.query.q === "string" ? router.query.q : "";
    if (question && isLoggedIn && !autoSent.current) {
      autoSent.current = true;
      send(question);
    }
  }, [isLoggedIn, router.query.q, send]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    send(input);
  };

  return (
    <>
      <SEO title="Ask Pansy - Bloom" description="Ask Pansy about stock analysis, fair value gaps, structure, your lessons or what to learn next, in your own words." />
      <Layout>
        <div className="mx-auto flex max-w-2xl flex-col px-4 py-6">
          <header className="flex items-center gap-3">
            <BloomMark size={48} />
            <div>
              <h1 className="text-3xl font-semibold leading-tight text-foreground">Ask Pansy</h1>
              <p className="text-base text-muted-foreground">Your learning companion. No question is too small.</p>
            </div>
          </header>

          {!authLoading && !isLoggedIn ? (
            <div className="mt-6 rounded-3xl bg-card p-6 text-center shadow-[var(--bloom-shadow)]">
              <h2 className="text-xl font-semibold text-foreground">Pansy would love to meet you</h2>
              <p className="mt-1 text-base text-muted-foreground">Join free and ask as many questions as you like.</p>
              <Link href="/onboarding" className="mt-4 inline-flex h-11 items-center rounded-full bg-primary px-6 font-semibold text-primary-foreground">
                Start free
              </Link>
            </div>
          ) : (
            <>
              <div className="mt-5 space-y-3" aria-live="polite">
                {messages.length === 0 && (
                  <div className="rounded-3xl bg-accent/60 p-5">
                    <p className="text-base leading-relaxed text-foreground">
                      Hello, I&apos;m Pansy. Ask me about reading stock charts, fair value gaps, structure, your lessons or what to learn next. I&apos;ll explain things in plain language. I don&apos;t give trade calls, but I&apos;ll happily teach you how to think things through.
                    </p>
                    <div className="mt-4 flex flex-col gap-2">
                      {SUGGESTED.map((suggestion) => (
                        <motion.button
                          key={suggestion}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => send(suggestion)}
                          className="rounded-2xl border border-border bg-card p-3 text-left text-base text-foreground"
                        >
                          {suggestion}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={cn(
                      "max-w-[88%] whitespace-pre-wrap rounded-3xl p-4 text-base leading-relaxed",
                      message.role === "user" ? "ml-auto bg-primary text-primary-foreground" : "bg-card text-foreground shadow-[var(--bloom-shadow)]",
                    )}
                  >
                    {message.content}
                  </div>
                ))}

                {sending && (
                  <div className="flex w-fit items-center gap-2 rounded-3xl bg-card p-4 text-sm text-muted-foreground shadow-[var(--bloom-shadow)]">
                    <Loader2 className="h-4 w-4 animate-spin" /> Pansy is thinking...
                  </div>
                )}
                <div ref={endRef} />
              </div>

              <form onSubmit={submit} className="sticky bottom-20 mt-4 flex items-center gap-2 rounded-full border border-border bg-card p-1.5 shadow-[var(--bloom-shadow)] md:bottom-4">
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Ask anything, in your own words"
                  aria-label="Your question for Pansy"
                  className="h-11 min-w-0 flex-1 bg-transparent px-4 text-base text-foreground outline-none"
                />
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  type="submit"
                  disabled={!input.trim() || sending}
                  aria-label="Send"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-40"
                >
                  <Send className="h-5 w-5" />
                </motion.button>
              </form>
              <p className="mt-3 text-center text-xs text-muted-foreground">Pansy is an AI, can make mistakes, and doesn&apos;t give financial advice.</p>
            </>
          )}
        </div>
      </Layout>
    </>
  );
}
