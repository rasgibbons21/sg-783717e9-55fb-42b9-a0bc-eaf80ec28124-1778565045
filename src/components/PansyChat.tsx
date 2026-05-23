import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Send, Minimize2 } from "lucide-react";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: inputValue,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticker,
          companyName,
          currentPrice,
          analysisContext,
          question: inputValue,
          conversationHistory: messages,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMessage: Message = {
          role: "assistant",
          content: data.answer,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        const errorMessage: Message = {
          role: "assistant",
          content: "I'm having trouble connecting right now. Please try again in a moment 🌸",
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: "Something went wrong on my end. Let me catch my breath and try again 💛",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const suggestedQuestions = [
    "What price should I watch for entry?",
    "Is this too risky for a beginner?",
    "How does this compare to similar stocks?",
    "What's a good stop-loss level?",
  ];

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-to-br from-accent to-primary shadow-lg hover:shadow-xl transition-all z-50 p-0"
        aria-label="Chat with Pansy"
      >
        <span className="text-2xl">🌺</span>
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-[380px] h-[600px] flex flex-col bg-[#0a0a0f] border-border shadow-2xl z-50 rounded-2xl overflow-hidden">
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
            onClick={() => setIsOpen(false)}
            className="h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-sm shrink-0">
                🌺
              </div>
              <div className="flex-1">
                <Card className="p-3 bg-primary/5 border-primary/20">
                  <p className="text-sm text-foreground">
                    Hey! I've analyzed {companyName} for you. Ask me anything about the stock, the chart, the risk level, or how it might fit your portfolio 💛
                  </p>
                </Card>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground px-2">Try asking:</p>
              {suggestedQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-left h-auto py-2 px-3 border-border hover:border-primary/50 hover:bg-primary/5"
                  onClick={() => {
                    setInputValue(question);
                  }}
                >
                  <span className="text-sm text-foreground">{question}</span>
                </Button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
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
          ))
        )}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-sm shrink-0">
              🌺
            </div>
            <Card className="p-3 bg-muted/50 border-border">
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