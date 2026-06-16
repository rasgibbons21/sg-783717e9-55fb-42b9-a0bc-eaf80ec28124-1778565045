import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Send, Minimize2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface PansyChatProps {
  ticker: string;
  companyName: string;
  currentPrice: number;
  analysisContext?: string;
}

export function PansyChat({ ticker, companyName, currentPrice, analysisContext }: PansyChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasAutoTriggered, setHasAutoTriggered] = useState(false);
  const [showCoachmark, setShowCoachmark] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check if coachmark should be shown (first time only)
  useEffect(() => {
    const hasSeenCoachmark = localStorage.getItem('bloom-pansy-coachmark-seen');
    if (!hasSeenCoachmark) {
      setShowCoachmark(true);
    }
  }, []);

  const dismissCoachmark = () => {
    setShowCoachmark(false);
    localStorage.setItem('bloom-pansy-coachmark-seen', 'true');
  };

  const handleButtonClick = () => {
    if (showCoachmark) {
      dismissCoachmark();
    }
    setIsOpen(true);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-trigger analysis when chat opens
  useEffect(() => {
    if (isOpen && !hasAutoTriggered && messages.length === 0) {
      setHasAutoTriggered(true);
      const autoMessage = `Analyze ${ticker} for me right now — give me the full breakdown including trend, momentum, entry consideration, exit consideration, and risk level in your warm girlfriend style`;
      sendMessage(autoMessage);
    }
  }, [isOpen, hasAutoTriggered, messages.length, ticker]);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: messageText,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch("/api/pansy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token && { Authorization: `Bearer ${session.access_token}` }),
        },
        body: JSON.stringify({
          ticker,
          message: messageText,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        const assistantMessage: Message = {
          role: "assistant",
          content: data.reply,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        const errorText = data.error || "I'm having trouble connecting right now.";
        const errorMessage: Message = {
          role: "assistant",
          content: `Error: ${errorText}`,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage: Message = {
        role: "assistant",
        content: "Network error: Could not reach the server.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    await sendMessage(inputValue);
    setInputValue("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    sendMessage(question);
  };

  const suggestedQuestions = [
    "What price should I watch for entry?",
    "Is this too risky for a beginner?",
    "How does this compare to similar stocks?",
    "What's a good stop-loss level?",
  ];

  if (!isOpen) {
    return (
      <div className="fixed bottom-[90px] right-4 z-50">
        {/* One-time Coachmark */}
        {showCoachmark && (
          <div className="absolute bottom-full right-0 mb-3 animate-bounce-subtle">
            <Card className="relative p-3 bg-accent/20 border-accent shadow-lg max-w-[200px]">
              <button
                onClick={dismissCoachmark}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-background border border-border flex items-center justify-center hover:bg-muted transition-colors"
                aria-label="Dismiss tip"
              >
                <X className="w-3 h-3" />
              </button>
              <p className="text-sm text-foreground font-medium">
                Hi love — tap me to analyze any stock
              </p>
              {/* Speech bubble tail */}
              <div className="absolute -bottom-2 right-6 w-4 h-4 bg-accent/20 border-r border-b border-accent rotate-45" />
            </Card>
          </div>
        )}

        {/* Pill-shaped button with icon + text */}
        <Button
          onClick={handleButtonClick}
          className="h-14 px-5 rounded-full bg-gradient-to-br from-accent to-primary shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
          aria-label="Ask Pansy about this stock"
        >
          <span className="text-2xl">🌺</span>
          <span className="font-semibold text-white">Ask Pansy</span>
        </Button>
      </div>
    );
  }

  return (
    <Card className="fixed bottom-[90px] right-4 w-[380px] h-[600px] flex flex-col bg-[#0a0a0f] border-border shadow-2xl z-50 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/20 to-accent/20 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-lg">
            🌺
          </div>
          <div>
            <p className="font-semibold text-foreground">Ask Pansy</p>
            <p className="text-xs text-muted-foreground">About {ticker}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => {
              setMessages([]);
              setInputValue("");
            }}
            className="h-8 w-8"
          >
            <Minimize2 className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => {
              setIsOpen(false);
              setHasAutoTriggered(false);
            }}
            className="h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !isLoading ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-sm shrink-0">
                🌺
              </div>
              <div className="flex-1">
                <Card className="p-3 bg-primary/5 border-primary/20">
                  <p className="text-sm text-foreground">
                    Hey! Let me analyze {companyName} for you... 💛
                  </p>
                </Card>
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 ${
                  message.role === "user" ? "flex-row-reverse" : ""
                }`}
              >
                {message.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-sm shrink-0">
                    🌺
                  </div>
                )}
                <Card
                  className={`p-3 max-w-[85%] ${
                    message.role === "user"
                      ? "bg-primary/20 border-primary/30"
                      : "bg-muted/50 border-border"
                  }`}
                >
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </Card>
              </div>
            ))}
            
            {messages.length > 0 && !isLoading && (
              <div className="space-y-2 pt-2">
                <p className="text-xs text-muted-foreground px-2">Ask me more:</p>
                {suggestedQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-left h-auto py-2 px-3 border-border hover:border-primary/50 hover:bg-primary/5"
                    onClick={() => handleSuggestedQuestion(question)}
                  >
                    <span className="text-sm text-foreground">{question}</span>
                  </Button>
                ))}
              </div>
            )}
          </>
        )}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-sm shrink-0">
              🌺
            </div>
            <Card className="p-3 bg-muted/50 border-border">
              <p className="text-xs text-muted-foreground mb-2">Pansy is typing...</p>
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
              </div>
            </Card>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-card">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about entry price, risk, comparison..."
            className="flex-1 bg-background border-border text-foreground"
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            size="icon"
            className="bg-primary hover:bg-primary/90 shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Educational only. Not financial advice.
        </p>
      </div>
    </Card>
  );
}