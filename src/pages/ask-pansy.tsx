import { useState, useRef, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

const SUGGESTED = [
  "What's the difference between a stock and an ETF?",
  "I have $500 — where do I even start?",
  "How do options work?",
  "What's a good side hustle to start this month?",
];

export default function AskPansyPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: messageText, timestamp: Date.now() };
    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      let { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        ({ data: { session } } = await supabase.auth.refreshSession());
      }
      if (!session) {
        window.location.href = "/subscription";
        return;
      }

      const response = await fetch("/api/ask-pansy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ message: messageText, history }),
      });

      const data = await response.json().catch(() => ({}));

      const assistantMessage: Message = {
        role: "assistant",
        content: response.ok
          ? data.reply
          : `${data.error || "I'm having trouble connecting right now."}`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Network error: Could not reach the server.", timestamp: Date.now() },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    const text = inputValue;
    setInputValue("");
    await sendMessage(text);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Layout>
      <SEO title="Ask Pansy - Bloom" description="Ask Pansy anything — your warm AI guide for investing, money, and beyond." />

      <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-3xl flex-col px-4 py-6">
        {/* Header */}
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-accent to-primary text-2xl">
            🌺
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-primary">Ask Pansy</h1>
            <p className="text-sm text-muted-foreground">Ask me anything — money, markets, or your next side hustle.</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 space-y-4 overflow-y-auto rounded-2xl border border-border bg-[#0E1B30] p-4">
          {messages.length === 0 && !isLoading ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-primary text-sm">
                  🌺
                </div>
                <Card className="flex-1 border-primary/20 bg-primary/5 p-3">
                  <p className="text-sm text-foreground">
                    Hey love 🌸 Ask me anything. If it&apos;s about money or the markets, I&apos;ll point you to exactly where to learn it across the She Blooms Wealth family. Pick a starter below or type your own.
                  </p>
                </Card>
              </div>
              <div className="space-y-2 pt-2">
                {SUGGESTED.map((q, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    className="h-auto w-full justify-start px-3 py-2 text-left hover:border-primary/50 hover:bg-primary/5"
                    onClick={() => sendMessage(q)}
                  >
                    <span className="text-sm text-foreground">{q}</span>
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <div key={index} className={`flex items-start gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                {message.role === "assistant" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-primary text-sm">
                    🌺
                  </div>
                )}
                <Card
                  className={`max-w-[85%] p-3 ${
                    message.role === "user" ? "border-primary/30 bg-primary/20" : "border-border bg-muted/50"
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{message.content}</p>
                </Card>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-primary text-sm">
                🌺
              </div>
              <Card className="border-border bg-muted/50 p-3">
                <div className="flex gap-1">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-primary"></div>
                  <div className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: "0.1s" }}></div>
                  <div className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: "0.2s" }}></div>
                </div>
              </Card>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="mt-4">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask Pansy anything..."
              className="flex-1 border-border bg-background text-foreground"
              disabled={isLoading}
            />
            <Button onClick={handleSend} disabled={!inputValue.trim() || isLoading} size="icon" className="shrink-0 bg-primary hover:bg-primary/90">
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Educational only. Not financial advice. Pansy never recommends specific investments.
          </p>
        </div>
      </div>
    </Layout>
  );
}
